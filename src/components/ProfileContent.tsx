import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { User, Lock, CreditCard, Gauge } from "lucide-react";

export const ProfileContent = () => {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to update the profile
    // For now, we'll just show a success toast
    toast({
      title: "Profile Updated",
      description: `Name updated to: ${name}`,
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }
    // Here you would typically make an API call to update the password
    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated.",
    });
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <p className="text-muted-foreground">Update your personal details</p>
          </div>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit">Update Profile</Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Password</h2>
            <p className="text-muted-foreground">Change your password</p>
          </div>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit">Update Password</Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Subscription</h2>
            <p className="text-muted-foreground">Current plan: Pro</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/plans'}>
          Upgrade Plan
        </Button>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Gauge className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Usage</h2>
            <p className="text-muted-foreground">Your current usage and limits</p>
          </div>
        </div>
        <div className="space-y-2">
          <p>Credits Remaining: 850</p>
          <p>Plan Limit: 1000 credits/month</p>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary rounded-full h-2" style={{ width: '85%' }}></div>
          </div>
        </div>
      </Card>
    </div>
  );
};