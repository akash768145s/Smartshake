import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Razorpay test keys from rzp-key.csv
// key_id: rzp_test_RfxCaQGgFsdSRu
// key_secret: XnUkIhgRiEoRf7KoRkChdtwH

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RfxCaQGgFsdSRu',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'XnUkIhgRiEoRf7KoRkChdtwH',
});

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_RfxCaQGgFsdSRu';

