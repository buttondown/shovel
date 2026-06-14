import { readdir } from "node:fs/promises";
import { join } from "node:path";

async function isGitRepo(path: string): Promise<boolean> {
  try {
    const entries = await readdir(join(path, ".git"));
    return entries.length > 0;
  } catch {
    return false;
  }
}

async function walkForGitRepos(
  directory: string,
  repos: string[],
): Promise<void> {
  if (await isGitRepo(directory)) {
    repos.push(directory);
    return;
  }

  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === ".git") {
      continue;
    }

    await walkForGitRepos(join(directory, entry.name), repos);
  }
}

export async function findGitRepos(root: string): Promise<string[]> {
  const repos: string[] = [];
  await walkForGitRepos(root, repos);
  return repos.sort();
}
