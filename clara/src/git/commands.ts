import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runGit(
  repoPath: string,
  args: string[],
): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd: repoPath,
    maxBuffer: 10 * 1024 * 1024,
  });
  return stdout.trimEnd();
}

export async function getDefaultBranch(repoPath: string): Promise<string | null> {
  try {
    const ref = await runGit(repoPath, [
      "symbolic-ref",
      "refs/remotes/origin/HEAD",
    ]);
    return ref.replace("refs/remotes/origin/", "");
  } catch {
    try {
      const branch = await runGit(repoPath, ["branch", "--show-current"]);
      return branch || null;
    } catch {
      return null;
    }
  }
}

export type BranchRef = {
  name: string;
  lastCommitAt: Date;
};

export async function listLocalBranches(
  repoPath: string,
): Promise<BranchRef[]> {
  const output = await runGit(repoPath, [
    "for-each-ref",
    "refs/heads/",
    "--format=%(refname:short)|%(committerdate:iso-strict)",
  ]);

  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, dateText] = line.split("|");
      return {
        name,
        lastCommitAt: new Date(dateText),
      };
    });
}

export type StashRef = {
  name: string;
  message: string;
  lastCommitAt: Date;
};

export async function listStashes(repoPath: string): Promise<StashRef[]> {
  let output: string;
  try {
    output = await runGit(repoPath, [
      "log",
      "-g",
      "refs/stash",
      "--format=%gd\t%cI\t%s",
    ]);
  } catch {
    return [];
  }

  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, dateText, ...messageParts] = line.split("\t");
      const message = messageParts.join("\t");
      return {
        name,
        message,
        lastCommitAt: new Date(dateText),
      };
    });
}
