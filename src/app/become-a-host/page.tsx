"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

// Carried in sessionStorage rather than a query string so the address never
// lands in a URL, browser history, or a server log.
const HOST_ADDRESS_KEY = "inca:host-listing-address";

export default function BecomeAHostPage() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (address.trim()) {
      try {
        sessionStorage.setItem(HOST_ADDRESS_KEY, address.trim());
      } catch {
        // Private browsing can refuse storage; the address is optional here
      }
    }

    router.push("/admin/login");
  };

  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        {/* Left: the pitch */}
        <div className="mx-auto w-full max-w-lg text-center lg:text-left">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Set up your InCA Homes listing
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            It&apos;s easy to create a great listing — let&apos;s start with
            your address.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label htmlFor="address" className="sr-only">
              Property address
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                autoComplete="street-address"
                className="w-full rounded-full border border-gray-300 py-4 pl-14 pr-5 text-gray-900 shadow-sm transition-shadow duration-200 placeholder:text-gray-500 hover:shadow-md focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full rounded-full bg-primary-600 px-6 py-4 font-medium text-white transition-colors duration-200 hover:bg-primary-700"
            >
              Get started
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-600">
            Not listing a home?{" "}
            <Link href="/contact" className="font-medium text-gray-900 underline">
              Talk to our team
            </Link>
            .
          </p>
        </div>

        {/* Right: the image */}
        <div className="relative mx-auto aspect-square w-full max-w-xl overflow-hidden rounded-3xl bg-gray-100">
          <Image
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"
            alt="A bright, well-furnished living room in a listed property"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
