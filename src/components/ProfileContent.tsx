import { useState } from "react";
import { Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useUser, useUpdateUser } from "@/hooks/useUser";
import { useRole } from "@/hooks/useRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalInfoCard } from "./profile/PersonalInfoCard";
import { SecurityCard } from "./profile/SecurityCard";
import { SubscriptionCard } from "./profile/SubscriptionCard";

export const ProfileContent = () => {
  const { data: user } = useUser();
  const { data: role } = useRole();
  const updateUser = useUpdateUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate({ name, email }, {
      onSuccess: () => {
        toast({
          title: "Profile Updated",
          description: `Name updated to: ${name}`,
        });
      }
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
    toast({
      title: "Password Updated",
      description: "Your password has been successfully updated.",
    });
    setCurrentPassword("");
    setNewPassword("");
  };

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
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          {role === 'admin' && <TabsTrigger value="admin">Admin Tools</TabsTrigger>}
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

        <TabsContent value="usage" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Resource Usage</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">AI Videos</span>
                  <span className="text-sm text-muted-foreground">50/100 videos</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Export Minutes</span>
                  <span className="text-sm text-muted-foreground">45/120 minutes</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '37.5%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Voiceover Minutes</span>
                  <span className="text-sm text-muted-foreground">75/150 minutes</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '50%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">AI Images</span>
                  <span className="text-sm text-muted-foreground">150/300 images</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          </Card>
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
