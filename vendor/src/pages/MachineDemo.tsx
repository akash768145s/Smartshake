import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import { cn } from '@/lib/utils';
import { Server, MapPin, CheckCircle2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

const MACHINES = [
  { id: 'MACHINE-001', location: 'Chennai' },
  { id: 'MACHINE-002', location: 'Mumbai' },
  { id: 'MACHINE-003', location: 'Delhi' },
  { id: 'MACHINE-004', location: 'Hyderabad' },
  { id: 'MACHINE-005', location: 'Pune' },
  { id: 'MACHINE-006', location: 'Kochi' },
  { id: 'MACHINE-007', location: 'Jaipur' },
  { id: 'MACHINE-008', location: 'Bengaluru' },
  { id: 'MACHINE-009', location: 'Ahmedabad' },
  { id: 'MACHINE-010', location: 'Kolkata' },
];

const MachineDemo = () => {
  const navigate = useNavigate();
  const { order, setSelectedMachine } = useOrder();
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(order.selectedMachine?.id || null);

  const handleMachineSelect = (machine: { id: string; location: string }) => {
    setSelectedMachineId(machine.id);
    setSelectedMachine(machine);
  };

  const handleStartShake = () => {
    if (selectedMachineId) {
      navigate('/welcome');
    }
  };

  const selectedMachine = MACHINES.find(m => m.id === selectedMachineId);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-background/95 p-6 flex flex-col animate-fade-in">
      <BrandLogo />
      
      <div className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black uppercase tracking-tight mb-3">
            Select Your <span className="text-primary neon-text">Machine</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose from 10 machines operating at different locations
          </p>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-8">
          {MACHINES.map((machine, index) => {
            const isSelected = selectedMachineId === machine.id;
            return (
              <button
                key={machine.id}
                onClick={() => handleMachineSelect(machine)}
                className={cn(
                  "glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-3",
                  "transition-all duration-300 transform",
                  "hover:scale-105 hover:ring-4 hover:ring-primary/50",
                  "cursor-pointer group",
                  isSelected 
                    ? "ring-4 ring-primary bg-primary/10 scale-105 shadow-lg shadow-primary/20" 
                    : "hover:bg-muted/30"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "transition-all duration-300",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}>
                  <Server className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <div className={cn(
                    "font-bold text-lg mb-1 transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {machine.id.split('-')[1]}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{machine.location}</span>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-6 h-6 text-primary animate-in zoom-in duration-200" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Machine Info & Action */}
        {selectedMachineId && selectedMachine && (
          <div className="glass-card rounded-2xl p-8 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Server className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-black text-primary mb-1">
                    {selectedMachine.id}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-lg">{selectedMachine.location}</span>
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-10 h-10 text-primary animate-pulse" />
            </div>
            
            <div className="pt-6 border-t border-border">
              <Button
                variant="kiosk"
                size="kioskLg"
                onClick={handleStartShake}
                className="w-full animate-pulse-glow text-xl py-6"
              >
                Start Your Shake
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineDemo;

