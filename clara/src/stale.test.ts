import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  ageInDays,
  DEFAULT_STALE_DAYS,
  getStaleItems,
  isStale,
} from "./getters/stale";

function git(cwd: string, args: string[]): void {
  execFileSync("git", args, { cwd, stdio: "pipe" });
}

function gitWithEnv(
  cwd: string,
  args: string[],
  env: Record<string, string>,
): void {
  execFileSync("git", args, {
    cwd,
    stdio: "pipe",
    env: { ...process.env, ...env },
  });
}

async function createRepo(
  root: string,
  name: string,
  options: { branch?: string; daysAgo?: number } = {},
): Promise<string> {
  const repoPath = join(root, name);
  git(root, ["init", name, "-b", options.branch ?? "main"]);
  git(repoPath, ["config", "user.email", "clara@test.local"]);
  git(repoPath, ["config", "user.name", "Clara Test"]);
  git(repoPath, ["commit", "--allow-empty", "-m", "initial"]);

  if (options.daysAgo !== undefined) {
    const date = new Date();
    date.setDate(date.getDate() - options.daysAgo);
    const env = {
      GIT_AUTHOR_DATE: date.toISOString(),
      GIT_COMMITTER_DATE: date.toISOString(),
    };
    gitWithEnv(repoPath, ["commit", "--allow-empty", "-m", "aged commit"], env);
  }

  return repoPath;
}

describe("isStale", () => {
  test("treats items older than the threshold as stale", () => {
    const now = new Date("2026-06-14T12:00:00Z");
    const lastCommitAt = new Date("2026-06-11T12:00:00Z");

    expect(isStale(lastCommitAt, DEFAULT_STALE_DAYS, now)).toBe(true);
  });

  test("treats recent items as not stale", () => {
    const now = new Date("2026-06-14T12:00:00Z");
    const lastCommitAt = new Date("2026-06-13T12:00:00Z");

    expect(isStale(lastCommitAt, DEFAULT_STALE_DAYS, now)).toBe(false);
  });
});

describe("getStaleItems", () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "clara-stale-"));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  test("returns stale branches and stashes across repositories", async () => {
    const repoA = await createRepo(root, "repo-a");
    const repoB = await createRepo(root, "repo-b");

    git(repoA, ["checkout", "-b", "feature/old"]);
    gitWithEnv(
      repoA,
      ["commit", "--allow-empty", "-m", "old branch work"],
      {
        GIT_AUTHOR_DATE: "2026-06-01T12:00:00Z",
        GIT_COMMITTER_DATE: "2026-06-01T12:00:00Z",
      },
    );

    git(repoA, ["checkout", "-b", "feature/fresh"]);
    gitWithEnv(
      repoA,
      ["commit", "--allow-empty", "-m", "recent branch work"],
      {
        GIT_AUTHOR_DATE: "2026-06-13T12:00:00Z",
        GIT_COMMITTER_DATE: "2026-06-13T12:00:00Z",
      },
    );

    git(repoB, ["checkout", "-b", "justin/20260601-stash"]);
    gitWithEnv(
      repoB,
      ["commit", "--allow-empty", "-m", "stash branch"],
      {
        GIT_AUTHOR_DATE: "2026-05-20T12:00:00Z",
        GIT_COMMITTER_DATE: "2026-05-20T12:00:00Z",
      },
    );

    git(repoB, ["checkout", "main"]);
    execFileSync("sh", ["-c", "echo tracked > tracked.txt"], { cwd: repoB });
    git(repoB, ["add", "tracked.txt"]);
    gitWithEnv(
      repoB,
      ["commit", "-m", "track file"],
      {
        GIT_AUTHOR_DATE: "2026-06-01T12:00:00Z",
        GIT_COMMITTER_DATE: "2026-06-01T12:00:00Z",
      },
    );
    execFileSync("sh", ["-c", "echo changed >> tracked.txt"], { cwd: repoB });
    gitWithEnv(repoB, ["stash", "push", "-m", "old stash"], {
      GIT_AUTHOR_DATE: "2026-05-15T12:00:00Z",
      GIT_COMMITTER_DATE: "2026-05-15T12:00:00Z",
    });

    const items = await getStaleItems({
      repositoriesRoot: root,
      staleDays: 2,
      now: new Date("2026-06-14T12:00:00Z"),
    });

    expect(items.map((item) => `${item.kind}:${item.name}`)).toEqual([
      "branch:feature/old",
      "branch:justin/20260601-stash",
      "stash:stash@{0}: On main: old stash",
    ]);
  });

  test("skips the default branch even when it is old", async () => {
    await createRepo(root, "repo-main", { daysAgo: 10 });

    const items = await getStaleItems({
      repositoriesRoot: root,
      staleDays: 2,
      now: new Date("2026-06-14T12:00:00Z"),
    });

    expect(items).toEqual([]);
  });
});

describe("ageInDays", () => {
  test("returns fractional days for recent commits", () => {
    const now = new Date("2026-06-14T12:00:00Z");
    const lastCommitAt = new Date("2026-06-13T12:00:00Z");

    expect(ageInDays(lastCommitAt, now)).toBeCloseTo(1);
  });
});
