interface GameplayVideoProps {
  url: string;
}

export const GameplayVideo = ({ url }: GameplayVideoProps) => {
  if (!url) return null;

  return (
    <div className="flex-1 bg-black">
      <video
        src={url}
        autoPlay
        muted
        loop
        className="w-full h-full object-cover"
      />
    </div>
  );
};