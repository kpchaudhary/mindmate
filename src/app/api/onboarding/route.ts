import { NextResponse } from "next/server";
import { onboardingSchema } from "@/lib/ai/schemas";
import { createUser } from "@/lib/db/repositories";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const user = await createUser(parsed.data.name, parsed.data.examType);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      examType: user.examType,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
