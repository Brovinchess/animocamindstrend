import { NextResponse } from "next/server";
import { getStoredAccounts, isConfigured } from "@/lib/reddit-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: isConfigured(),
    accounts: getStoredAccounts(),
  });
}
