"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { countNights } from "@/lib/payments";

interface Property {
  id: number;
  title: string;
  city: string;
  price: number;
  guests: number;
}

// Client components receive params as a plain object in this Next version
export default function BookPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const load = useCallback(async () => {
    try {
      const [propertyRes, meRes] = await Promise.all([
        fetch(`/api/properties/${id}`),
        fetch("/api/auth/me"),
      ]);

      if (propertyRes.ok) {
        const data = await propertyRes.json();
        setProperty(data.property ?? data);
      }

      setSignedIn(meRes.ok);
    } catch {
      setError("Could not load this property.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const nights = checkIn && checkOut ? countNights(checkIn, checkOut) : 0;
  const total = property ? Number(property.price) * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: Number(id),
          checkIn,
          checkOut,
          guests,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Could not create your booking");
        return;
      }

      router.push(`/bookings/${data.booking.id}/pay`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <p className="text-gray-900">That property could not be found.</p>
          <Link
            href="/properties"
            className="mt-4 inline-block font-medium text-primary-600"
          >
            Browse properties
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Request to book</h1>
        <p className="mt-2 text-gray-600">
          {property.title} · {property.city}
        </p>

        {signedIn === false && (
          <div className="mt-6 rounded-lg bg-primary-50 px-4 py-3 text-sm text-gray-800">
            You&apos;ll need an account to book.{" "}
            <Link href="/login" className="font-medium text-primary-600">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="font-medium text-primary-600">
              sign up
            </Link>
            .
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="checkIn"
                className="block text-sm font-medium text-gray-700"
              >
                Check in
              </label>
              <input
                id="checkIn"
                type="date"
                required
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label
                htmlFor="checkOut"
                className="block text-sm font-medium text-gray-700"
              >
                Check out
              </label>
              <input
                id="checkOut"
                type="date"
                required
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="guests"
              className="block text-sm font-medium text-gray-700"
            >
              Guests
            </label>
            <input
              id="guests"
              type="number"
              min={1}
              max={property.guests}
              required
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p className="mt-1 text-sm text-gray-600">
              This place sleeps up to {property.guests}.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between text-gray-700">
              <span>
                ₱{Number(property.price).toLocaleString()} × {nights}{" "}
                {nights === 1 ? "night" : "nights"}
              </span>
              <span>₱{total.toLocaleString()}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
              <span>Total</span>
              <span>₱{total.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || nights < 1}
            className="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating booking..." : "Continue to payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
