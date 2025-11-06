import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "@/contexts/OrderContext";
import Welcome from "./pages/Welcome";
import FlavourSelection from "./pages/FlavourSelection";
import BaseSelection from "./pages/BaseSelection";
import QuantitySelection from "./pages/QuantitySelection";
import Payment from "./pages/Payment";
import Dispense from "./pages/Dispense";
import Done from "./pages/Done";
import MachineDemo from "./pages/MachineDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OrderProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MachineDemo />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/flavour" element={<FlavourSelection />} />
            <Route path="/base" element={<BaseSelection />} />
            <Route path="/quantity" element={<QuantitySelection />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/dispense" element={<Dispense />} />
            <Route path="/done" element={<Done />} />
            <Route path="/demo" element={<MachineDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </OrderProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
