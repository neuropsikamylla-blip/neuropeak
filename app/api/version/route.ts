import { NextResponse } from "next/server";

export async function GET() {
  // On Vercel, VERCEL_DEPLOYMENT_ID is unique per deploy.
  // Locally, falls back to a fixed "dev" string.
  const version =
    process.env.VERCEL_DEPLOYMENT_ID ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    "dev";

  return NextResponse.json({ version }, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
