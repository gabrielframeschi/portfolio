import { site } from "@/content/site";

export function Links({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-inline ${className}`}>
      {site.links.map((link) => (
        <li key={link.href}>
          <a href={link.href} className="hover-strong hover-strong-text">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
