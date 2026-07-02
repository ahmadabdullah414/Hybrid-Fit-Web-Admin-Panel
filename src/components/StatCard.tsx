export default function StatCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? "bg-primary-muted text-primary" : "bg-surface-elevated text-text-secondary"
        }`}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
    </div>
  );
}
