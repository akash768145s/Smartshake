import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import BrandLogo from '@/components/BrandLogo';

const BaseSelection = () => {
  const navigate = useNavigate();
  const { setBase } = useOrder();

  const handleBaseSelection = (base: 'milk' | 'water') => {
    setBase(base);
    navigate('/quantity');
  };

  return (
    <div className="h-screen w-full p-6 flex flex-col animate-fade-in">
      <BrandLogo />
      <div className="mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tight mb-3">
          Choose Your <span className="text-primary neon-text">Base</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Select evaporated milk or water for your protein shake
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center gap-10">
        {/* Milk Option */}
        <button
          onClick={() => handleBaseSelection('milk')}
          className="glass-card rounded-2xl p-10 w-80 h-80 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:ring-4 hover:ring-primary group"
        >
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">🥛</div>
          <h2 className="text-4xl font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
            Evaporated Milk
          </h2>
          <p className="text-lg text-muted-foreground mt-3">Extra Creamy</p>
          <p className="text-sm text-primary font-semibold mt-2">₹15 per 200ml</p>
        </button>

        {/* Water Option */}
        <button
          onClick={() => handleBaseSelection('water')}
          className="glass-card rounded-2xl p-10 w-80 h-80 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:ring-4 hover:ring-primary group"
        >
          <div className="text-7xl mb-6 group-hover:scale-110 transition-transform">💧</div>
          <h2 className="text-4xl font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
            Water
          </h2>
          <p className="text-lg text-muted-foreground mt-3">Light & Refreshing</p>
          <p className="text-sm text-primary font-semibold mt-2">Free</p>
        </button>
      </div>

      <div className="flex justify-start flex-shrink-0">
        <Button
          variant="kioskSecondary"
          size="kiosk"
          onClick={() => navigate('/flavour')}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default BaseSelection;
