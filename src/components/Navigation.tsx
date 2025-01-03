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
import { Button } from "./ui/button";

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
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Cynova" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 bg-white md:w-[500px] md:grid-cols-2 lg:w-[600px]">
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

          {/* Get Started Button */}
          <div className="hidden md:block">
            <Button className="bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {isOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4">
                <nav className="space-y-4">
                  <div className="space-y-2">
                    <div className="font-medium">Features</div>
                    {features.map((feature) => (
                      <Link
                        key={feature.title}
                        to={feature.href}
                        className="block px-2 py-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        {feature.title}
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      scrollToPricing();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-2 py-1 text-gray-600 hover:text-gray-900"
                  >
                    Pricing
                  </button>
                  <Link
                    to="/affiliate"
                    className="block px-2 py-1 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsOpen(false)}
                  >
                    Affiliate
                  </Link>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}