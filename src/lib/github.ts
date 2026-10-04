const API_URL = "https://api.github.com";

/**
 * Date of the latest push to a public repository, given as "owner/name".
 * Throws on failure so a regeneration keeps serving the last good page.
 */
export async function getLastPush(repo: string): Promise<Date> {
  // Optional: a token raises the rate limit for anonymous requests.
  const token = process.env.GITHUB_TOKEN;

  const response = await fetch(`${API_URL}/repos/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded ${response.status} for ${repo}`);
  }

  const { pushed_at } = (await response.json()) as { pushed_at: string };
  return new Date(pushed_at);
}
