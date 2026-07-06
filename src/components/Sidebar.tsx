"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAdmin } from "@/hooks/useAdminAuth";
import { useAdminData } from "@/hooks/useAdminData";
import NotificationBell from "./NotificationBell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/dashboard/users", label: "Users", icon: UsersIcon },
  { href: "/dashboard/premium", label: "Premium Users", icon: CrownIcon },
  { href: "/dashboard/inbox", label: "Inbox", icon: InboxIcon },
  { href: "/dashboard/banners", label: "Home Banners", icon: BannersIcon },
  { href: "/dashboard/notify-users", label: "Notify Users", icon: NotifyIcon },
];

export default function Sidebar({ email, unread }: { email: string | null; unread: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications } = useAdminData();

  async function handleLogout() {
    await signOutAdmin();
    router.replace("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary-muted">
            <span className="text-lg font-black italic text-primary">HF</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-text-primary">Hybrid Fit</p>
            <p className="text-xs leading-tight text-text-muted">Admin Panel</p>
          </div>
        </div>
        <NotificationBell notifications={notifications} />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                active ? "bg-primary-muted text-primary" : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon active={active} />
                {label}
              </span>
              {href === "/dashboard/inbox" && unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[11px] font-bold text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <p className="truncate px-2 text-xs text-text-muted">{email}</p>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-error transition hover:bg-error/10"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </aside>
  );
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 14.2c2.4.3 4.2 2.3 4.2 5.3" />
    </svg>
  );
}

function CrownIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path d="M3 8l4 3 5-6 5 6 4-3-1.6 10H4.6L3 8z" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path d="M4 4h16l-1.5 13.5a1 1 0 01-1 .9H6.5a1 1 0 01-1-.9L4 4z" />
      <path d="M4 12h4.5a2.5 2.5 0 004.9 0H20" />
    </svg>
  );
}

function BannersIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="8.5" cy="11" r="1.5" />
      <path d="M21 16l-4.5-4.5L9 19" />
    </svg>
  );
}

function NotifyIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2}>
      <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <path d="M10 20a2 2 0 004 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
