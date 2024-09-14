import osspledge from "./loaders/osspledge";
import tranco from "./loaders/tranco";
import ycombinator from "./loaders/ycombinator";
import type { Affiliation } from "./types";

type RegisteredAffiliation = {
	identifier: string;
	name: string;
	domain?: string;
	load: () => AsyncGenerator<Affiliation>;
};

export const REGISTRY: { [key in string]: RegisteredAffiliation } = {
	tranco: {
		identifier: "tranco",
		name: "Tranco",
		load: tranco,
	},
	ycombinator: {
		identifier: "ycombinator",
		name: "Y Combinator",
		load: ycombinator,
		domain: "ycombinator.com",
	},
	osspledge: {
		identifier: "osspledge",
		name: "OSS Pledge",
		load: osspledge,
		domain: "osspledge.com",
	},
};
