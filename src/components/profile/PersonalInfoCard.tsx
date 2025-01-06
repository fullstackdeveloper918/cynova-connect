import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PersonalInfoCardProps {
  name: string;
  email: string;
  role?: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PersonalInfoCard = ({
  name,
  email,
  role,
  onNameChange,
  onEmailChange,
  onSubmit,
}: PersonalInfoCardProps) => {
  return (
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
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <div className="flex items-center gap-2 mt-1">
            <Shield className="w-4 h-4 text-primary" />
            <span className="capitalize">{role || 'user'}</span>
            {role === 'admin' && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Full Access
              </span>
            )}
          </div>
        </div>
        <Button type="submit">Update Profile</Button>
      </form>
    </Card>
  );
};