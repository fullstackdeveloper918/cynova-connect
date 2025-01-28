import { FakeTextGenerator } from "@/components/faketext/FakeTextGenerator";
import { MobileSidebar } from "@/components/MobileSidebar";

const FakeTextVideo = () => {
  return (
    <MobileSidebar>
      <div className="mx-auto">
        <h1 className="text-3xl font-bold mb-4">Fake Text Videos</h1>
        <p className="text-muted-foreground mb-8">
          Create realistic iMessage-style conversation videos with AI-generated content.
        </p>
        <FakeTextGenerator />
      </div>
    </MobileSidebar>
  );
};

export default FakeTextVideo;