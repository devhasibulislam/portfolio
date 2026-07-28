export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24">
      <p className="text-xs uppercase tracking-widest opacity-60">
        Portfolio · Phase 0 · Foundation
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Hasibul Islam
      </h1>
      <p className="mt-2 max-w-xl text-lg opacity-80">
        Senior full-stack engineer. Backend architecture, LLM/RAG systems, and
        production Node.js.
      </p>
      <p className="mt-8 text-sm opacity-60">
        Foundation is up. See{" "}
        <code className="rounded bg-[var(--color-surface)] px-1.5 py-0.5">
          docs/BUILD_PLAN.md
        </code>{" "}
        for what is next.
      </p>
    </main>
  );
}
