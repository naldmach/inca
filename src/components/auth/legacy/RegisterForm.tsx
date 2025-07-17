"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    fullName: z.string().min(2),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(schema),
  });

const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { 
          full_name: data.fullName,
          // Add any additional metadata you want to store
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined
      }
    });

    setLoading(false);

    if (error) {
      console.error('Signup Error:', {
        message: error.message,
        status: error.status,
        cause: error.cause
      });
      setError(error.message || 'An unexpected error occurred during signup');
      return;
    }

    // Check signup result
    if (signUpData.user) {
      // Inform user about email confirmation
      setError('Please check your email to confirm your account');
      
      // Optional: Log successful signup
      console.log('Signup successful, user created:', signUpData.user);
    } else {
      // Unexpected case
      setError('Signup process did not complete. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Full Name</label>
        <input
          type="text"
          {...register("fullName")}
          className="w-full border rounded px-3 py-2"
          autoComplete="name"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border rounded px-3 py-2"
          autoComplete="email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Password</label>
        <input
          type="password"
          {...register("password")}
          className="w-full border rounded px-3 py-2"
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Confirm Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="w-full border rounded px-3 py-2"
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      {error && <p className="text-red-600 text-center">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
