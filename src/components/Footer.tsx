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
    <footer className="bg-white border-t border-zinc-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-zinc-900" />
              <h3 className="font-semibold text-lg text-zinc-900">Features</h3>
            </div>
            <ul className="space-y-2">
              {features.map((feature) => (
                <li key={feature.title}>
                  <Link
                    to={feature.href}
                    className="text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {feature.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-zinc-900" />
              <h3 className="font-semibold text-lg text-zinc-900">Pricing</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/plans"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  View Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-zinc-900" />
              <h3 className="font-semibold text-lg text-zinc-900">Legal</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund-policy"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-zinc-600 hover:text-zinc-900 transition-colors"
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