import type { ReactNode } from "react";

/** The single centered column every page is laid out in. */
export function PageColumn({ children }: { children: ReactNode }) {
  return (
    <main className="px-gutter py-page">
      <div className="mx-auto flex max-w-content flex-col gap-section">{children}</div>
    </main>
  );
}
