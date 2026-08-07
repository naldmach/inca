"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { PaymentMethodSpec } from "@/lib/payments";

interface Booking {
  id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_price: number;
  payment_status: string;
  payment_method: string | null;
  payment_reference: string | null;
}

// Client components receive params as a plain object in this Next version
export default function BookingPaymentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [property, setProperty] = useState<{ title: string; city: string } | null>(
    null
  );
  const [methods, setMethods] = useState<PaymentMethodSpec[]>([]);
  const [details, setDetails] = useState<Record<string, Record<string, string>>>(
    {}
  );

  const [selected, setSelected] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings/${id}`);

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not load this booking");
        return;
      }

      const data = await response.json();
      setBooking(data.booking);
      setProperty(data.property);
      setMethods(data.paymentMethods || []);
      setDetails(data.paymentDetails || {});
      setSelected(data.booking.payment_method || data.paymentMethods?.[0]?.id || "");
    } catch {
      setError("Could not load this booking.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: selected,
          paymentReference: reference,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not submit your payment");
        return;
      }

      setBooking((prev) => (prev ? { ...prev, ...data.booking } : prev));
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
          <p className="text-gray-600">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <p className="text-gray-900">{error || "Booking not found."}</p>
        </div>
      </div>
    );
  }

  const submitted = booking.payment_status === "submitted";
  const activeMethod = methods.find((m) => m.id === selected);
  const activeDetails = selected ? details[selected] || {} : {};

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {submitted ? "Payment submitted" : "Pay for your stay"}
        </h1>

        {property && (
          <p className="mt-2 text-gray-600">
            {property.title} · {property.city}
          </p>
        )}

        <section className="mt-8 rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900">Booking summary</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Check in</dt>
              <dd className="text-gray-900">{booking.check_in}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Check out</dt>
              <dd className="text-gray-900">{booking.check_out}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Guests</dt>
              <dd className="text-gray-900">{booking.guests}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <dt className="text-gray-900">Total</dt>
              <dd className="text-gray-900">
                ₱{Number(booking.total_price).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <div>
                <p className="font-medium text-green-900">
                  Reference {booking.payment_reference} received
                </p>
                <p className="mt-1 text-sm text-green-800">
                  Your host will confirm the transfer and your booking will move
                  to confirmed. Nothing further is needed from you.
                </p>
              </div>
            </div>
            <Link
              href="/properties"
              className="mt-4 inline-block font-medium text-primary-600"
            >
              Browse more places
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <fieldset>
              <legend className="font-semibold text-gray-900">
                Choose how to pay
              </legend>

              <div className="mt-3 space-y-3">
                {methods.map((method) => (
                  <label
                    key={method.id}
                    className={`block cursor-pointer rounded-xl border p-4 transition-colors duration-200 ${
                      selected === method.id
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-300 hover:border-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selected === method.id}
                        onChange={() => setSelected(method.id)}
                        className="h-4 w-4 accent-primary-600"
                      />
                      <span className="font-medium text-gray-900">
                        {method.label}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {activeMethod && (
              <section className="rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900">
                  Send ₱{Number(booking.total_price).toLocaleString()} to
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  {activeMethod.fields.map((field) => (
                    <div key={field.key} className="flex justify-between gap-4">
                      <dt className="text-gray-600">{field.label}</dt>
                      <dd className="text-right font-medium text-gray-900">
                        {activeDetails[field.key] || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5">
                  <label
                    htmlFor="reference"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {activeMethod.referenceLabel}
                  </label>
                  <input
                    id="reference"
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. 0123456789"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Transfer the total yourself, then enter the reference number
                    here so your host can match it.
                  </p>
                </div>
              </section>
            )}

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
              disabled={submitting || !selected}
              className="w-full rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "I've sent the payment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
