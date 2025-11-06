import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import { PartyPopper } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const Done = () => {
  const navigate = useNavigate();
  const { resetOrder } = useOrder();

  useEffect(() => {
    // Clear order ID from session
    sessionStorage.removeItem('currentOrderId');
    
    const timer = setTimeout(() => {
      resetOrder();
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, resetOrder]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-12 animate-fade-in relative overflow-hidden">
      <BrandLogo />
      {/* Confetti Elements */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-4 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '0',
            backgroundColor: ['#39FF14', '#FF6B35', '#FFD700'][i % 3],
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <div className="glass-card rounded-3xl p-16 max-w-4xl w-full text-center relative z-10">
        <PartyPopper className="w-40 h-40 mx-auto mb-12 text-primary animate-bounce" />
        
        <h1 className="text-8xl font-black uppercase tracking-tight mb-8 neon-text">
          Done!
        </h1>
        
        <h2 className="text-5xl font-bold mb-8">
          Your <span className="text-primary">Smartshake</span> is Ready! 🎉
        </h2>
        
        <p className="text-3xl text-muted-foreground mb-12">
          Collect your shake from the dispenser below
        </p>
        
        <div className="mb-12">
          <div className="inline-flex items-center gap-4 glass-card px-8 py-4 rounded-full">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
            <span className="text-2xl font-semibold">Returning to start in 10 seconds...</span>
          </div>
        </div>

        <Button
          variant="kiosk"
          size="kioskLg"
          onClick={() => {
            sessionStorage.removeItem('currentOrderId');
            resetOrder();
            navigate('/');
          }}
          className="animate-pulse-glow"
        >
          Start New Order
        </Button>
      </div>
    </div>
  );
};

export default Done;
