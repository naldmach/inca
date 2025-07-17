"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

const registerSchema = z
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

type RegisterFormData = z.infer<typeof registerSchema>;

const forgotSchema = z.object({
  email: z.string().email(),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function AuthForm() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const router = useRouter();

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Forgot password form
  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  // Handlers
  const onLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setPendingEmail(null);
    const supabase = createClient();
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      if (
        error.status === 403 ||
        (error.message && error.message.toLowerCase().includes("not confirmed"))
      ) {
        setError("Please confirm your email before logging in.");
        setPendingEmail(data.email);
      } else {
        setError(error.message || "Login failed");
      }
      return;
    }
    if (loginData.user) {
      if (loginData.user.email_confirmed_at) {
        router.push("/dashboard");
      } else {
        setError("Please confirm your email before logging in.");
        setPendingEmail(data.email);
      }
    } else {
      setError("Login process did not complete. Please try again.");
    }
  };

  const onResendConfirmation = async () => {
    if (!pendingEmail) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    // Try to trigger a resend by calling signUp again
    const { error } = await supabase.auth.signUp({
      email: pendingEmail,
      password: Math.random().toString(36), // dummy password, won't be used
    });
    setLoading(false);
    if (error) {
      setError(
        error.message ||
          "Failed to resend confirmation email. Please try again later."
      );
    } else {
      setSuccess("Confirmation email resent. Please check your inbox.");
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard`
            : undefined,
      },
    });
    setLoading(false);
    if (error) {
      // Check for 'User already registered' error
      if (
        error.message &&
        (error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("user already exists") ||
          error.message.toLowerCase().includes("email already in use"))
      ) {
        setError(
          "This email is already registered. Please sign in or reset your password."
        );
      } else {
        setError(error.message || "Signup failed");
      }
      return;
    }
    if (signUpData.user) {
      setSuccess("Please check your email to confirm your account");
    } else {
      setError("Signup process did not complete. Please try again.");
    }
  };

  const onForgot = async (data: ForgotFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined,
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Failed to send reset email");
    } else {
      setSuccess("Password reset email sent. Please check your inbox.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded shadow">
      <div className="flex mb-6">
        <button
          className={`flex-1 py-2 font-semibold rounded-l ${
            tab === "login" && !forgot
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => {
            setTab("login");
            setForgot(false);
            setError(null);
            setSuccess(null);
          }}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-2 font-semibold rounded-r ${
            tab === "register" && !forgot
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => {
            setTab("register");
            setForgot(false);
            setError(null);
            setSuccess(null);
          }}
        >
          Create Account
        </button>
      </div>
      {forgot ? (
        <form onSubmit={handleForgotSubmit(onForgot)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              {...forgotRegister("email")}
              className="w-full border rounded px-3 py-2"
              autoComplete="email"
            />
            {forgotErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {forgotErrors.email.message}
              </p>
            )}
          </div>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
          <button
            type="button"
            className="w-full mt-2 text-blue-600 hover:underline"
            onClick={() => {
              setForgot(false);
              setError(null);
              setSuccess(null);
            }}
          >
            Back to Sign In
          </button>
        </form>
      ) : tab === "login" ? (
        <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              {...loginRegister("email")}
              className="w-full border rounded px-3 py-2"
              autoComplete="email"
            />
            {loginErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {loginErrors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              {...loginRegister("password")}
              className="w-full border rounded px-3 py-2"
              autoComplete="current-password"
            />
            {loginErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {loginErrors.password.message}
              </p>
            )}
          </div>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {pendingEmail && (
            <button
              type="button"
              className="w-full mt-2 text-blue-600 hover:underline"
              onClick={onResendConfirmation}
              disabled={loading}
            >
              {loading ? "Resending..." : "Resend confirmation email"}
            </button>
          )}
          {success && <p className="text-green-600 text-center">{success}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button"
            className="w-full mt-2 text-blue-600 hover:underline"
            onClick={() => {
              setForgot(true);
              setError(null);
              setSuccess(null);
            }}
          >
            Forgot password?
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              {...registerRegister("fullName")}
              className="w-full border rounded px-3 py-2"
              autoComplete="name"
            />
            {registerErrors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {registerErrors.fullName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              {...registerRegister("email")}
              className="w-full border rounded px-3 py-2"
              autoComplete="email"
            />
            {registerErrors.email && (
              <p className="text-red-500 text-sm mt-1">
                {registerErrors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              {...registerRegister("password")}
              className="w-full border rounded px-3 py-2"
              autoComplete="new-password"
            />
            {registerErrors.password && (
              <p className="text-red-500 text-sm mt-1">
                {registerErrors.password.message}
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Confirm Password</label>
            <input
              type="password"
              {...registerRegister("confirmPassword")}
              className="w-full border rounded px-3 py-2"
              autoComplete="new-password"
            />
            {registerErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {registerErrors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
