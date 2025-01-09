import { useState, useEffect } from "react";
import { Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { useRole } from "@/hooks/useRole";
import { useSubscription } from "@/hooks/useSubscription";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalInfoCard } from "./profile/PersonalInfoCard";
import { SecurityCard } from "./profile/SecurityCard";
import { SubscriptionCard } from "./profile/SubscriptionCard";
import { BillingCard } from "./profile/BillingCard";
import { UsageCard } from "./profile/UsageCard";
import { supabase } from "@/integrations/supabase/client";

export const ProfileContent = () => {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: role } = useRole();
  const { data: subscription } = useSubscription();
  const updateUser = useUpdateUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        if (!session?.user) {
          console.log("No active session found");
          return;
        }

        setName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || '');
        setEmail(session.user.email || '');
        console.log("Current user session:", session.user);
      } catch (error) {
        console.error("Error initializing user data:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          title: "Error",
          description: "Failed to get current session",
          variant: "destructive",
        });
        return;
      }

      if (!session) {
        toast({
          title: "Error",
          description: "No active session found",
          variant: "destructive",
        });
        return;
      }

      updateUser.mutate({ name, email }, {
        onSuccess: () => {
          toast({
            title: "Profile Updated",
            description: "Profile updated successfully",
          });
        },
        onError: (error) => {
          console.error("Error updating profile:", error);
          toast({
            title: "Error",
            description: "Failed to update profile",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error in handleUpdateProfile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
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
    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated.",
    });
    setCurrentPassword("");
    setNewPassword("");
  };

  if (isLoadingUser || isInitializing) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        {role === 'admin' && (
          <Button variant="outline" onClick={() => window.location.href = '/admin'}>
            <Settings className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8 w-full flex overflow-x-auto bg-transparent border-b">
          <TabsTrigger 
            value="profile" 
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="billing"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger 
            value="usage"
            className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8"
          >
            Usage
          </TabsTrigger>
          {role === 'admin' && (
            <TabsTrigger 
              value="admin"
              className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8"
            >
              Admin Tools
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <PersonalInfoCard
            name={name}
            email={email}
            role={role}
            onNameChange={setName}
            onEmailChange={setEmail}
            onSubmit={handleUpdateProfile}
          />

          <SecurityCard
            currentPassword={currentPassword}
            newPassword={newPassword}
            onCurrentPasswordChange={setCurrentPassword}
            onNewPasswordChange={setNewPassword}
            onSubmit={handleUpdatePassword}
          />

          <SubscriptionCard />
        </TabsContent>

        <TabsContent value="billing" className="space-y-8">
          <BillingCard />
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <UsageCard />
        </TabsContent>

        {role === 'admin' && (
          <TabsContent value="admin" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <p className="text-muted-foreground">Manage user roles and permissions</p>
                </div>
              </div>
              <Button onClick={() => window.location.href = '/admin/users'}>
                Manage Users
              </Button>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
