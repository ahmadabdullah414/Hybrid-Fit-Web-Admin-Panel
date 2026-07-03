import Link from "next/link";

export default function StatCard({
  label,
  value,
  icon,
  accent = false,
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
  href?: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
          accent ? "bg-primary-muted text-primary" : "bg-surface-elevated text-text-secondary"
        }`}
      >
        {icon}
      </div>
      <p className="text-2xl font-black text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{label}</p>
      {href && (
        <Link
          href={href}
          className="mt-4 inline-flex w-fit items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary transition hover:border-primary/50 hover:text-primary"
        >
          View
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}
