import { MobileSidebar } from "./MobileSidebar";
import { SupportForm } from "./SupportForm";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <MobileSidebar>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">{description}</p>
        {title === "Support" ? (
          <SupportForm />
        ) : (
          <div className="bg-accent/10 rounded-lg p-8 text-center">
            <p className="text-lg">This feature is coming soon!</p>
          </div>
        )}
      </div>
    </MobileSidebar>
  );
};

export default PlaceholderPage;