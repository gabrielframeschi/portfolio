import { site } from "@/content/site";

export function Intro({ className = "" }: { className?: string }) {
  return (
    <header className={className}>
      <h1 className="font-serif font-medium text-fg">{site.name}</h1>
      <p>{site.role}</p>
    </header>
  );
}
