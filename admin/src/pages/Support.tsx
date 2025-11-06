import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Send, Book, Phone, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function Support() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Support request submitted", {
      description: "Our team will respond within 24 hours",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-wide">Support & Help</h1>
        <p className="text-muted-foreground mt-1">
          Get help with your Smartshake vending system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Options */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Phone Support</h3>
                <Badge variant="outline" className="mt-1">24/7 Available</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Call our support team for immediate assistance
            </p>
            <Button className="w-full neon-glow">
              <Phone className="w-4 h-4 mr-2" />
              +91 1800-XXX-XXXX
            </Button>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <Badge variant="outline" className="mt-1">Within 24h</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Send detailed queries via email
            </p>
            <Button className="w-full" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              support@smartshake.in
            </Button>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <Badge variant="outline" className="bg-success/10 text-success border-success/50 mt-1">
                  Online
                </Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with support agent now
            </p>
            <Button className="w-full" variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submit Request */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold uppercase tracking-wide mb-6">
              Submit Support Request
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <Label htmlFor="machine">Machine ID (Optional)</Label>
                <Input id="machine" placeholder="SV-GOL-1" />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full neon-glow">
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </form>
          </div>

          {/* FAQs */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Book className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold uppercase tracking-wide">
                Frequently Asked Questions
              </h3>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I refill a machine?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Navigate to the Stocks page to view current levels. Click "Create Restock Task" for
                    any item below threshold. The system will generate a prioritized refill list. Use
                    your access key to open the machine cabinet and refill according to the standard
                    operating procedure.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>What to do if a machine goes offline?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    First, check the machine's physical power connection and network cable. If these are
                    secure, try power cycling the machine. If it remains offline for more than 5 minutes,
                    an alert will be generated automatically. Contact support if the issue persists after
                    power cycle.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How do I change pricing for a location?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Go to Settings → Pricing & Flavours. Update the price per scoop for each flavour.
                    Changes sync to all machines within 2 minutes. You can also set location-specific
                    pricing by selecting a location filter before making changes.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How often should machines be cleaned?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Automated cleaning cycles should run every 24 hours minimum. High-traffic locations
                    may require twice-daily cleaning. The system tracks compliance automatically. Manual
                    deep cleaning should be performed weekly, including all external surfaces and
                    dispensing mechanisms.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>What are the alert severity levels?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <Badge variant="destructive" className="mr-2">Critical</Badge>
                      <span className="text-muted-foreground">
                        Machine cannot operate, immediate action required
                      </span>
                    </div>
                    <div>
                      <Badge className="bg-accent/20 text-accent border-accent/50 mr-2">High</Badge>
                      <span className="text-muted-foreground">
                        Feature degraded, resolve within 4 hours
                      </span>
                    </div>
                    <div>
                      <Badge className="bg-warning/20 text-warning border-warning/50 mr-2">Medium</Badge>
                      <span className="text-muted-foreground">
                        Recoverable issue, monitor and resolve within 24 hours
                      </span>
                    </div>
                    <div>
                      <Badge className="bg-info/20 text-info border-info/50 mr-2">Low</Badge>
                      <span className="text-muted-foreground">Warning or informational, no immediate action needed</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>How can I export sales data?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Go to Sales & Insights page. Select your desired date range using the dropdown. Click
                    "Export CSV" button in the top right. The file will include all transactions with
                    machine ID, flavours, quantities, revenue, and timestamps. Exports are generated
                    instantly and downloaded to your device.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
