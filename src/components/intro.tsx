import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/content/site";

type IntroProps = {
  className?: string;
  /** Away from the home page, the name links back to it instead of being the page heading. */
  linkHome?: boolean;
};

export function Intro({ className = "", linkHome = false }: IntroProps) {
  const nameClass = "font-serif font-medium text-fg";

  return (
    <header className={`flex items-start justify-between gap-inline ${className}`}>
      <div>
        {linkHome ? (
          <p>
            <Link href="/" className={nameClass}>
              {site.name}
            </Link>
          </p>
        ) : (
          <h1 className={nameClass}>{site.name}</h1>
        )}
        <p>{site.role}</p>
      </div>
      <ThemeToggle label={site.labels.themeToggle} />
    </header>
  );
}
