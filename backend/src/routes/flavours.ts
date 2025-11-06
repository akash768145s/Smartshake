import express from 'express';
import { db } from '../config/firebase';
import { Flavour } from '../types';

const router = express.Router();

// GET /api/flavours - Get all available flavours
router.get('/', async (req, res) => {
  try {
    const flavoursSnapshot = await db.collection('flavours').get();
    const flavours: Flavour[] = flavoursSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate() || new Date(),
    })) as Flavour[];

    res.json(flavours);
  } catch (error) {
    console.error('Error fetching flavours:', error);
    res.status(500).json({ error: 'Failed to fetch flavours' });
  }
});

// GET /api/flavours/:id - Get a specific flavour
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('flavours').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Flavour not found' });
    }

    const flavour = {
      id: doc.id,
      ...doc.data(),
      created_at: doc.data()?.created_at?.toDate() || new Date(),
    } as Flavour;

    res.json(flavour);
  } catch (error) {
    console.error('Error fetching flavour:', error);
    res.status(500).json({ error: 'Failed to fetch flavour' });
  }
});

export default router;

