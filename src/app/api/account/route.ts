import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword, verifyPassword, verifyToken } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Any signed-in user may edit their own account, so this gate is deliberately
// not restricted to admins. It only ever touches the row named by the token.
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: user, error: lookupError } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (lookupError || !user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updates: Record<string, string> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }

    if (typeof body.email === "string" && body.email.trim()) {
      const email = body.email.trim().toLowerCase();

      if (!EMAIL_PATTERN.test(email)) {
        return NextResponse.json(
          { error: "Enter a valid email address" },
          { status: 400 }
        );
      }

      if (email !== user.email) {
        const { data: taken } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle();

        if (taken) {
          return NextResponse.json(
            { error: "That email is already in use" },
            { status: 409 }
          );
        }

        updates.email = email;
      }
    }

    if (typeof body.newPassword === "string" && body.newPassword) {
      if (body.newPassword.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          {
            error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
          },
          { status: 400 }
        );
      }

      const currentPassword =
        typeof body.currentPassword === "string" ? body.currentPassword : "";

      if (!currentPassword) {
        return NextResponse.json(
          { error: "Enter your current password to set a new one" },
          { status: 400 }
        );
      }

      const valid = await verifyPassword(currentPassword, user.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 403 }
        );
      }

      updates.password_hash = await hashPassword(body.newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select("id, email, name, role")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: updated, message: "Account updated" });
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
