import { RecordGroup } from "../loaders/types";
import { REGISTRY } from "../services";

export type DetectedTechnology = {
    identifier: keyof typeof REGISTRY;
    metadata: Record<string, string>;
};

export type Parser = (data: RecordGroup[]) => DetectedTechnology[];
