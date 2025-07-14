"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
  });

const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (error) {
      console.error('Login Error:', {
        message: error.message,
        status: error.status,
        cause: error.cause
      });

      // Specific error handling
      switch (error.status) {
        case 400:
          setError('Invalid login credentials');
          break;
        case 401:
          setError('Unauthorized. Please check your email and password.');
          break;
        case 403:
          setError('Email not confirmed. Please check your email.');
          break;
        default:
          setError(error.message || 'An unexpected error occurred');
      }
      return;
    }

    // Check login result
    if (loginData.user) {
      // Check email confirmation status
      if (loginData.user.email_confirmed_at) {
        router.push("/dashboard");
      } else {
        setError('Please confirm your email before logging in');
      }
    } else {
      setError('Login process did not complete. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-red-600 text-center">{error}</p>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
