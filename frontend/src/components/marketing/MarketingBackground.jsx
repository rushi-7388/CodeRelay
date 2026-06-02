export default function MarketingBackground({ variant = "purple" }) {
  const accent =
    variant === "blue"
      ? "bg-blue-600/10"
      : variant === "enterprise"
        ? "bg-blue-600/10"
        : "bg-indigo-600/20";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full ${accent} blur-[150px]`} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/20 blur-[150px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
    </div>
  );
}
