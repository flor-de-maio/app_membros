"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rss, Library, Trophy, Swords, CalendarCheck } from "lucide-react";

// All five items are always shown, even the ones still "em desenvolvimento" -
// the lock happens on the destination page (via LockedOverlay), not by
// hiding the nav link. That keeps the full IA visible from day one.
const ITEMS = [
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/desafios", label: "Desafios", icon: Swords },
  { href: "/reading-rats", label: "Reading Rats", icon: CalendarCheck },
] as const;

export default function MemberNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 font-mono text-[10px] uppercase tracking-wide transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`link-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
