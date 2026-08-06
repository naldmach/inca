"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BOOKING_SETTINGS,
  DESCRIPTION_MAX,
  GUEST_FAVOURITE_AMENITIES,
  HIGHLIGHTS,
  ListingDraft,
  MAX_HIGHLIGHTS,
  MIN_PHOTOS,
  OCCUPANCY_OPTIONS,
  PRIVACY_TYPES,
  PROPERTY_TYPES,
  SAFETY_AMENITIES,
  STANDOUT_AMENITIES,
  STEPS,
  TITLE_MAX,
  emptyDraft,
  validateStep,
} from "@/lib/listing-wizard";
import {
  ChipSelect,
  ChoiceGrid,
  ChoiceList,
  CounterRow,
  IntroStep,
  MultiSelectGrid,
  PhotosStep,
  StepHeading,
  TextStep,
} from "@/components/host/WizardSteps";

// Leaflet touches window on import, so it can never run during SSR
const LocationMap = dynamic(() => import("@/components/host/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-2xl bg-gray-100" />
  ),
});

const HOST_ADDRESS_KEY = "inca:host-listing-address";

export default function ListingWizardPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  // Carry over whatever was typed on the landing page
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(HOST_ADDRESS_KEY);
      if (stored) {
        setDraft((prev) => ({ ...prev, street: stored }));
      }
    } catch {
      // sessionStorage can be unavailable in private browsing
    }
  }, []);

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const progress = useMemo(() => {
    return [0, 1, 2].map((section) => {
      const inSection = STEPS.filter((s) => s.section === section);
      const done = STEPS.slice(0, stepIndex + 1).filter(
        (s) => s.section === section
      ).length;
      return Math.min(1, done / inSection.length);
    });
  }, [stepIndex]);

  const handleNext = async () => {
    const problem = validateStep(step.id, draft);
    if (problem) {
      setError(problem);
      return;
    }

    if (!isLast) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0 });
      return;
    }

    await publish();
  };

  const publish = async () => {
    setPublishing(true);
    setError("");

    try {
      const form = new FormData();
      form.append("draft", JSON.stringify({ ...draft, photos: undefined }));
      draft.photos.forEach((photo) => form.append("photos", photo));

      const response = await fetch("/api/host/listings", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        setError(
          "You need a host account to publish. Log in as a host and your answers will still be here."
        );
        return;
      }

      if (!response.ok) {
        setError(data.error || "Could not publish your listing");
        return;
      }

      try {
        sessionStorage.removeItem(HOST_ADDRESS_KEY);
      } catch {
        // ignore
      }

      router.push("/admin/properties");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Wizard chrome replaces the site nav, matching the reference flow */}
      <header className="flex items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary-600">InCA</span>
          <span className="text-lg font-medium text-gray-700">Homes</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-shadow duration-200 hover:shadow-md"
          >
            Questions?
          </Link>
          <Link
            href="/"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-shadow duration-200 hover:shadow-md"
          >
            Save &amp; exit
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        {renderStep()}

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-gray-200 bg-white">
        <div className="flex gap-2 px-0">
          {progress.map((value, index) => (
            <div key={index} className="h-1 flex-1 bg-gray-200">
              <div
                className="h-1 bg-gray-900 transition-all duration-300"
                style={{ width: `${value * 100}%` }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 lg:px-12">
          <button
            type="button"
            onClick={() => {
              setStepIndex((i) => Math.max(0, i - 1));
              setError("");
            }}
            disabled={stepIndex === 0}
            className="rounded-lg px-4 py-2 font-medium text-gray-900 underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={publishing}
            className="rounded-lg bg-gray-900 px-8 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publishing ? "Publishing..." : isLast ? "Publish" : "Next"}
          </button>
        </div>
      </footer>
    </div>
  );

  function renderStep() {
    switch (step.id) {
      case "about-your-place":
        return (
          <IntroStep
            step={1}
            title="Tell us about your place"
            body="In this step, we'll ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay."
            image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"
          />
        );

      case "address":
        return (
          <div>
            <StepHeading title="Confirm your address" />
            <div className="space-y-4">
              {(
                [
                  ["country", "Country / region"],
                  ["unit", "Unit, level, etc. (if applicable)"],
                  ["building", "Building name (if applicable)"],
                  ["street", "Street address"],
                  ["district", "Barangay / district (if applicable)"],
                  ["city", "City / municipality"],
                  ["zipCode", "ZIP code"],
                  ["province", "Province"],
                ] as [keyof ListingDraft, string][]
              ).map(([field, label]) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {label}
                  </label>
                  <input
                    id={field}
                    type="text"
                    value={String(draft[field] ?? "")}
                    onChange={(e) => set(field, e.target.value as never)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "structure":
        return (
          <div>
            <StepHeading title="Which of these best describes your place?" />
            <ChoiceGrid
              options={PROPERTY_TYPES}
              value={draft.propertyType}
              onChange={(v) => set("propertyType", v)}
            />
          </div>
        );

      case "privacy-type":
        return (
          <div>
            <StepHeading title="What type of place will guests have?" />
            <ChoiceList
              options={PRIVACY_TYPES}
              value={draft.privacyType}
              onChange={(v) => set("privacyType", v)}
            />
          </div>
        );

      case "location":
        return (
          <div>
            <StepHeading
              title="Is the pin in the right spot?"
              subtitle="Your address is only shared with guests after they've made a reservation. Drag the pin or click the map to reposition it."
            />
            <LocationMap
              latitude={draft.latitude ?? 14.5794}
              longitude={draft.longitude ?? 121.0359}
              onChange={(lat, lng) => {
                setDraft((prev) => ({ ...prev, latitude: lat, longitude: lng }));
              }}
            />
          </div>
        );

      case "location-privacy":
        return (
          <div>
            <StepHeading
              title="Choose how guests see your location on a map"
              subtitle="We only share your address after guests book. Until then, they'll see an approximate location."
            />
            <LocationMap
              latitude={draft.latitude ?? 14.5794}
              longitude={draft.longitude ?? 121.0359}
              onChange={() => {}}
              zoom={draft.showPreciseLocation ? 16 : 13}
              interactive={false}
            />
            <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 p-5">
              <div>
                <p className="font-medium text-gray-900">
                  Show precise location
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Let guests see your home&apos;s exact location on the map
                  before they book.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft.showPreciseLocation}
                onClick={() =>
                  set("showPreciseLocation", !draft.showPreciseLocation)
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                  draft.showPreciseLocation ? "bg-gray-900" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
                    draft.showPreciseLocation ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );

      case "floor-plan":
        return (
          <div>
            <StepHeading
              title="Let's start with the basics"
              subtitle="How many people can stay here?"
            />
            <CounterRow
              label="Guests"
              value={draft.guests}
              onChange={(v) => set("guests", v)}
              min={1}
            />
            <CounterRow
              label="Bedrooms"
              value={draft.bedrooms}
              onChange={(v) => set("bedrooms", v)}
            />
            <CounterRow
              label="Beds"
              value={draft.beds}
              onChange={(v) => set("beds", v)}
            />

            <fieldset className="mt-8">
              <legend className="font-semibold text-gray-900">
                Does every bedroom have a lock?
              </legend>
              <div className="mt-3 space-y-3">
                {["Yes", "No"].map((option) => (
                  <label key={option} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="bedroomLock"
                      value={option}
                      checked={draft.bedroomLock === option}
                      onChange={() => set("bedroomLock", option)}
                      className="h-4 w-4 accent-gray-900"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        );

      case "bathrooms":
        return (
          <div>
            <StepHeading title="What kind of bathrooms are available to guests?" />
            <CounterRow
              label="Private and attached"
              description="It's connected to the guest's room and is just for them."
              value={draft.bathroomsPrivate}
              onChange={(v) => set("bathroomsPrivate", v)}
            />
            <CounterRow
              label="Dedicated"
              description="It's private, but accessed via a shared space, like a hallway."
              value={draft.bathroomsDedicated}
              onChange={(v) => set("bathroomsDedicated", v)}
            />
            <CounterRow
              label="Shared"
              description="It's shared with other people."
              value={draft.bathroomsShared}
              onChange={(v) => set("bathroomsShared", v)}
            />
          </div>
        );

      case "occupancy":
        return (
          <div>
            <StepHeading
              title="Who else might be there?"
              subtitle="Guests need to know whether they'll encounter other people during their stay."
            />
            <MultiSelectGrid
              options={OCCUPANCY_OPTIONS}
              values={draft.occupancy}
              onChange={(v) => set("occupancy", v)}
            />
            <p className="mt-6 text-sm text-gray-600">
              We&apos;ll show this information on your listing and in search
              results.
            </p>
          </div>
        );

      case "stand-out":
        return (
          <IntroStep
            step={2}
            title="Make your place stand out"
            body="In this step, you'll add some of the amenities your place offers, plus 5 or more photos. Then, you'll create a title and description."
            image="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"
          />
        );

      case "amenities":
        return (
          <div>
            <StepHeading
              title="Tell guests what your place has to offer"
              subtitle="You can add more amenities after you publish your listing."
            />
            <h2 className="mb-3 font-semibold text-gray-900">
              What about these guest favourites?
            </h2>
            <MultiSelectGrid
              options={GUEST_FAVOURITE_AMENITIES}
              values={draft.amenities}
              onChange={(v) => set("amenities", v)}
            />

            <h2 className="mb-3 mt-10 font-semibold text-gray-900">
              Do you have any standout amenities?
            </h2>
            <MultiSelectGrid
              options={STANDOUT_AMENITIES}
              values={draft.amenities}
              onChange={(v) => set("amenities", v)}
            />

            <h2 className="mb-3 mt-10 font-semibold text-gray-900">
              Do you have any of these safety items?
            </h2>
            <MultiSelectGrid
              options={SAFETY_AMENITIES}
              values={draft.amenities}
              onChange={(v) => set("amenities", v)}
            />
          </div>
        );

      case "photos":
        return (
          <div>
            <StepHeading
              title="Add some photos of your place"
              subtitle={`You'll need ${MIN_PHOTOS} photos to get started. You can add more or make changes later.`}
            />
            <PhotosStep
              photos={draft.photos}
              onChange={(v) => set("photos", v)}
              minPhotos={MIN_PHOTOS}
            />
          </div>
        );

      case "title":
        return (
          <div>
            <StepHeading
              title="Now, let's give your place a title"
              subtitle="Short titles work best. Have fun with it — you can always change it later."
            />
            <TextStep
              value={draft.title}
              onChange={(v) => set("title", v)}
              max={TITLE_MAX}
              rows={3}
            />
          </div>
        );

      case "description-highlights":
        return (
          <div>
            <StepHeading
              title="Next, let's describe your place"
              subtitle={`Choose up to ${MAX_HIGHLIGHTS} highlights. We'll use these to get your description started.`}
            />
            <ChipSelect
              options={HIGHLIGHTS}
              values={draft.highlights}
              onChange={(v) => set("highlights", v)}
              max={MAX_HIGHLIGHTS}
            />
          </div>
        );

      case "description":
        return (
          <div>
            <StepHeading
              title="Create your description"
              subtitle="Share what makes your place special."
            />
            <TextStep
              value={draft.description}
              onChange={(v) => set("description", v)}
              max={DESCRIPTION_MAX}
              rows={8}
              placeholder="You'll have a great time at this comfortable place to stay."
            />
          </div>
        );

      case "finish-setup":
        return (
          <IntroStep
            step={3}
            title="Finish up and publish"
            body="Finally, you'll choose booking settings, set up pricing, and publish your listing."
            image="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200"
          />
        );

      case "instant-book":
        return (
          <div>
            <StepHeading
              title="Pick your booking settings"
              subtitle="You can change this at any time."
            />
            <ChoiceList
              options={BOOKING_SETTINGS}
              value={draft.instantBook}
              onChange={(v) => set("instantBook", v)}
            />
          </div>
        );

      case "pricing":
        return (
          <div>
            <StepHeading
              title="Now, set your price"
              subtitle="You can change it at any time."
            />
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 p-5">
                <label
                  htmlFor="basePrice"
                  className="block text-sm text-gray-600"
                >
                  Base price per night (₱)
                </label>
                <input
                  id="basePrice"
                  type="number"
                  min={1}
                  value={draft.basePrice}
                  onChange={(e) => set("basePrice", Number(e.target.value))}
                  className="mt-1 w-full border-0 p-0 text-3xl font-bold text-gray-900 focus:outline-none focus:ring-0"
                />
              </div>

              <div className="rounded-xl border border-gray-200 p-5">
                <label
                  htmlFor="weekendAdjustment"
                  className="block text-sm text-gray-600"
                >
                  Weekend adjustment (%)
                </label>
                <div className="flex items-baseline justify-between">
                  <input
                    id="weekendAdjustment"
                    type="number"
                    value={draft.weekendAdjustment}
                    onChange={(e) =>
                      set("weekendAdjustment", Number(e.target.value))
                    }
                    className="mt-1 w-32 border-0 p-0 text-3xl font-bold text-gray-900 focus:outline-none focus:ring-0"
                  />
                  <span className="text-sm text-gray-600">
                    ₱
                    {Math.round(
                      draft.basePrice * (1 + draft.weekendAdjustment / 100)
                    ).toLocaleString()}{" "}
                    for Fri and Sat
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}
