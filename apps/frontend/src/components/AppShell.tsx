'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: JSX.Element;
};

const desktopNav: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    shortLabel: 'Home',
    icon: <GridIcon />,
  },
  {
    href: '/groups',
    label: 'My Groups',
    shortLabel: 'My Groups',
    icon: <UsersIcon />,
  },
  {
    href: '/assignments',
    label: 'Assignments',
    shortLabel: 'Assignments',
    icon: <DocumentIcon />,
  },
  {
    href: '/tools',
    label: "AI Teacher's Toolkit",
    shortLabel: 'AI Toolkit',
    icon: <SparkIcon />,
  },
  {
    href: '/library',
    label: 'My Library',
    shortLabel: 'My Library',
    icon: <BookIcon />,
  },
];

const mobileNav: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    shortLabel: 'Home',
    icon: <GridIcon />,
  },
  {
    href: '/assignments',
    label: 'Assignments',
    shortLabel: 'Assignments',
    icon: <DocumentIcon />,
  },
  {
    href: '/library',
    label: 'Library',
    shortLabel: 'Library',
    icon: <BookIcon />,
  },
  {
    href: '/tools',
    label: 'AI Toolkit',
    shortLabel: 'AI Toolkit',
    icon: <SparkIcon />,
  },
];

export default function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const showCreateAction = pathname !== '/assignments/new';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(237,237,237,0.94)_34%,_rgba(221,221,221,0.98)_100%)] text-slate-900">
      <div className="mx-auto min-h-screen max-w-[1600px] lg:flex lg:gap-3 lg:px-3 lg:py-3">
        <aside className="hidden lg:flex lg:w-[320px] lg:flex-col lg:rounded-[28px] lg:bg-white lg:px-5 lg:py-5 lg:shadow-[0_18px_45px_rgba(0,0,0,0.08)] lg:border lg:border-white/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#ffbb66_0%,#d65321_100%)] text-white shadow-[0_10px_25px_rgba(214,83,33,0.25)]">
              <span className="text-xl font-black">V</span>
            </div>
            <span className="text-[2rem] leading-none font-extrabold tracking-tight text-slate-800">VedaAI</span>
          </div>

          <Link
            href="/assignments/new"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#ff8559] bg-[#2b2b2b] px-6 py-3 text-[17px] font-medium text-white shadow-[0_8px_28px_rgba(0,0,0,0.18)] transition-transform duration-150 hover:-translate-y-0.5"
          >
            <SparkIcon className="h-4 w-4" />
            Create Assignment
          </Link>

          <nav className="mt-12 space-y-2 text-[15px] font-medium text-slate-500">
            {desktopNav.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} compact={false} />
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            <NavLink
              item={{ href: '/settings', label: 'Settings', shortLabel: 'Settings', icon: <SettingsIcon /> }}
              pathname={pathname}
              compact={false}
            />
            <div className="rounded-2xl bg-slate-50 p-3 shadow-inner">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80"
                  alt="Delhi Public School"
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold text-slate-800">Delhi Public School</div>
                  <div className="text-[13px] text-slate-500">Bokaro Steel City</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-6">
          <div className="sticky top-0 z-20 px-3 pt-3 sm:px-4 lg:px-0 lg:pt-0">
            <header className="flex h-[64px] items-center justify-between rounded-[24px] bg-white/95 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur border border-white/70 lg:px-5">
              <div className="flex items-center gap-3 text-slate-400">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                  aria-label="Go back"
                >
                  <BackIcon />
                </button>
                <div className="hidden sm:flex items-center gap-2 text-slate-400">
                  <GridIcon className="h-4 w-4" />
                  <span className="text-[17px] font-medium">{title}</span>
                </div>
                <span className="sm:hidden text-[17px] font-medium text-slate-600">{title}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ff6b2f]" />
                </button>
                <div className="hidden sm:flex items-center gap-3 rounded-full px-1 py-1">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=128&q=80"
                    alt="John Doe"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="text-[15px] font-medium text-slate-700">John Doe</span>
                  <ChevronIcon />
                </div>
                <button type="button" className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white" aria-label="Open menu">
                  <MenuIcon />
                </button>
              </div>
            </header>
          </div>

          <div className="px-3 py-4 sm:px-4 lg:px-0 lg:py-4">{children}</div>
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 rounded-[28px] bg-[#191919] px-3 py-3 text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] lg:hidden">
        <div className="grid grid-cols-4 items-center gap-1 text-center text-[12px] font-medium text-slate-400">
          {mobileNav.map((item) => (
            <Link key={item.href} href={item.href} className={mobileLinkClass(pathname, item.href)}>
              <span className="mb-1 flex h-6 w-6 items-center justify-center">{item.icon}</span>
              <span>{item.shortLabel}</span>
            </Link>
          ))}
        </div>
      </nav>

      {showCreateAction && pathname === '/' ? (
        <Link
          href="/assignments/new"
          className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#ff6a2c] shadow-[0_18px_35px_rgba(0,0,0,0.18)] lg:hidden"
          aria-label="Create assignment"
        >
          <PlusIcon />
        </Link>
      ) : null}
    </div>
  );
}

