import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isProfileComplete } from "@/lib/auth/types";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isProfileComplete(session)) {
    redirect("/onboarding");
  }

  redirect("/insights");
}
