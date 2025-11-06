import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useOrder } from '@/contexts/OrderContext';
import BrandLogo from '@/components/BrandLogo';

const QuantitySelection = () => {
  const navigate = useNavigate();
  const { order, setQuantity } = useOrder();
  const [sliderValue, setSliderValue] = useState(order.quantity || 40);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0]);
    setQuantity(value[0]);
  };

  const handleNext = () => {
    if (sliderValue === 0) return;
    navigate('/payment');
  };

  const fillPercentage = ((sliderValue - 30) / 20) * 100;

  return (
    <div className="h-screen w-full p-6 flex flex-col animate-fade-in">
      <BrandLogo />
      <div className="mb-6">
        <h1 className="text-5xl font-black uppercase tracking-tight mb-3">
          Choose <span className="text-primary neon-text">Quantity</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Slide to select your shake volume
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center gap-12">
        {/* Cup Visual */}
        <div className="relative">
          <div className="relative w-56 h-80 glass-card rounded-2xl overflow-hidden border-4 border-border">
            {/* Fill Animation */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary via-primary/80 to-primary/60 transition-all duration-700 ease-out"
              style={{ height: `${fillPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            
            {/* Measurement Lines */}
            <div className="absolute inset-0 pointer-events-none">
              {[0, 33.33, 66.67, 100].map((mark, idx) => (
                <div
                  key={mark}
                  className="absolute left-0 right-0 border-t border-border/30"
                  style={{ bottom: `${mark}%` }}
                >
                  <span className="absolute right-2 -top-3 text-xs text-muted-foreground">
                    {[150, 175, 212.5, 250][idx]}ml
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Volume Label */}
          <div className="mt-6 text-center">
            <p className="text-5xl font-black text-primary neon-text">
              {sliderValue * 5}ml
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              {sliderValue === 0 ? 'Select amount' : `${sliderValue}% full`}
            </p>
          </div>
        </div>

        {/* Slider Control */}
        <div className="w-80">
          <div className="glass-card rounded-2xl p-8">
            <Slider
              value={[sliderValue]}
              onValueChange={handleSliderChange}
              max={50}
              min={30}
              step={10}
              className="mb-6"
            />
            
            <div className="flex justify-between text-base text-muted-foreground">
              <span>150ml</span>
              <span>200ml</span>
              <span>250ml</span>
            </div>
            
            <div className="mt-6 space-y-3">
              <Button
                variant="kioskSecondary"
                size="kiosk"
                className="w-full"
                onClick={() => {
                  setSliderValue(30);
                  setQuantity(30);
                }}
              >
                Quick: 150ml
              </Button>
              <Button
                variant="kioskSecondary"
                size="kiosk"
                className="w-full"
                onClick={() => {
                  setSliderValue(50);
                  setQuantity(50);
                }}
              >
                Quick: 250ml
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center flex-shrink-0">
        <Button
          variant="kioskSecondary"
          size="kiosk"
          onClick={() => navigate('/base')}
        >
          Back
        </Button>
        <Button
          variant="kiosk"
          size="kiosk"
          onClick={handleNext}
          disabled={sliderValue === 0}
          className={sliderValue > 0 ? 'animate-pulse-glow' : ''}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default QuantitySelection;
