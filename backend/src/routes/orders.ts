import express from 'express';
import { db } from '../config/firebase';
import { Order, OrderItem } from '../types';

const router = express.Router();

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const { base, quantity, total_price, flavours, machineId, machineName, idempotencyKey } = req.body;

    console.log('📦 Order creation request:', {
      base,
      quantity,
      total_price,
      flavours: flavours ? Object.keys(flavours).length + ' flavours' : 'missing',
      machineId,
      machineName,
      idempotencyKey,
    });

    // Check for duplicate request using idempotency key
    if (idempotencyKey) {
      const existingOrder = await db.collection('orders')
        .where('idempotencyKey', '==', idempotencyKey)
        .limit(1)
        .get();
      
      if (!existingOrder.empty) {
        const existingDoc = existingOrder.docs[0];
        const existingOrderData = existingDoc.data();
        const existingItemsSnapshot = await db
          .collection('order_items')
          .where('order_id', '==', existingDoc.id)
          .get();
        
        const existingOrderItems = existingItemsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date(),
        })) as OrderItem[];

        console.log('⚠️ Duplicate request detected, returning existing order:', existingDoc.id);
        return res.status(200).json({
          order: {
            id: existingDoc.id,
            ...existingOrderData,
            created_at: existingOrderData.created_at?.toDate() || new Date(),
            completed_at: existingOrderData.completed_at?.toDate(),
          },
          orderItems: existingOrderItems,
        });
      }
    }

    // Validate required fields
    if (!base) {
      return res.status(400).json({ error: 'Missing required field: base' });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Missing or invalid field: quantity (must be > 0)' });
    }
    if (total_price === undefined || total_price === null) {
      return res.status(400).json({ error: 'Missing required field: total_price' });
    }
    if (!flavours || Object.keys(flavours).length === 0) {
      return res.status(400).json({ error: 'Missing or empty field: flavours (must have at least one flavour)' });
    }

    // If machineName not provided but machineId is, try to fetch machine name
    // Machines collection is optional - if it doesn't exist, continue without it
    let finalMachineName = machineName;
    if (!finalMachineName && machineId) {
      try {
        const machineDoc = await db.collection('machines').doc(machineId).get();
        if (machineDoc.exists) {
          finalMachineName = machineDoc.data()?.name;
        }
      } catch (error) {
        // Machines collection might not exist - that's okay
        console.warn('Could not fetch machine name (machines collection may not exist):', error);
      }
    }

    // Create order
    const orderRef = db.collection('orders').doc();
    const orderData: Omit<Order, 'id'> & { idempotencyKey?: string } = {
      base,
      quantity,
      total_price,
      status: 'pending',
      created_at: new Date(),
      ...(machineId && { machineId }),
      ...(finalMachineName && { machineName: finalMachineName }),
      ...(idempotencyKey && { idempotencyKey }),
    };

    await orderRef.set(orderData);
    console.log(`✅ Order created: ${orderRef.id}`, { status: 'pending', machineId, machineName: finalMachineName, total_price });

    // Create order items
    const orderItems: OrderItem[] = [];
    for (const [flavourId, scoops] of Object.entries(flavours)) {
      if (typeof scoops === 'number' && scoops > 0) {
        // Get flavour price - flavours collection is optional, default to 99 if not found
        let pricePerScoop = 99;
        try {
          const flavourDoc = await db.collection('flavours').doc(flavourId).get();
          if (flavourDoc.exists) {
            pricePerScoop = flavourDoc.data()?.price_per_scoop || 99;
          }
        } catch (error) {
          // Flavours collection might not exist - use default price
          console.warn(`Could not fetch flavour price for ${flavourId}, using default 99`);
        }

        const itemRef = db.collection('order_items').doc();
        const itemData: Omit<OrderItem, 'id'> = {
          order_id: orderRef.id,
          flavour_id: flavourId,
          scoops: scoops as number,
          price_per_scoop: pricePerScoop,
          created_at: new Date(),
          ...(machineId && { machine_id: machineId }),
          ...(finalMachineName && { machine_name: finalMachineName }),
        };

        await itemRef.set(itemData);
        orderItems.push({ id: itemRef.id, ...itemData });
      }
    }

    const order: Order = {
      id: orderRef.id,
      ...orderData,
    };

    res.status(201).json({ order, orderItems });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - Get all orders (for debugging)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let ordersQuery: FirebaseFirestore.Query = db.collection('orders');
    
    if (status) {
      ordersQuery = ordersQuery.where('status', '==', status);
    }
    
    const ordersSnapshot = await ordersQuery.get();
    const orders = ordersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate() || new Date(),
        completed_at: data.completed_at?.toDate(),
      };
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get a specific order
router.get('/:id', async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.id).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data()!;
    const order: Order = {
      id: orderDoc.id,
      ...orderData,
      created_at: orderData.created_at?.toDate() || new Date(),
      completed_at: orderData.completed_at?.toDate(),
    } as Order;

    // Get order items
    const itemsSnapshot = await db
      .collection('order_items')
      .where('order_id', '==', orderDoc.id)
      .get();

    const orderItems: OrderItem[] = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    })) as OrderItem[];

    res.json({ order, orderItems });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'dispensing', 'completed', 'failed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const orderRef = db.collection('orders').doc(req.params.id);
    const updateData: any = { status };

    if (status === 'completed') {
      updateData.completed_at = new Date();
    }

    await orderRef.update(updateData);
    console.log(`✅ Order status updated: ${req.params.id} -> ${status}`);

    const updatedDoc = await orderRef.get();
    const order: Order = {
      id: updatedDoc.id,
      ...updatedDoc.data()!,
      created_at: updatedDoc.data()!.created_at?.toDate() || new Date(),
      completed_at: updatedDoc.data()!.completed_at?.toDate(),
    } as Order;

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;

