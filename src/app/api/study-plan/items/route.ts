import { NextResponse } from "next/server";
import {
  studyPlanItemCreateSchema,
  studyPlanItemDeleteSchema,
  studyPlanItemPatchSchema,
} from "@/lib/ai/schemas";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import {
  addStudyPlanItem,
  deleteStudyPlanItem,
  updateStudyPlanItem,
} from "@/lib/db/repositories";

export async function PATCH(request: Request) {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = studyPlanItemPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, scheduledDate, ...patch } = parsed.data;
    const item = await updateStudyPlanItem(id, sessionResult.id, {
      ...patch,
      ...(scheduledDate !== undefined && { scheduledDate: new Date(scheduledDate) }),
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: item.id,
        subject: item.subject,
        topic: item.topic,
        description: item.description,
        durationMinutes: item.durationMinutes,
        scheduledDate: item.scheduledDate.toISOString(),
        status: item.status,
        sortOrder: item.sortOrder,
        isUserEdited: item.isUserEdited,
      },
    });
  } catch (error) {
    console.error("Study plan item patch error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = studyPlanItemCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const item = await addStudyPlanItem(parsed.data.planId, sessionResult.id, {
      subject: parsed.data.subject,
      topic: parsed.data.topic,
      description: parsed.data.description,
      durationMinutes: parsed.data.durationMinutes,
      scheduledDate: new Date(parsed.data.scheduledDate),
    });

    if (!item) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({
      item: {
        id: item.id,
        subject: item.subject,
        topic: item.topic,
        description: item.description,
        durationMinutes: item.durationMinutes,
        scheduledDate: item.scheduledDate.toISOString(),
        status: item.status,
        sortOrder: item.sortOrder,
        isUserEdited: item.isUserEdited,
      },
    });
  } catch (error) {
    console.error("Study plan item create error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionResult = await requireSession();
    if (!isSessionUser(sessionResult)) return sessionResult;

    const body = await request.json();
    const parsed = studyPlanItemDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const deleted = await deleteStudyPlanItem(parsed.data.id, sessionResult.id);
    if (!deleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Study plan item delete error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
