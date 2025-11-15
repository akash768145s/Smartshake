import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import { QrCode, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import BrandLogo from '@/components/BrandLogo';
import { api } from '@/lib/api';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment = () => {
  const navigate = useNavigate();
  const { order } = useOrder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [flavoursMap, setFlavoursMap] = useState<Record<string, string>>({}); // name -> Firestore ID
  const [machineId, setMachineId] = useState<string | undefined>();
  const [machineName, setMachineName] = useState<string | undefined>();

  // Validate order completeness on mount
  useEffect(() => {
    if (!order.base) {
      toast.error('Please select a base first');
      navigate('/base');
      return;
    }
    if (order.quantity === 0 || !order.quantity) {
      toast.error('Please select a quantity first');
      navigate('/quantity');
      return;
    }
    if (Object.keys(order.flavours).length === 0) {
      toast.error('Please select flavours first');
      navigate('/flavour');
      return;
    }
  }, [order, navigate]);

  // Fetch flavours and machine ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch flavours to map names to Firestore IDs
        const flavours = await api.getFlavours();
        const map: Record<string, string> = {};
        flavours.forEach(flavour => {
          // Map lowercase name to Firestore ID
          map[flavour.name.toLowerCase()] = flavour.id;
        });
        setFlavoursMap(map);

        // Find machine ID and name by matching selected machine
        try {
          const machines = await api.getMachines();
          if (order.selectedMachine && machines.length > 0) {
            // Try to find machine by name (MACHINE-001, etc.)
            const matchedMachine = machines.find(
              m => m.name === order.selectedMachine?.id
            );
            if (matchedMachine) {
              setMachineId(matchedMachine.id);
              setMachineName(matchedMachine.name);
            } else {
              // Fallback: use selectedMachine.id as machine name if not found in API
              setMachineId(import.meta.env.VITE_MACHINE_ID);
              setMachineName(order.selectedMachine.id);
            }
          } else {
            // No machine selected, use env var or default
            setMachineId(import.meta.env.VITE_MACHINE_ID);
            // Try to get machine name from API if we have machineId
            if (import.meta.env.VITE_MACHINE_ID && machines.length > 0) {
              const envMachine = machines.find(m => m.id === import.meta.env.VITE_MACHINE_ID);
              if (envMachine) {
                setMachineName(envMachine.name);
              }
            }
          }
        } catch (error) {
          setMachineId(import.meta.env.VITE_MACHINE_ID);
          // If we have selectedMachine, use its id as name
          if (order.selectedMachine) {
            setMachineName(order.selectedMachine.id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [order.selectedMachine]);

  const prepareOrderData = () => {
    const volumeInMl = order.quantity * 5;
    
    // Map flavour names to Firestore document IDs
    const fallbackFlavourMap: Record<string, string> = {
      'chocolate': 'chocolate',
      'vanilla': 'vanilla',
      'strawberry': 'strawberry',
      'banana': 'banana',
      'coffee': 'coffee',
    };

    const flavoursWithIds: Record<string, number> = {};
    for (const [flavourName, scoops] of Object.entries(order.flavours)) {
      if (scoops > 0) {
        const firestoreId = flavoursMap[flavourName.toLowerCase()];
        if (firestoreId) {
          flavoursWithIds[firestoreId] = scoops;
        } else {
          const fallbackId = fallbackFlavourMap[flavourName.toLowerCase()] || flavourName.toLowerCase();
          flavoursWithIds[fallbackId] = scoops;
        }
      }
    }

    return {
      volumeInMl,
      flavoursWithIds,
      idempotencyKey: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  };

  const handlePayment = async (method: 'upi' | 'card') => {
    // Prevent duplicate submissions
    if (isProcessing) {
      return;
    }

    // Validate order is complete
    if (!order.base || order.quantity === 0 || Object.keys(order.flavours).length === 0) {
      toast.error('Please complete your order first');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const { volumeInMl, flavoursWithIds, idempotencyKey } = prepareOrderData();

      // Step 1: Create Razorpay order
      toast.loading('Initializing payment...');
      const razorpayOrder = await api.createPaymentOrder({
        amount: order.totalPrice,
        currency: 'INR',
        receipt: `smartshake_${Date.now()}`,
        notes: {
          machineId: machineId || import.meta.env.VITE_MACHINE_ID || 'unknown',
          base: order.base,
          quantity: volumeInMl.toString(),
        },
      });

      // Step 2: Open Razorpay checkout
      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Smartshake',
        description: 'Protein Shake Order',
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment signature
            toast.loading('Verifying payment...');
            const verification = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verification.verified) {
              toast.error('Payment verification failed');
              setIsProcessing(false);
              return;
            }

            // Step 4: Create order in Firestore only after successful payment
            // Capture machine info before creating order (closure variable)
            const finalMachineId = machineId || import.meta.env.VITE_MACHINE_ID || 'machine-1';
            // Prioritize: stored machineName > selectedMachine.id > default
            const finalMachineName = machineName || order.selectedMachine?.id || finalMachineId || 'Machine-1';
            
            console.log('Creating order with machine info:', {
              machineId: finalMachineId,
              machineName: finalMachineName,
              selectedMachine: order.selectedMachine,
            });
            
            toast.loading('Creating your order...');
            const { order: createdOrder } = await api.createOrder({
              base: order.base,
              quantity: volumeInMl,
              total_price: order.totalPrice,
              flavours: flavoursWithIds,
              machineId: finalMachineId,
              machineName: finalMachineName,
              idempotencyKey,
            });

            // Store order ID and payment info
            sessionStorage.setItem('currentOrderId', createdOrder.id);
            sessionStorage.setItem('razorpayPaymentId', response.razorpay_payment_id);
            sessionStorage.setItem('razorpayOrderId', response.razorpay_order_id);
            
            toast.success('Payment successful!');
            setTimeout(() => {
              navigate('/dispense');
            }, 1000);
          } catch (error: any) {
            console.error('Error processing payment:', error);
            toast.error(`Payment processing failed: ${error?.message || 'Unknown error'}`);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@smartshake.com',
          contact: '9999999999',
        },
        theme: {
          color: '#6366f1', // Primary color
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
        },
      };

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        setIsProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      toast.error(`Payment initialization failed: ${error?.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  const formatFlavours = () => {
    return Object.entries(order.flavours)
      .map(([id, count]) => `${id.charAt(0).toUpperCase() + id.slice(1)} (${count}x)`)
      .join(' + ');
  };

  const totalScoops = Object.values(order.flavours).reduce((sum, count) => sum + count, 0);
  const flavourCost = totalScoops * 99;
  const volumeInMl = order.quantity * 5;
  const baseCost = order.base === 'milk' ? Math.round((volumeInMl / 200) * 15) : 0;

  return (
    <div className="h-screen w-full p-6 flex flex-col animate-fade-in">
      <BrandLogo />
      <div className="mb-6">
        <h1 className="text-5xl font-black uppercase tracking-tight mb-3">
          <span className="text-primary neon-text">Payment</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Review your order and proceed to payment
        </p>
      </div>

      <div className="flex-1 flex gap-8">
        {/* Order Summary */}
        <div className="flex-1 glass-card rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6 uppercase tracking-wide">Order Summary</h2>
          
          <div className="space-y-4 text-xl">
            <div className="flex justify-between items-start pb-3 border-b border-border">
              <span className="text-muted-foreground">Flavours:</span>
              <div className="text-right">
                <div className="font-semibold">{formatFlavours()}</div>
                <div className="text-base text-muted-foreground">₹{flavourCost}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-muted-foreground">Base:</span>
              <div className="text-right">
                <div className="font-semibold capitalize">{order.base}</div>
                <div className="text-base text-muted-foreground">₹{baseCost}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-muted-foreground">Quantity:</span>
              <span className="font-semibold">{volumeInMl}ml</span>
            </div>
            
            <div className="flex justify-between items-center pt-4 text-3xl">
              <span className="font-bold">Total:</span>
              <span className="font-black text-primary neon-text">₹{order.totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex-1 flex flex-col gap-6">
          <button
            onClick={() => handlePayment('upi')}
            disabled={isProcessing}
            className="flex-1 glass-card rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:ring-4 hover:ring-primary group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <QrCode className="w-24 h-24 mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-3xl font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
              Pay with Razorpay
            </h3>
            <p className="text-lg text-muted-foreground mt-3">UPI, Cards, Wallets & More</p>
          </button>

          <button
            onClick={() => handlePayment('card')}
            disabled={isProcessing}
            className="flex-1 glass-card rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:ring-4 hover:ring-primary group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-24 h-24 mb-4 text-primary group-hover:scale-110 transition-transform" />
            <h3 className="text-3xl font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
              Card Payment
            </h3>
            <p className="text-lg text-muted-foreground mt-3">Credit & Debit Cards</p>
          </button>
        </div>
      </div>

      <div className="flex justify-start flex-shrink-0">
        <Button
          variant="kioskSecondary"
          size="kiosk"
          onClick={() => navigate('/quantity')}
          disabled={isProcessing}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default Payment;
