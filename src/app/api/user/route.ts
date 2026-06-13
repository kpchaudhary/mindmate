import { NextResponse } from "next/server";
import { z } from "zod";
import { examTypes } from "@/lib/db/schema";
import { getUserById, updateUser } from "@/lib/db/repositories";

const updateUserSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(80),
  examType: z.enum(examTypes),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { userId, name, examType } = parsed.data;
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await updateUser(userId, { name, examType });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      examType: updated.examType,
    });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
