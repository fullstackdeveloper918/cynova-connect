import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarSections } from "./SidebarSections";
import { useSubscription } from "@/hooks/useSubscription";

export const SidebarNavigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState("");
  const { data: subscription, isLoading } = useSubscription();
  const isFreePlan = !isLoading && subscription?.plan_name === "Free";

  const handleNavigation = (path: string, isFeature: boolean = false) => {
    if (isFeature && isFreePlan) {
      toast({
        title: "Premium Feature",
        description: "Please upgrade to a paid plan to access this feature.",
        variant: "default",
      });
      navigate("/plans");
      return;
    }
    setSelectedTool(path);
    navigate(path);
  };

  return (
    <SidebarContent className="md:bg-background bg-white dark:md:bg-background dark:bg-white">
      {sidebarSections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel 
            className={`${
              section.label === "Cynova Dashboard" 
                ? "cursor-pointer hover:text-primary" 
                : ""
            } text-gray-800 dark:text-gray-800 md:text-inherit md:dark:text-inherit`}
            onClick={() => section.label === "Cynova Dashboard" && handleNavigation("/dashboard")}
          >
            <section.icon className="mr-2 h-4 w-4" />
            {section.label}
            <ChevronDown className="ml-auto h-4 w-4" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path, section.label === "Cynova Create")}
                    tooltip={isFreePlan && section.label === "Cynova Create" ? "Premium Feature" : item.title}
                    isActive={selectedTool === item.id}
                    className={`text-gray-800 dark:text-gray-800 md:text-inherit md:dark:text-inherit ${
                      isFreePlan && section.label === "Cynova Create" ? "opacity-50" : ""
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
};