import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNavigation } from "@/components/sidebar/SidebarNavigation";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Affiliate = () => {
  const affiliateCode = "CYNOVA10";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateCode);
    toast({
      title: "Copied!",
      description: "Affiliate code copied to clipboard",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="lg:block">
          <SidebarHeader className="p-4">
            <img
              src="/logo.png"
              alt="Cynova Logo"
              className="h-8 w-auto mx-auto"
            />
          </SidebarHeader>
          <SidebarNavigation />
        </Sidebar>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Affiliate Program</h1>
            <div className="space-y-6">
              <div className="bg-card rounded-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4">Your Affiliate Code</h2>
                <div className="flex items-center gap-4">
                  <code className="bg-muted px-4 py-2 rounded-md text-lg">
                    {affiliateCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                  <ul className="space-y-4 list-disc pl-6">
                    <li>Share your unique affiliate code with others</li>
                    <li>When someone uses your code, they get 10% off their purchase</li>
                    <li>You earn 20% commission on their purchase</li>
                    <li>Commissions are paid out monthly via PayPal or bank transfer</li>
                  </ul>
                </div>

                <div className="bg-card rounded-lg p-6 border">
                  <h2 className="text-xl font-semibold mb-4">Commission Structure</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <span>Monthly Subscription</span>
                      <span className="font-semibold">20% commission</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <span>Annual Subscription</span>
                      <span className="font-semibold">25% commission</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Affiliate;