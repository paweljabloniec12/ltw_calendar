"use client";

import Link from "next/link";
import {
  CalendarDays,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  firstName: string | null;
};

export function HeaderNav({ firstName }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

useEffect(() => {
  setOpen(false);
}, [pathname]);

  return (
    <>
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav
        className={`hnav ${open ? "open" : ""}`}
        aria-label="Główna nawigacja"
      >
        <Link
          className="hn"
          href="/"
          onClick={() => setOpen(false)}
        >
          <CalendarDays className="hn-icon" />
          Dostępność
        </Link>

        {firstName ? (
          <>
            <Link
              className="hn"
              href="/panel"
              onClick={() => setOpen(false)}
            >
              <UserRound className="hn-icon" />
              {firstName}
            </Link>

            <form action={signOutAction}>
              <button className="hn" type="submit">
                <LogOut className="hn-icon" />
                Wyloguj
              </button>
            </form>
          </>
        ) : (
          <Link
            className="hn"
            href="/login"
            onClick={() => setOpen(false)}
          >
            <UserRound className="hn-icon" />
            Panel
          </Link>
        )}
      </nav>
    </>
  );
}