"use client";

import Image from "next/image";
import { Minus, Plus, Upload, X } from "lucide-react";

export function StepHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 text-gray-600">{subtitle}</p>}
    </div>
  );
}

export function IntroStep({
  step,
  title,
  body,
  image,
}: {
  step: number;
  title: string;
  body: string;
  image: string;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <p className="font-medium text-gray-900">Step {step}</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-lg text-gray-600">{body}</p>
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`rounded-xl border p-5 text-left transition-colors duration-200 ${
            value === option
              ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
              : "border-gray-300 hover:border-gray-900"
          }`}
        >
          <span className="font-medium text-gray-900">{option}</span>
        </button>
      ))}
    </div>
  );
}

export function ChoiceList({
  options,
  value,
  onChange,
}: {
  options: {
    value: string;
    label: string;
    description: string;
    recommended?: boolean;
  }[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="space-y-4">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`block w-full rounded-xl border p-5 text-left transition-colors duration-200 ${
            value === option.value
              ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
              : "border-gray-300 hover:border-gray-900"
          }`}
        >
          <p className="font-semibold text-gray-900">{option.label}</p>
          {option.recommended && (
            <p className="text-sm font-medium text-green-700">Recommended</p>
          )}
          <p className="mt-1 text-sm text-gray-600">{option.description}</p>
        </button>
      ))}
    </div>
  );
}

export function MultiSelectGrid({
  options,
  values,
  onChange,
  max,
}: {
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
      return;
    }
    if (max && values.length >= max) return;
    onChange([...values, option]);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const selected = values.includes(option);
        const blocked = !selected && !!max && values.length >= max;

        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={selected}
            disabled={blocked}
            className={`rounded-xl border p-4 text-left transition-colors duration-200 ${
              selected
                ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                : "border-gray-300 hover:border-gray-900"
            } ${blocked ? "cursor-not-allowed opacity-40" : ""}`}
          >
            <span className="text-sm font-medium text-gray-900">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CounterRow({
  label,
  description,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  description?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-5">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && (
          <p className="mt-0.5 text-sm text-gray-600">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors duration-200 hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="w-6 text-center tabular-nums text-gray-900">
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors duration-200 hover:border-gray-900"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ChipSelect({
  options,
  values,
  onChange,
  max,
}: {
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
  max: number;
}) {
  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
      return;
    }
    if (values.length >= max) return;
    onChange([...values, option]);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={selected}
            className={`rounded-full border px-5 py-3 text-sm font-medium transition-colors duration-200 ${
              selected
                ? "border-gray-900 bg-gray-50 text-gray-900 ring-1 ring-gray-900"
                : "border-gray-300 text-gray-700 hover:border-gray-900"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function TextStep({
  value,
  onChange,
  max,
  placeholder,
  rows = 6,
}: {
  value: string;
  onChange: (next: string) => void;
  max: number;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-900 p-4 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
      />
      <p className="mt-2 text-sm font-medium text-gray-700">
        {value.length}/{max}
      </p>
    </div>
  );
}

export function PhotosStep({
  photos,
  onChange,
  minPhotos,
}: {
  photos: File[];
  onChange: (next: File[]) => void;
  minPhotos: number;
}) {
  const addPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onChange([...photos, ...files]);
    e.target.value = "";
  };

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-16 transition-colors duration-200 hover:border-gray-900">
        <Upload className="h-10 w-10 text-gray-500" />
        <span className="mt-4 rounded-lg bg-white px-5 py-2 font-medium text-gray-900 shadow-sm">
          Add photos
        </span>
        <span className="mt-3 text-sm text-gray-600">
          {photos.length} added · {minPhotos} needed to continue
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={addPhotos}
          className="sr-only"
        />
      </label>

      {photos.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={`${photo.name}-${index}`}
              className="relative overflow-hidden rounded-xl border border-gray-200"
            >
              {/* object URLs are cheap here and revoked when the page unloads */}
              <img
                src={URL.createObjectURL(photo)}
                alt={`Listing photo ${index + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(photos.filter((_, i) => i !== index))}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
