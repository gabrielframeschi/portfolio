// Every piece of copy and every link on the site lives here. Nothing is
// invented: new text enters as a draft for review.

export type Project = {
  name: string;
  /** One line, taken from the repository description. */
  thesis: string;
  status: string;
  /** GitHub repository as "owner/name". Its last push dates the status. */
  repo: string;
};

export type Link = {
  label: string;
  href: string;
};

export const site = {
  name: "Gabriel Frameschi",
  role: "Senior frontend developer at Cantu Inc.",
  url: "https://gabrielframeschi.com",
  projects: [
    {
      name: "WaveMesh",
      thesis: "Double-ender multitrack recording studio that runs entirely in the browser.",
      status: "In progress",
      repo: "gabrielframeschi/wavemesh",
    },
  ] satisfies Project[],
  links: [
    { label: "GitHub", href: "https://github.com/gabrielframeschi" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/gabrielframeschi/" },
  ] satisfies Link[],
  labels: {
    updated: "updated",
  },
};
