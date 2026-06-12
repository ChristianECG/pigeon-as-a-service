export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-3xl animate-pulse select-none">🕊️</span>
        <p className="text-xs text-[var(--muted)] tracking-widest uppercase">
          In transit…
        </p>
      </div>
    </div>
  );
}
