"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, Home, Mail, Menu, User } from "lucide-react";

interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/contact", label: "Contact", icon: Mail },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Re-check on navigation so the menu reflects a fresh login or logout
  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (cancelled) return;

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    };

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close the menu when clicking outside it or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = useCallback(async () => {
    setIsOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const menuItemClass = (href: string) =>
    `block px-4 py-2 text-sm transition-colors duration-200 ${
      isActive(href)
        ? "text-primary-600 bg-primary-50 font-medium"
        : "text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-600">InCA</div>
            <div className="text-lg font-medium text-gray-700">Homes</div>
          </Link>

          {/* Center tabs */}
          <div className="hidden md:flex items-center space-x-8 h-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.href);

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-1 h-full pt-1 border-b-2 transition-colors duration-200 ${
                    active
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1">
            {user?.role !== "admin" && (
              <Link
                href="/admin/login"
                className="hidden md:block rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Become a host
              </Link>
            )}

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Main menu"
                className="flex items-center gap-2 rounded-full border border-gray-300 py-1 pl-3 pr-1 hover:shadow-md transition-shadow duration-200"
              >
                <Menu className="h-4 w-4 text-gray-700" />
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-500 text-white">
                  <User className="h-5 w-5" />
                </span>
              </button>

              {isOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
                >
                  {/* Below md the tabs are hidden, so surface them here */}
                  <div className="md:hidden">
                    {tabs.map((tab) => (
                      <Link
                        key={tab.href}
                        href={tab.href}
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        className={menuItemClass(tab.href)}
                      >
                        {tab.label}
                      </Link>
                    ))}
                    <div className="my-2 border-t border-gray-200" />
                  </div>

                  {user ? (
                    <>
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      <div className="my-2 border-t border-gray-200" />
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          role="menuitem"
                          onClick={() => setIsOpen(false)}
                          className={menuItemClass("/admin")}
                        >
                          Admin dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm font-semibold text-gray-900 transition-colors duration-200 hover:bg-gray-50"
                      >
                        Sign up
                      </Link>
                      <Link
                        href="/login"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        className={menuItemClass("/login")}
                      >
                        Log in
                      </Link>
                      <div className="my-2 border-t border-gray-200" />
                      <Link
                        href="/admin/login"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-50"
                      >
                        Become a host
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
