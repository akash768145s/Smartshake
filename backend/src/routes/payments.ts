import express from 'express';
import crypto from 'crypto';
import { razorpay, RAZORPAY_KEY_ID } from '../config/razorpay';

const router = express.Router();

// POST /api/payments/create-order - Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Amount should be in paise (smallest currency unit)
    // If amount is in rupees, multiply by 100
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create payment order',
      message: error?.message || 'Unknown error'
    });
  }
});

// POST /api/payments/verify - Verify payment signature
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification data' });
    }

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'XnUkIhgRiEoRf7KoRkChdtwH');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    const isSignatureValid = generatedSignature === razorpay_signature;

    if (isSignatureValid) {
      res.json({ 
        verified: true,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });
    } else {
      res.status(400).json({ 
        verified: false,
        error: 'Invalid payment signature'
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error?.message || 'Unknown error'
    });
  }
});

export default router;

