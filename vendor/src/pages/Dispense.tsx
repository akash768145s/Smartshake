import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BrandLogo from '@/components/BrandLogo';
import { api } from '@/lib/api';

const Dispense = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const orderId = sessionStorage.getItem('currentOrderId');

  useEffect(() => {
    if (!orderId) {
      toast.error('No order found');
      navigate('/');
      return;
    }

    // Check if this is a real order (not mock)
    const isMockMode = sessionStorage.getItem('orderStatus') === 'completed';

    // Update order status via API (only for real orders)
    if (!isMockMode) {
      api.updateOrderStatus(orderId, 'preparing').catch((error) => {
        console.error('Failed to update order status:', error);
      });
    }

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    // Update statuses based on progress
    const statusTimer1 = setTimeout(() => {
      if (!isMockMode && orderId) {
        api.updateOrderStatus(orderId, 'dispensing').catch((error) => {
          console.error('Failed to update order status:', error);
        });
      }
    }, 3000);

    const statusTimer2 = setTimeout(() => {
      if (orderId) {
        if (!isMockMode) {
          // Mark order as completed and set completed_at timestamp
          api.updateOrderStatus(orderId, 'completed').catch((error) => {
            console.error('Failed to update order status:', error);
          });
        }
        navigate('/done');
      }
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
    };
  }, [navigate, orderId]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-12 animate-fade-in">
      <BrandLogo />
      <div className="glass-card rounded-3xl p-16 max-w-4xl w-full text-center">
        <Loader2 className="w-40 h-40 mx-auto mb-12 text-primary animate-spin" />
        
        <h1 className="text-7xl font-black uppercase tracking-tight mb-8">
          Preparing Your <span className="text-primary neon-text">Smartshake</span>
        </h1>
        
        <p className="text-3xl text-muted-foreground mb-12">
          Mixing the perfect blend just for you...
        </p>
        
        <div className="space-y-6">
          <Progress value={progress} className="h-8" />
          
          <div className="flex justify-between text-xl text-muted-foreground">
            <span className={progress > 20 ? 'text-primary' : ''}>✓ Payment Confirmed</span>
            <span className={progress > 50 ? 'text-primary' : ''}>✓ Mixing Ingredients</span>
            <span className={progress > 80 ? 'text-primary font-semibold' : ''}>
              {progress > 80 ? '⟳ Dispensing...' : 'Waiting...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dispense;