function NavLink({ item, pathname, compact }: { item: NavItem; pathname: string; compact: boolean }): JSX.Element {
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={compact ? mobileLinkClass(pathname, item.href) : desktopLinkClass(active)}
    >
      <span className={compact ? 'mb-1 flex h-5 w-5 items-center justify-center' : 'flex h-5 w-5 items-center justify-center'}>
        {item.icon}
      </span>
      <span>{compact ? item.shortLabel : item.label}</span>
      {!compact && item.href === '/assignments' ? (
        <span className="ml-auto rounded-full bg-[#ff6a2c] px-2 py-0.5 text-xs font-semibold text-white">10</span>
      ) : null}
    </Link>
  );
}

function desktopLinkClass(active: boolean): string {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors',
    active ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
  ].join(' ');
}

function mobileLinkClass(pathname: string, href: string): string {
  const active = isActive(pathname, href);
  return [
    'flex flex-col items-center justify-center rounded-2xl py-2 transition-colors',
    active ? 'text-white' : 'text-slate-500',
  ].join(' ');
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getTitle(pathname: string): string {
  if (pathname === '/') return 'Assignment';
  if (pathname === '/assignments') return 'Assignment';
  if (pathname === '/assignments/new') return 'Create New';
  if (pathname === '/groups') return 'My Groups';
  if (pathname === '/library') return 'My Library';
  if (pathname === '/tools') return "AI Teacher's Toolkit";
  if (pathname === '/settings') return 'Settings';
  if (pathname.startsWith('/assignments/')) return 'Assignment';
  return 'VedaAI';
}

function BackIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M15 17H9m9-2V11a6 6 0 10-12 0v4l-2 2h16l-2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4 text-slate-500">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon({ className = 'h-4 w-4' }: { className?: string } = {}): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function DocumentIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M7 3h7l5 5v13H7V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M21 20v-1a3.5 3.5 0 00-2.5-3.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 5.5a3 3 0 010 5.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BookIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2Z" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8h8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6Z" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 13a7.8 7.8 0 000-2l2-1.6-2-3.4-2.4.9a7.2 7.2 0 00-1.8-1l-.4-2.6H9.2l-.4 2.6c-.6.2-1.2.5-1.8 1l-2.4-.9-2 3.4L4.6 11a7.8 7.8 0 000 2l-2 1.6 2 3.4 2.4-.9c.6.4 1.2.7 1.8 1l.4 2.6h5.2l.4-2.6c.6-.2 1.2-.5 1.8-1l2.4.9 2-3.4-2-1.6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon({ className = 'h-4 w-4' }: { className?: string } = {}): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" fill="currentColor" />
      <path d="M5 18l.9 2.6L8.5 22l-2.6.9L5 25l-.9-2.1L1.5 22l2.6-.9L5 18Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}
