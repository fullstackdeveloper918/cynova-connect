export const BackgroundSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose Background</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
          <p className="text-sm font-medium">Gaming Background</p>
        </div>
        <div className="p-4 border rounded-lg cursor-pointer hover:border-primary">
          <p className="text-sm font-medium">Lifestyle Background</p>
        </div>
      </div>
    </div>
  );
};