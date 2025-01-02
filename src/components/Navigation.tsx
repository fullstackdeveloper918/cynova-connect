import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const features = [
  {
    title: "ChatGPT Videos",
    description: "Create engaging videos with AI-generated content",
    href: "/dashboard/chatgpt",
  },
  {
    title: "Fake Text Videos",
    description: "Generate realistic text-based content",
    href: "/dashboard/faketext",
  },
  {
    title: "Reddit Videos",
    description: "Transform Reddit content into video stories",
    href: "/dashboard/reddit",
  },
  {
    title: "Split Videos",
    description: "Split and trim your videos with precision",
    href: "/dashboard/split",
  },
  {
    title: "Voiceover Videos",
    description: "Add professional AI voiceovers to your content",
    href: "/dashboard/voiceover",
  },
  {
    title: "Would You Rather Videos",
    description: "Create engaging decision-based content",
    href: "/dashboard/would-you-rather",
  },
  {
    title: "Quiz Videos",
    description: "Generate interactive quiz videos",
    href: "/dashboard/quiz",
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing-section");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Cynova" className="h-8 w-8" />
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cynova
            </span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {features.map((feature) => (
                      <li key={feature.title}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={feature.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">
                              {feature.title}
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {feature.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <button
                  onClick={scrollToPricing}
                  className={navigationMenuTriggerStyle()}
                >
                  Pricing
                </button>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/affiliate" className={navigationMenuTriggerStyle()}>
                  Affiliate
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
}