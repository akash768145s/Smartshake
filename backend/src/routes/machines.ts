import express from 'express';
import { db } from '../config/firebase';
import { Machine } from '../types';

const router = express.Router();

// GET /api/machines - Get all machines
router.get('/', async (req, res) => {
  try {
    const machinesSnapshot = await db.collection('machines').get();
    const machines: Machine[] = machinesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastClean: data.lastClean?.toDate() || new Date(),
        lastPing: data.lastPing?.toDate() || new Date(),
      };
    }) as Machine[];

    res.json(machines);
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

// GET /api/machines/:id - Get a specific machine
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('machines').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    const data = doc.data()!;
    const machine: Machine = {
      id: doc.id,
      ...data,
      lastClean: data.lastClean?.toDate() || new Date(),
      lastPing: data.lastPing?.toDate() || new Date(),
    } as Machine;

    res.json(machine);
  } catch (error) {
    console.error('Error fetching machine:', error);
    res.status(500).json({ error: 'Failed to fetch machine' });
  }
});

// PATCH /api/machines/:id - Update machine data
router.patch('/:id', async (req, res) => {
  try {
    const machineRef = db.collection('machines').doc(req.params.id);
    const updateData: any = { ...req.body };

    // Convert Date strings to Firestore Timestamps
    if (updateData.lastClean) {
      updateData.lastClean = new Date(updateData.lastClean);
    }
    if (updateData.lastPing) {
      updateData.lastPing = new Date(updateData.lastPing);
    }

    await machineRef.update(updateData);

    const updatedDoc = await machineRef.get();
    const data = updatedDoc.data()!;
    const machine: Machine = {
      id: updatedDoc.id,
      ...data,
      lastClean: data.lastClean?.toDate() || new Date(),
      lastPing: data.lastPing?.toDate() || new Date(),
    } as Machine;

    res.json(machine);
  } catch (error) {
    console.error('Error updating machine:', error);
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

// POST /api/machines - Create a new machine
router.post('/', async (req, res) => {
  try {
    const machineData: Omit<Machine, 'id'> = {
      name: req.body.name,
      location: req.body.location,
      status: req.body.status || 'offline',
      uptime7d: req.body.uptime7d || 0,
      dispenses24h: req.body.dispenses24h || 0,
      milkLevel: req.body.milkLevel || 0,
      waterLevel: req.body.waterLevel || 0,
      powderLevels: req.body.powderLevels || {},
      lastClean: req.body.lastClean ? new Date(req.body.lastClean) : new Date(),
      lastPing: req.body.lastPing ? new Date(req.body.lastPing) : new Date(),
      revenue24h: req.body.revenue24h || 0,
    };

    const docRef = await db.collection('machines').add(machineData);
    const machine: Machine = {
      id: docRef.id,
      ...machineData,
    };

    res.status(201).json(machine);
  } catch (error) {
    console.error('Error creating machine:', error);
    res.status(500).json({ error: 'Failed to create machine' });
  }
});

// POST /api/machines/seed-demo - Seed demo machines (MACHINE-001 to MACHINE-010)
router.post('/seed-demo', async (req, res) => {
  try {
    const DEMO_MACHINES = [
      { id: 'MACHINE-001', location: 'Chennai' },
      { id: 'MACHINE-002', location: 'Mumbai' },
      { id: 'MACHINE-003', location: 'Delhi' },
      { id: 'MACHINE-004', location: 'Hyderabad' },
      { id: 'MACHINE-005', location: 'Pune' },
      { id: 'MACHINE-006', location: 'Kochi' },
      { id: 'MACHINE-007', location: 'Jaipur' },
      { id: 'MACHINE-008', location: 'Bengaluru' },
      { id: 'MACHINE-009', location: 'Ahmedabad' },
      { id: 'MACHINE-010', location: 'Kolkata' },
    ];

    const batch = db.batch();
    let addedCount = 0;
    let existingCount = 0;

    for (const demoMachine of DEMO_MACHINES) {
      const existingMachines = await db
        .collection('machines')
        .where('name', '==', demoMachine.id)
        .get();
      
      if (existingMachines.empty) {
        const ref = db.collection('machines').doc();
        batch.set(ref, {
          name: demoMachine.id,
          location: demoMachine.location,
          status: 'online',
          uptime7d: 98 + Math.random() * 2,
          dispenses24h: Math.floor(Math.random() * 100) + 50,
          milkLevel: 30 + Math.random() * 70,
          waterLevel: 40 + Math.random() * 60,
          powderLevels: {
            Chocolate: 30 + Math.random() * 70,
            Vanilla: 20 + Math.random() * 80,
            Strawberry: 25 + Math.random() * 75,
            Banana: 35 + Math.random() * 65,
            Coffee: 40 + Math.random() * 60,
          },
          lastClean: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000),
          lastPing: new Date(),
          revenue24h: Math.floor(Math.random() * 5000) + 2000,
        });
        addedCount++;
      } else {
        existingCount++;
      }
    }

    if (addedCount > 0) {
      await batch.commit();
    }

    res.json({
      success: true,
      message: `Demo machines seeded: ${addedCount} added, ${existingCount} already existed`,
      added: addedCount,
      existing: existingCount,
    });
  } catch (error) {
    console.error('Error seeding demo machines:', error);
    res.status(500).json({ error: 'Failed to seed demo machines' });
  }
});

export default router;

