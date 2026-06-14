#!/usr/bin/env bun

import { getStaleItems } from "./getters/stale";

function formatAge(ageDays: number): string {
  if (ageDays < 1) {
    return `${Math.round(ageDays * 24)}h`;
  }

  return `${Math.round(ageDays)}d`;
}

function printHuman(items: Awaited<ReturnType<typeof getStaleItems>>): void {
  if (items.length === 0) {
    console.log("No stale branches or stashes found.");
    return;
  }

  let currentRepository = "";

  for (const item of items) {
    if (item.repository !== currentRepository) {
      currentRepository = item.repository;
      console.log(`\n${currentRepository}`);
    }

    console.log(
      `  ${item.kind.padEnd(6)} ${item.name} (${formatAge(item.ageDays)} old)`,
    );
  }

  console.log("");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command !== "stale") {
    console.error("Usage: clara stale [--json] [--days=<number>]");
    process.exit(1);
  }

  const json = args.includes("--json");
  const daysArg = args.find((arg) => arg.startsWith("--days="));
  const staleDays = daysArg ? Number.parseInt(daysArg.split("=")[1] ?? "", 10) : 2;

  if (!Number.isFinite(staleDays) || staleDays < 0) {
    console.error("Invalid --days value.");
    process.exit(1);
  }

  const items = await getStaleItems({ staleDays });

  if (json) {
    console.log(
      JSON.stringify(
        items.map((item) => ({
          ...item,
          lastCommitAt: item.lastCommitAt.toISOString(),
        })),
        null,
        2,
      ),
    );
    return;
  }

  printHuman(items);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
