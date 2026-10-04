import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/content/site";

export function Intro({ className = "" }: { className?: string }) {
  return (
    <header className={`flex items-start justify-between gap-inline ${className}`}>
      <div>
        <h1 className="font-serif font-medium text-fg">{site.name}</h1>
        <p>{site.role}</p>
      </div>
      <ThemeToggle label={site.labels.themeToggle} />
    </header>
  );
}
