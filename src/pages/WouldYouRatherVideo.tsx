import { WouldYouRatherEditor } from "@/components/would-you-rather/WouldYouRatherEditor";

const WouldYouRatherVideo = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Would You Rather Video</h1>
      <WouldYouRatherEditor />
    </div>
  );
};

export default WouldYouRatherVideo;