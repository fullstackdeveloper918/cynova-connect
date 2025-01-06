import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

export const NewSignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    console.log("Starting signup process for email:", email);

    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (error) {
        console.error("Signup error:", error);
        
        if (error.message.includes("User already registered")) {
          toast.error("This email is already registered. Please try logging in instead.");
        } else {
          toast.error(error.message || "Failed to create account");
        }
        return;
      }

      if (user) {
        console.log("User created successfully:", user.id);
        
        // Wait a moment for the trigger to create the role
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify user_roles entry was created
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        console.log("User role verification:", { userRole, roleError });

        if (roleError) {
          console.error("Warning: Could not verify user role creation:", roleError);
          // Continue anyway as the trigger might still be processing
        }

        toast.success("Account created successfully! Please check your email to verify your account.");
        navigate("/login");
      } else {
        console.error("No user data in response");
        toast.error("An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      const err = error as AuthError;
      console.error("Unexpected error during signup:", err);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1"
            placeholder="Create a password"
            disabled={isLoading}
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1"
            placeholder="Confirm your password"
            disabled={isLoading}
            minLength={6}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Sign up"}
      </Button>
    </form>
  );
};