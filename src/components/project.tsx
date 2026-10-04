import { site, type Project } from "@/content/site";

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

type ProjectItemProps = {
  project: Project;
  updatedAt: Date;
};

export function ProjectItem({ project, updatedAt }: ProjectItemProps) {
  return (
    <a href={`https://github.com/${project.repo}`} className="hover-strong block">
      <h2 className="font-medium text-fg">{project.name}</h2>
      <p className="hover-strong-text">{project.thesis}</p>
      <p className="hover-strong-text">
        {project.status} · {site.labels.updated}{" "}
        <time dateTime={updatedAt.toISOString()}>{monthYear.format(updatedAt)}</time>
      </p>
    </a>
  );
}
