import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bug, Mail, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SupportForm = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<"bug" | "support" | "payment">("support");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const response = await fetch("/api/send-support-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message,
          category,
          userEmail: user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send support request");
      }

      toast.success("Support request sent successfully!");
      setSubject("");
      setMessage("");
      setCategory("support");
    } catch (error) {
      console.error("Error sending support request:", error);
      toast.error("Failed to send support request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: typeof category) => {
    switch (cat) {
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <Select
            value={category}
            onValueChange={(value: "bug" | "support" | "payment") => setCategory(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  <span>Bug Report</span>
                </div>
              </SelectItem>
              <SelectItem value="support">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>General Support</span>
                </div>
              </SelectItem>
              <SelectItem value="payment">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Payment Issue</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What can we help you with?"
            className="mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please describe your issue in detail..."
            className="mt-1 h-32"
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Submit Request"}
        </Button>
      </form>
    </div>
  );
};