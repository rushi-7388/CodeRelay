export default function PageLoader({ label = "Loading…" }) {
  return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4 text-slate-400">
      <span className="loading loading-spinner loading-lg text-indigo-400" />
      <p className="text-sm font-medium tracking-wide">{label}</p>
    </div>
  );
}
