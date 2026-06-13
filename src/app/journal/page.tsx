"use client";

import { useState } from "react";
import { AppShell, useUser } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { JournalForm } from "@/features/journal/journal-form";
import { JournalHistory } from "@/features/journal/journal-history";

function JournalContent() {
  const user = useUser();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <PageHeader
        title="Daily Journal"
        description="Write freely — MindMate analyzes patterns standard trackers miss."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <JournalForm user={user} onSubmitted={() => setRefreshKey((k) => k + 1)} />
        <JournalHistory user={user} refreshKey={refreshKey} />
      </div>
    </>
  );
}

export default function JournalPage() {
  return (
    <AppShell>
      <JournalContent />
    </AppShell>
  );
}
