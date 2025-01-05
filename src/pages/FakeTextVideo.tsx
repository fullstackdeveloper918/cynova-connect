import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { FakeTextGenerator } from "@/components/faketext/FakeTextGenerator";

const FakeTextVideo = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-4">Fake Text Videos</h1>
        <p className="text-muted-foreground mb-8">
          Create realistic iMessage-style conversation videos with AI-generated content.
        </p>
        <FakeTextGenerator />
      </div>
    </DashboardLayout>
  );
};

export default FakeTextVideo;