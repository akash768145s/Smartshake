import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import { Check } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const flavours = [
  { id: 'chocolate', name: 'Chocolate', color: 'from-amber-900 to-amber-700', icon: '🍫' },
  { id: 'vanilla', name: 'Vanilla', color: 'from-yellow-200 to-yellow-100', icon: '🍦' },
  { id: 'strawberry', name: 'Strawberry', color: 'from-pink-500 to-pink-400', icon: '🍓' },
  { id: 'banana', name: 'Banana', color: 'from-yellow-400 to-yellow-300', icon: '🍌' },
  { id: 'coffee', name: 'Coffee', color: 'from-amber-800 to-amber-600', icon: '☕' },
];

const FlavourSelection = () => {
  const navigate = useNavigate();
  const { order, setFlavours } = useOrder();
  const [scoops, setScoops] = useState<Record<string, number>>(order.flavours);

  const updateScoops = (id: string, change: number) => {
    setScoops(prev => {
      const current = prev[id] || 0;
      const newCount = Math.max(0, Math.min(5, current + change)); // Max 5 scoops
      if (newCount === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newCount };
    });
  };

  const handleNext = () => {
    const totalScoops = Object.values(scoops).reduce((sum, count) => sum + count, 0);
    if (totalScoops === 0) return;
    setFlavours(scoops);
    navigate('/base');
  };

  const totalScoops = Object.values(scoops).reduce((sum, count) => sum + count, 0);
  const totalPrice = totalScoops * 99;

  return (
    <div className="h-screen w-full p-4 flex flex-col animate-fade-in">
      <BrandLogo />
      <div className="mb-4">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          Choose Your <span className="text-primary neon-text">Flavour</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Select one or more flavours to customize your shake
        </p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 mb-3 max-h-[650px]">
        {flavours.map(flavour => {
          const scoopCount = scoops[flavour.id] || 0;
          return (
            <div
              key={flavour.id}
              className={`
                relative glass-card rounded-xl p-4 transition-all duration-300
                ${scoopCount > 0 ? 'ring-4 ring-primary neon-glow' : 'ring-2 ring-border'}
              `}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${flavour.color} opacity-20 pointer-events-none`} />
              
              {/* Content */}
              <div className="relative flex flex-col items-center justify-center h-full">
                <div className="text-7xl mb-2">{flavour.icon}</div>
                <h3 className="text-xl font-bold uppercase tracking-wide mb-3">{flavour.name}</h3>
                
                {/* Scoop Counter */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateScoops(flavour.id, -1)}
                    className="w-10 h-10 rounded-full bg-background/50 border-2 border-border hover:border-primary transition-all flex items-center justify-center text-xl font-bold disabled:opacity-30"
                    disabled={scoopCount === 0}
                  >
                    -
                  </button>
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-2xl font-black text-primary">{scoopCount}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">scoops</span>
                  </div>
                  <button
                    onClick={() => updateScoops(flavour.id, 1)}
                    className="w-10 h-10 rounded-full bg-background/50 border-2 border-border hover:border-primary transition-all flex items-center justify-center text-xl font-bold disabled:opacity-30"
                    disabled={scoopCount >= 5}
                  >
                    +
                  </button>
                </div>
                
                {scoopCount > 0 && (
                  <p className="text-xs text-primary font-semibold mt-2">₹{scoopCount * 99}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Display */}
      {totalScoops > 0 && (
        <div className="glass-card rounded-xl p-3 mb-3 flex justify-between items-center flex-shrink-0">
          <span className="text-lg font-semibold">Flavour Total ({totalScoops} scoops):</span>
          <span className="text-2xl font-black text-primary neon-text">₹{totalPrice}</span>
        </div>
      )}

      <div className="flex justify-between items-center gap-8 flex-shrink-0">
        <Button
          variant="kioskSecondary"
          size="kiosk"
          onClick={() => navigate('/')}
          className="flex-shrink-0"
        >
          Back
        </Button>
        <Button
          variant="kiosk"
          size="kiosk"
          onClick={handleNext}
          disabled={totalScoops === 0}
          className={`flex-shrink-0 ${totalScoops > 0 ? 'animate-pulse-glow' : ''}`}
        >
          Next ({totalScoops} {totalScoops === 1 ? 'scoop' : 'scoops'})
        </Button>
      </div>
    </div>
  );
};

export default FlavourSelection;
