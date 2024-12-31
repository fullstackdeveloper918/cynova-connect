import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
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

export const SidebarNavigation = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState("");

  return (
    <SidebarContent>
      {sidebarSections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>
            <section.icon className="mr-2 h-4 w-4" />
            {section.label}
            <ChevronDown className="ml-auto h-4 w-4" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      setSelectedTool(item.id);
                      navigate(item.path);
                    }}
                    tooltip={item.title}
                    isActive={selectedTool === item.id}
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