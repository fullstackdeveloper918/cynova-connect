import { Link } from "react-router-dom";
import { FileText, DollarSign, Sparkles } from "lucide-react";

const features = [
  { title: "ChatGPT Videos", href: "/dashboard/chatgpt" },
  { title: "Fake Text Videos", href: "/dashboard/faketext" },
  { title: "Reddit Videos", href: "/dashboard/reddit" },
  { title: "Split Videos", href: "/dashboard/split" },
  { title: "Voiceover Videos", href: "/dashboard/voiceover" },
  { title: "Would You Rather Videos", href: "/dashboard/would-you-rather" },
  { title: "Quiz Videos", href: "/dashboard/quiz" },
];

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-accent">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Features Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Features</h3>
            </div>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature.title}>
                  <Link
                    to={feature.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {feature.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Pricing</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/plans"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  View Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Legal</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};