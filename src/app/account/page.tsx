"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const router = useRouter();

  const loadSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      setUser(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
    } catch {
      setError("Could not load your account.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const payload: Record<string, string> = { name, email };
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setCurrentPassword("");
        setNewPassword("");
        setNotice("Your account has been updated.");
        router.refresh();
      } else {
        setError(data.error || "Could not update your account");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-500 text-white">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account settings</h1>
          <p className="text-sm text-gray-600">
            Signed in as {user.email}
            {user.role === "admin" && " · Host"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <section className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Your details</h2>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Change password
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Leave blank to keep your current password.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        </form>
      </div>
    </div>
  );
}
