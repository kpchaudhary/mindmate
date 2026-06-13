import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import LoginPageClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPageClient />
    </Suspense>
  );
}
