"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";

// Point pdfjs at the worker shipped by pdfjs-dist. Version-pinned by the
// `pdfjs.version` string, so it stays in sync when we upgrade the package.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * PDF viewer built on pdf.js (via react-pdf). Renders every page in a
 * scrollable column, sized to the container width. Works on iOS Safari
 * (which won't render `<object type="application/pdf">` inline), Android,
 * and every desktop browser — no native PDF viewer, all canvas.
 */
export function ResumeViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  const [pageCount, setPageCount] = useState<number>(0);

  // Track the container width so pages scale to it responsively. ResizeObserver
  // handles both sidebar toggles and viewport changes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar h-full min-h-0 w-full overflow-y-auto"
    >
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        loading={
          <div className="text-muted-foreground flex h-full items-center justify-center gap-2 p-8 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading resume…
          </div>
        }
        error={
          <div className="text-muted-foreground p-8 text-center text-sm">
            Couldn&apos;t load the PDF.
          </div>
        }
        className="flex flex-col items-center gap-4 p-4"
      >
        {Array.from({ length: pageCount }, (_, i) => (
          <Page
            key={i + 1}
            pageNumber={i + 1}
            width={width ? Math.min(width - 32, 900) : undefined}
            className="!bg-transparent overflow-hidden rounded-lg shadow-md"
          />
        ))}
      </Document>
    </div>
  );
}
