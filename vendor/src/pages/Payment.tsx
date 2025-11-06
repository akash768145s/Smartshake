import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';
import BrandLogo from '@/components/BrandLogo';
import { api } from '@/lib/api';

const Payment = () => {
  const navigate = useNavigate();
  const { order } = useOrder();
  const [isProcessing, setIsProcessing] = useState(false);
  const [flavoursMap, setFlavoursMap] = useState<Record<string, string>>({}); // name -> Firestore ID
  const [machineId, setMachineId] = useState<string | undefined>();

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

        // Fetch first machine ID (or use env var)
        try {
          const machines = await api.getMachines();
          if (machines.length > 0) {
            setMachineId(machines[0].id);
          }
        } catch (error) {
          // If machines API fails, use env var or leave undefined
          setMachineId(import.meta.env.VITE_MACHINE_ID);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Continue anyway - will use mock mode if API fails
      }
    };
    fetchData();
  }, []);

  const handlePayment = async (method: 'upi' | 'card') => {
    // Validate order is complete
    if (!order.base) {
      toast.error('Please select a base (milk or water)');
      navigate('/base');
      return;
    }
    if (order.quantity === 0 || !order.quantity) {
      toast.error('Please select a quantity');
      navigate('/quantity');
      return;
    }
    if (Object.keys(order.flavours).length === 0) {
      toast.error('Please select at least one flavour');
      navigate('/flavour');
      return;
    }

    setIsProcessing(true);
    toast.success(`Processing ${method.toUpperCase()} payment...`);

    try {
      const volumeInMl = order.quantity * 5;
      
      // Map flavour names (chocolate, vanilla, etc.) to Firestore document IDs
      const flavoursWithIds: Record<string, number> = {};
      for (const [flavourName, scoops] of Object.entries(order.flavours)) {
        const firestoreId = flavoursMap[flavourName.toLowerCase()];
        if (firestoreId && scoops > 0) {
          flavoursWithIds[firestoreId] = scoops;
        } else {
          console.warn(`Flavour "${flavourName}" not found in flavoursMap. Available:`, Object.keys(flavoursMap));
        }
      }

      // If no flavours mapped (API failed or flavours not loaded), use mock mode
      if (Object.keys(flavoursWithIds).length === 0) {
        console.error('No flavours mapped! Order flavours:', order.flavours, 'Flavours map:', flavoursMap);
        toast.error('Failed to map flavours. Please try again.');
        setIsProcessing(false);
        return;
      }

      console.log('Creating order with:', {
        base: order.base,
        quantity: volumeInMl,
        total_price: order.totalPrice,
        flavours: flavoursWithIds,
        machineId: machineId || import.meta.env.VITE_MACHINE_ID,
        flavoursCount: Object.keys(flavoursWithIds).length,
      });

      // Validate before sending
      if (!order.base) {
        toast.error('Please select a base (milk or water)');
        setIsProcessing(false);
        return;
      }
      if (volumeInMl <= 0) {
        toast.error('Please select a quantity');
        setIsProcessing(false);
        return;
      }
      if (order.totalPrice <= 0) {
        toast.error('Invalid order total');
        setIsProcessing(false);
        return;
      }

      // Create real order in Firestore
      // Use machineId from state (fetched from API) or env var
      console.log('Calling API to create order...');
      const { order: createdOrder } = await api.createOrder({
        base: order.base,
        quantity: volumeInMl,
        total_price: order.totalPrice,
        flavours: flavoursWithIds,
        machineId: machineId || import.meta.env.VITE_MACHINE_ID,
      });

      console.log('✅ Order created successfully:', createdOrder.id);

      // Store order ID in sessionStorage for dispense page
      sessionStorage.setItem('currentOrderId', createdOrder.id);
      sessionStorage.removeItem('orderStatus'); // Clear mock flag
      
      toast.success('Payment successful!');
      setTimeout(() => {
        navigate('/dispense');
      }, 2000);
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        flavours: order.flavours,
        flavoursMap,
        machineId,
      });
      toast.error(`Failed to create order: ${error?.message || 'Unknown error'}`);
      setIsProcessing(false);
      // Don't fallback to mock mode - let user retry
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
              UPI / QR Code
            </h3>
            <p className="text-lg text-muted-foreground mt-3">Scan & Pay</p>
          </button>
        </div>
      </div>

      <div className="flex justify-start flex-shrink-0">
        <Button
          variant="kioskSecondary"
          size="kiosk"
          onClick={() => navigate('/quantity')}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default Payment;
