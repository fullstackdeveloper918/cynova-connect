import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { FeatureCard } from "@/components/FeatureCard";
import { createSections } from "@/config/dashboard";

interface FeatureGridProps {
  isFreePlan: boolean;
}

export const FeatureGrid = ({ isFreePlan }: FeatureGridProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {createSections.map((section, index) => (
        <FeatureCard 
          key={section.id} 
          {...section} 
          index={index} 
          isDisabled={isFreePlan}
          onClick={() => {
            if (isFreePlan) {
              toast({
                title: "Feature not available",
                description: "Please upgrade to a paid plan to access this feature.",
                variant: "default",
              });
              return;
            }
            navigate(section.path);
          }}
        />
      ))}
    </div>
  );
};