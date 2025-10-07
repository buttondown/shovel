import dns from "dns/promises";
import { Loader } from "./types";

export type DNSRecord = {
  value: string;
  type: string;
};

const TYPE_TO_LOOKUP = {
  MX: dns.resolveMx,
  A: dns.resolve4,
  AAAA: dns.resolve6,
  CNAME: dns.resolveCname,
  TXT: dns.resolveTxt,
  NS: dns.resolveNs,
};

const TYPE_TO_MUNGING_FUNCTION: {
  [key: string]: (record: any) => string;
} = {
  MX: ({ exchange, priority }: { exchange: string; priority: number }) =>
    `${exchange} (priority: ${priority})`,
  TXT: (record: string[]) => record.join(""),
};

const load: Loader = async (domain: string) => {
  const allRecords = await Promise.all(
    Object.entries(TYPE_TO_LOOKUP).map(async ([type, method]) => {
      try {
        const records = await method(domain);
        const mungedRecords = records.map((record: any) => ({
          value: TYPE_TO_MUNGING_FUNCTION[type]
            ? TYPE_TO_MUNGING_FUNCTION[type](record)
            : record,
          type,
        }));
        return mungedRecords;
      } catch (error) {
        return [];
      }
    })
  );
  const sortedRecords = allRecords
    .flat()
    .sort((a, b) => `${a.type}${a.value}`.localeCompare(`${b.type}${b.value}`));
  return {
    label: "DNS",
    data: sortedRecords,
  };
};

const exports = { load, name: "dns" };
export default exports;
