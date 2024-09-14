import type { RecordGroup } from "../loaders/types";
import type { REGISTRY } from "../services";

export type DetectedTechnology = {
	identifier: keyof typeof REGISTRY;
	metadata: Record<string, string>;
};

export type Parser = (
	domain: string,
	data: RecordGroup[],
) => Promise<DetectedTechnology[]>;
