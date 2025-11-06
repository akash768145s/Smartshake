import express from 'express';
import { db } from '../config/firebase';
import { Sale, Order, OrderItem } from '../types';

const router = express.Router();

// GET /api/sales - Get sales data with optional filters
router.get('/', async (req, res) => {
  try {
    const { machineId, days, startDate, endDate } = req.query;

    // Only query by status (equality filter - no index needed)
    // We'll filter by machineId and date in memory to avoid composite index requirements
    const ordersQuery = db.collection('orders').where('status', '==', 'completed');
    const ordersSnapshot = await ordersQuery.get();
    console.log(`📊 Sales query: Found ${ordersSnapshot.docs.length} completed orders`);

    // Filter by machineId and date range in memory (to avoid Firestore composite index requirement)
    let filteredDocs = ordersSnapshot.docs;
    
    // Filter by machineId if provided
    if (machineId) {
      filteredDocs = filteredDocs.filter(doc => doc.data().machineId === machineId);
    }
    
    if (days) {
      const daysNum = parseInt(days as string);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysNum);
      filteredDocs = filteredDocs.filter(doc => {
        const docDate = doc.data().created_at?.toDate();
        return docDate && docDate >= cutoffDate;
      });
    } else if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      filteredDocs = filteredDocs.filter(doc => {
        const docDate = doc.data().created_at?.toDate();
        return docDate && docDate >= start && docDate <= end;
      });
    }

    // Sort by created_at descending in memory
    const sortedDocs = filteredDocs.sort((a, b) => {
      const aTime = a.data().created_at?.toDate()?.getTime() || 0;
      const bTime = b.data().created_at?.toDate()?.getTime() || 0;
      return bTime - aTime; // Descending order
    });
    
    const sales: Sale[] = [];
    
    for (const orderDoc of sortedDocs) {
      const orderData = orderDoc.data();
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

      // Get flavour names
      const flavours: Array<{ name: string; scoops: number }> = [];
      for (const item of orderItems) {
        const flavourDoc = await db.collection('flavours').doc(item.flavour_id).get();
        if (flavourDoc.exists) {
          flavours.push({
            name: flavourDoc.data()?.name || 'Unknown',
            scoops: item.scoops,
          });
        }
      }

      // Get machine name
      let machineName = 'Unknown Machine';
      if (order.machineId) {
        const machineDoc = await db.collection('machines').doc(order.machineId).get();
        if (machineDoc.exists) {
          machineName = machineDoc.data()?.name || 'Unknown Machine';
        }
      }

      // Calculate duration (simplified - you might want to track this separately)
      const duration = order.completed_at && order.created_at
        ? Math.round((order.completed_at.getTime() - order.created_at.getTime()) / 1000)
        : 20; // Default 20 seconds

      const sale: Sale = {
        id: order.id,
        machineId: order.machineId || '',
        machineName,
        flavours,
        quantity: order.quantity,
        total: order.total_price,
        base: order.base,
        timestamp: order.created_at,
        duration,
      };

      sales.push(sale);
    }

    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// GET /api/sales/stats - Get sales statistics
router.get('/stats', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysNum);

    // Fetch all completed orders, then filter by date in memory to avoid index requirement
    const ordersSnapshot = await db
      .collection('orders')
      .where('status', '==', 'completed')
      .get();
    
    // Filter by date in memory
    const filteredDocs = ordersSnapshot.docs.filter(doc => {
      const docDate = doc.data().created_at?.toDate();
      return docDate && docDate >= cutoffDate;
    });

    const totalRevenue = filteredDocs.reduce(
      (sum, doc) => sum + (doc.data().total_price || 0),
      0
    );
    const totalOrders = filteredDocs.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      period: `${daysNum} days`,
    });
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: 'Failed to fetch sales stats' });
  }
});

export default router;

