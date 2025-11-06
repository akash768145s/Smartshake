import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import brandName from '@/assets/brand-name.png';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-background/95">
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 text-center animate-fade-in">
        <img 
          src={brandName} 
          alt="Smartshake Vending" 
          className="w-[800px] h-auto object-contain mb-12 animate-fade-in"
        />
        <p className="mb-16 text-3xl font-semibold text-muted-foreground">
          Fuel Your Workout. Customize Your Shake.
        </p>
        
        <Button
          variant="kiosk"
          size="kioskLg"
          onClick={() => navigate('/flavour')}
          className="animate-pulse-glow"
        >
          Start Your Shake
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
