"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { getMethodSpec } from "@/lib/payments";

interface Booking {
  id: number;
  property_id: number;
  guest_name: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number | null;
  total_price: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  payment_reference: string | null;
  property: { id: number; title: string; city: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  awaiting_payment: "bg-gray-100 text-gray-700",
  submitted: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/bookings");

      if (response.status === 401 || response.status === 403) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not load bookings");
        return;
      }

      setBookings(data.bookings || []);
    } catch {
      setError("Network error loading bookings.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id: number, action: "confirm" | "reject") => {
    setBusyId(id);
    setError("");

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not update the booking");
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? { ...b, status: data.booking.status, payment_status: data.booking.payment_status }
            : b
        )
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const awaiting = bookings.filter((b) => b.payment_status === "submitted");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-2 text-gray-600">
          {awaiting.length > 0
            ? `${awaiting.length} payment ${awaiting.length === 1 ? "reference" : "references"} waiting on you.`
            : "No payments waiting on you."}
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 text-gray-600">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="mt-8 text-gray-600">No bookings yet.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {bookings.map((booking) => {
              const method = booking.payment_method
                ? getMethodSpec(booking.payment_method)
                : undefined;
              const decidable = booking.payment_status === "submitted";

              return (
                <li
                  key={booking.id}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.property?.title ?? `Property #${booking.property_id ?? "?"}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.guest_name} · {booking.guest_email}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {booking.check_in} → {booking.check_out} ·{" "}
                        {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                        {booking.nights ? ` · ${booking.nights} nights` : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₱{Number(booking.total_price).toLocaleString()}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_STYLES[booking.payment_status] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.payment_status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {booking.payment_reference && (
                    <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                      <span className="text-gray-600">
                        {method?.label ?? booking.payment_method} reference:{" "}
                      </span>
                      <span className="font-mono font-medium text-gray-900">
                        {booking.payment_reference}
                      </span>
                    </div>
                  )}

                  {decidable && (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() => decide(booking.id, "confirm")}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-700 disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />
                        Payment received
                      </button>
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() => decide(booking.id, "reject")}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Not received
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
