"use client";

import dynamic from "next/dynamic";

export const PageTransition = dynamic(
  () => import("./page-transition-motion").then((mod) => mod.PageTransitionMotion),
  { ssr: false }
);
