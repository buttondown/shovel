import dns from "dns/promises";
import { REGISTRY } from "../services";
import { Loader } from "./types";

const SERVICES_WITH_DNS_PREFIX = Object.entries(REGISTRY).filter(
    ([identifier, service]) => service.dns_prefix
).map(([identifier, service]) => identifier);

const load: Loader = async (domain: string) => {
    const allRecords = await Promise.all(
        SERVICES_WITH_DNS_PREFIX.map(async (identifier) => {
            try {
                const records = await dns.resolveTxt(`_${identifier}.${domain}`);
                return records.map((record: any) => ({
                    value: record[0],
                    type: identifier,
                }));
            } catch (error) {
                return [];
            }
        })
    );
    return {
        label: "SERVICE",
        data: allRecords.flat(),
    };
};

const exports = { load, name: "dns_prefix" };
export default exports;
