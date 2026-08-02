"use client";

import dynamic from "next/dynamic";

// Client-side dynamic import: pdf.js touches `DOMMatrix` at module scope, so
// it can't be evaluated during SSR.
const ResumeViewer = dynamic(
  () => import("./resume-viewer").then((m) => m.ResumeViewer),
  { ssr: false },
);

export function ResumeViewerClient({ url }: { url: string }) {
  return <ResumeViewer url={url} />;
}
