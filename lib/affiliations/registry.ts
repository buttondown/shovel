import tranco from "./loaders/tranco";
import { Affiliation } from "./types";

type RegisteredAffiliation = {
    identifier: string;
    name: string;
    load: () => Promise<Affiliation[]>;
};

export const REGISTRY: { [key in string]: RegisteredAffiliation } = {
    "tranco": {
        identifier: "tranco",
        name: "Tranco",
        load: tranco,
    },
};
