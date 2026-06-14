export type StaleKind = "branch" | "stash";

export type StaleItem = {
  kind: StaleKind;
  repository: string;
  name: string;
  lastCommitAt: Date;
  ageDays: number;
};

export type Item = StaleItem;
