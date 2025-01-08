import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const navigate = useNavigate();

  const handleRoleBasedRedirect = async (userId: string) => {
    console.log("Checking role for user:", userId);
    
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
        toast.error("Error determining user access level");
        // Default to user dashboard on error
        navigate("/dashboard");
        return;
      }

      console.log("User role data:", roleData);

      // If no role found or role is user, redirect to dashboard
      if (!roleData || roleData.role === 'user') {
        navigate("/dashboard");
      } else if (roleData.role === 'admin') {
        navigate("/admin");
      } else {
        // Default case
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error in role check:", error);
      // Default to dashboard on error
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Attempting login for:", email);
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(getErrorMessage(error));
        return;
      }

      if (session) {
        console.log("Login successful for user:", session.user.id);
        await handleRoleBasedRedirect(session.user.id);
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast.error("An unexpected error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      if (error.message.includes("Invalid login credentials")) {
        return "Invalid email or password. Please check your credentials and try again.";
      }
      if (error.message.includes("Email not confirmed")) {
        return "Please verify your email address before signing in.";
      }
      if (error.message.includes("user_not_found")) {
        return "No user found with these credentials.";
      }
      if (error.status === 429) {
        return "Too many login attempts. Please try again later.";
      }
      if (error.status === 422) {
        return "Invalid email format. Please enter a valid email address.";
      }
      console.error("Unexpected auth error:", {
        status: error.status,
        message: error.message,
        name: error.name
      });
    }
    return "An unexpected error occurred. Please try again.";
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address first");
      return;
    }

    setIsSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(`Failed to send reset email: ${error.message}`);
      } else {
        toast.success("Password reset email sent! Please check your inbox.");
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send reset email. Please try again later.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            placeholder="Enter your email"
            disabled={isLoading || isSendingReset}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:underline"
              disabled={isLoading || isSendingReset}
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
            placeholder="Enter your password"
            disabled={isLoading || isSendingReset}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || isSendingReset}>
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
};