import { homedir } from "node:os";
import { join } from "node:path";
import {
  getDefaultBranch,
  listLocalBranches,
  listStashes,
} from "../git/commands";
import { findGitRepos } from "../git/repos";
import type { StaleItem } from "../types";

export const DEFAULT_STALE_DAYS = 2;
export const DEFAULT_REPOSITORIES_ROOT = join(homedir(), "repositories");

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isStale(lastCommitAt: Date, staleDays: number, now = new Date()): boolean {
  const ageMs = now.getTime() - lastCommitAt.getTime();
  return ageMs > staleDays * MS_PER_DAY;
}

export function ageInDays(lastCommitAt: Date, now = new Date()): number {
  const ageMs = Math.max(0, now.getTime() - lastCommitAt.getTime());
  return ageMs / MS_PER_DAY;
}

export type GetStaleItemsOptions = {
  repositoriesRoot?: string;
  staleDays?: number;
  now?: Date;
};

export async function getStaleItems(
  options: GetStaleItemsOptions = {},
): Promise<StaleItem[]> {
  const repositoriesRoot = options.repositoriesRoot ?? DEFAULT_REPOSITORIES_ROOT;
  const staleDays = options.staleDays ?? DEFAULT_STALE_DAYS;
  const now = options.now ?? new Date();
  const repos = await findGitRepos(repositoriesRoot);
  const items: StaleItem[] = [];

  for (const repository of repos) {
    const defaultBranch = await getDefaultBranch(repository);

    for (const branch of await listLocalBranches(repository)) {
      if (defaultBranch && branch.name === defaultBranch) {
        continue;
      }

      if (!isStale(branch.lastCommitAt, staleDays, now)) {
        continue;
      }

      items.push({
        kind: "branch",
        repository,
        name: branch.name,
        lastCommitAt: branch.lastCommitAt,
        ageDays: ageInDays(branch.lastCommitAt, now),
      });
    }

    for (const stash of await listStashes(repository)) {
      if (!isStale(stash.lastCommitAt, staleDays, now)) {
        continue;
      }

      items.push({
        kind: "stash",
        repository,
        name: stash.message ? `${stash.name}: ${stash.message}` : stash.name,
        lastCommitAt: stash.lastCommitAt,
        ageDays: ageInDays(stash.lastCommitAt, now),
      });
    }
  }

  return items.sort((left, right) => {
    if (left.repository !== right.repository) {
      return left.repository.localeCompare(right.repository);
    }
    if (left.kind !== right.kind) {
      return left.kind.localeCompare(right.kind);
    }
    return left.name.localeCompare(right.name);
  });
}
