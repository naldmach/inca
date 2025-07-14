"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price_per_month: z.number().min(1),
  property_type: z.string().min(2),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zip_code: z.string().min(3),
  images: z.any(),
});

type PropertyFormData = z.infer<typeof schema>;

export default function PropertyCreateForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bedrooms: 0,
      bathrooms: 0,
      price_per_month: 0,
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append(
      "propertyData",
      JSON.stringify({
        ...data,
        images: undefined, // images handled separately
      })
    );
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append("images", data.images[i]);
      }
    }
    const res = await fetch("/api/properties", {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Property created!");
      reset();
    } else {
      const { error } = await res.json();
      setError(error || "Failed to create property");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input
          type="text"
          {...register("title")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          {...register("description")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Price per Month</label>
          <input
            type="number"
            {...register("price_per_month", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.price_per_month && (
            <p className="text-red-500 text-sm mt-1">
              {errors.price_per_month.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Property Type</label>
          <input
            type="text"
            {...register("property_type")}
            className="w-full border rounded px-3 py-2"
          />
          {errors.property_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.property_type.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Bedrooms</label>
          <input
            type="number"
            {...register("bedrooms", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.bedrooms && (
            <p className="text-red-500 text-sm mt-1">
              {errors.bedrooms.message}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Bathrooms</label>
          <input
            type="number"
            {...register("bathrooms", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.bathrooms && (
            <p className="text-red-500 text-sm mt-1">
              {errors.bathrooms.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Address</label>
        <input
          type="text"
          {...register("address")}
          className="w-full border rounded px-3 py-2"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">City</label>
          <input
            type="text"
            {...register("city")}
            className="w-full border rounded px-3 py-2"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">State</label>
          <input
            type="text"
            {...register("state")}
            className="w-full border rounded px-3 py-2"
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Zip Code</label>
          <input
            type="text"
            {...register("zip_code")}
            className="w-full border rounded px-3 py-2"
          />
          {errors.zip_code && (
            <p className="text-red-500 text-sm mt-1">
              {errors.zip_code.message}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Images</label>
        <input
          type="file"
          {...register("images")}
          className="w-full"
          multiple
          accept="image/*"
        />
      </div>
      {error && <p className="text-red-600 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Property"}
      </button>
    </form>
  );
}
