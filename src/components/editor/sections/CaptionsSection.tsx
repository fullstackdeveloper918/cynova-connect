export const CaptionsSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Add Captions</h3>
      <div className="grid gap-4">
        <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
          <p className="text-sm font-medium">Modern Style</p>
        </div>
        <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
          <p className="text-sm font-medium">Gaming Style</p>
        </div>
        <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
          <p className="text-sm font-medium">Clean Minimal</p>
        </div>
      </div>
    </div>
  );
};