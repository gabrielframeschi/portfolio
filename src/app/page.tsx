import { Intro } from "@/components/intro";
import { Links } from "@/components/links";
import { ProjectItem } from "@/components/project";
import { site } from "@/content/site";
import { getLastPush } from "@/lib/github";

// Project dates come from GitHub, so regenerate the page at most once a day.
export const revalidate = 86400;

export default async function Home() {
  const projects = await Promise.all(
    site.projects.map(async (project) => ({
      project,
      updatedAt: await getLastPush(project.repo),
    })),
  );

  return (
    <main className="px-gutter py-page">
      <div className="mx-auto flex max-w-content flex-col gap-section">
        <Intro className="enter" />
        <ul className="enter [--enter-index:1]">
          {projects.map(({ project, updatedAt }) => (
            <li key={project.repo}>
              <ProjectItem project={project} updatedAt={updatedAt} />
            </li>
          ))}
        </ul>
        <Links className="enter [--enter-index:2]" />
      </div>
    </main>
  );
}
