import { Affiliation } from "../types";

const TRANCO_URL = "https://tranco-list.eu/download/KJ94W/1000000";

export default async function load(): Promise<Affiliation[]> {
        const response = await fetch(TRANCO_URL);
        const data = await response.text();
        const lines = data.split('\n').filter(line => line.trim() !== '').map(line => line.split(','));
        return lines.map(([rank, domain]) => ({
            identifier: domain,
            metadata: {
                rank: rank,
            },
    }));
}
