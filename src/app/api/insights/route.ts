import { NextResponse } from "next/server";
import { getInsightsData } from "@/lib/db/repositories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const insights = await getInsightsData(userId);
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
