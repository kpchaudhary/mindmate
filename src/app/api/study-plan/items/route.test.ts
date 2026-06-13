import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PATCH, POST } from "./route";

vi.mock("@/lib/auth/require-session", () => ({
  requireSession: vi.fn(),
  isSessionUser: vi.fn((result) => !(result instanceof NextResponse)),
}));

vi.mock("@/lib/db/repositories", () => ({
  addStudyPlanItem: vi.fn(),
  deleteStudyPlanItem: vi.fn(),
  updateStudyPlanItem: vi.fn(),
}));

import { requireSession } from "@/lib/auth/require-session";
import { addStudyPlanItem, deleteStudyPlanItem, updateStudyPlanItem } from "@/lib/db/repositories";

const sessionUser = {
  id: "user-1",
  email: "student@example.com",
  name: "Priya",
  examType: "NEET" as const,
  examDate: null,
  streakCount: 0,
  reminderEnabled: false,
  reminderTime: null,
  language: "en" as const,
  avatarUrl: null,
};

const mockItem = {
  id: "11111111-1111-4111-8111-111111111111",
  planId: "22222222-2222-4222-8222-222222222222",
  subject: "Physics",
  topic: "Mechanics",
  description: "Revise kinematics",
  durationMinutes: 60,
  scheduledDate: new Date("2026-06-15T09:00:00.000Z"),
  status: "pending" as const,
  sortOrder: 0,
  isUserEdited: false,
  createdAt: new Date(),
};

describe("study-plan items API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireSession).mockResolvedValue(sessionUser);
  });

  it("PATCH returns 400 for invalid input", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/study-plan/items", {
        method: "PATCH",
        body: JSON.stringify({ id: "not-a-uuid" }),
      })
    );
    expect(response.status).toBe(400);
  });

  it("PATCH updates item", async () => {
    vi.mocked(updateStudyPlanItem).mockResolvedValue({ ...mockItem, status: "done" });

    const response = await PATCH(
      new Request("http://localhost/api/study-plan/items", {
        method: "PATCH",
        body: JSON.stringify({ id: mockItem.id, status: "done" }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.item.status).toBe("done");
  });

  it("POST creates item", async () => {
    vi.mocked(addStudyPlanItem).mockResolvedValue(mockItem);

    const response = await POST(
      new Request("http://localhost/api/study-plan/items", {
        method: "POST",
        body: JSON.stringify({
          planId: mockItem.planId,
          subject: mockItem.subject,
          topic: mockItem.topic,
          description: mockItem.description,
          durationMinutes: mockItem.durationMinutes,
          scheduledDate: mockItem.scheduledDate.toISOString(),
        }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.item.topic).toBe("Mechanics");
  });

  it("DELETE removes item", async () => {
    vi.mocked(deleteStudyPlanItem).mockResolvedValue(true);

    const response = await DELETE(
      new Request("http://localhost/api/study-plan/items", {
        method: "DELETE",
        body: JSON.stringify({ id: mockItem.id }),
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});
