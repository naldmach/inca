import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  let supabase;
  try {
    supabase = createClient();
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Database connection failed. Please check environment variables.",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from("properties")
      .select("id, title, status")
      .limit(5);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      properties: data,
      count: data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
