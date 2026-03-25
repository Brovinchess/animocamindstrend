import { NextResponse } from "next/server";
import { getConnectedAccounts, isConfigured } from "@/lib/twitter-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    configured: isConfigured(),
    accounts: getConnectedAccounts(),
  });
}
