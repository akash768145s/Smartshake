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

export default router;

