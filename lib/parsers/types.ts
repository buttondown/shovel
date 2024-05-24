import { RecordGroup } from "../loaders/types";

export type Note = {
  label: string;
  metadata: Record<string, string>;
};

export type Parser = (data: RecordGroup[]) => Note[];
