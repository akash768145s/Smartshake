import express from 'express';
import { db } from '../config/firebase';
import { Alert } from '../types';

const router = express.Router();

// GET /api/alerts - Get all alerts with optional filters
router.get('/', async (req, res) => {
  try {
    const { machineId, status, severity } = req.query;

    let alertsQuery: FirebaseFirestore.Query = db.collection('alerts');

    if (machineId) {
      alertsQuery = alertsQuery.where('machineId', '==', machineId);
    }
    if (status) {
      alertsQuery = alertsQuery.where('status', '==', status);
    }
    if (severity) {
      alertsQuery = alertsQuery.where('severity', '==', severity);
    }

    // Remove orderBy to avoid index requirement - we'll sort in memory instead
    const alertsSnapshot = await alertsQuery.get();
    
    // Sort by timestamp descending in memory
    const sortedDocs = alertsSnapshot.docs.sort((a, b) => {
      const aTime = a.data().timestamp?.toDate()?.getTime() || 0;
      const bTime = b.data().timestamp?.toDate()?.getTime() || 0;
      return bTime - aTime; // Descending order
    });
    
    const alerts: Alert[] = sortedDocs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    }) as Alert[];

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts - Create a new alert
router.post('/', async (req, res) => {
  try {
    const alertData: Omit<Alert, 'id'> = {
      machineId: req.body.machineId,
      machineName: req.body.machineName,
      severity: req.body.severity,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
      status: req.body.status || 'open',
      occurrences: req.body.occurrences || 1,
    };

    const docRef = await db.collection('alerts').add(alertData);
    const alert: Alert = {
      id: docRef.id,
      ...alertData,
    };

    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// PATCH /api/alerts/:id - Update alert status
router.patch('/:id', async (req, res) => {
  try {
    const alertRef = db.collection('alerts').doc(req.params.id);
    const updateData: any = { ...req.body };

    if (updateData.timestamp) {
      updateData.timestamp = new Date(updateData.timestamp);
    }

    await alertRef.update(updateData);

    const updatedDoc = await alertRef.get();
    const data = updatedDoc.data()!;
    const alert: Alert = {
      id: updatedDoc.id,
      ...data,
      timestamp: data.timestamp?.toDate() || new Date(),
    } as Alert;

    res.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

export default router;

