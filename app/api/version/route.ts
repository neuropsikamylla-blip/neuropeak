import { NextResponse } from "next/server";
import pkg from "@/package.json";

export async function GET() {
  const appVersion = pkg.version;
  const buildId =
    process.env.VERCEL_DEPLOYMENT_ID ??
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    "local";

  return NextResponse.json(
    { version: `${appVersion}-${buildId}`, appVersion, buildId },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
