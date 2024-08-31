import dns from "dns/promises";
import { Loader } from "./types";

const load: Loader = async (domain: string) => {
  const allRecords = await Promise.all(
    Object.entries({
      DMARC: dns.resolveTxt,
    }).map(async ([type, method]) => {
      try {
        const records = await method(`_atproto.${domain}`);
        return records.map((record: any) => ({
          value: record,
          type,
        }));
      } catch (error) {
        return [];
      }
    })
  );
  return {
    label: "ATPROTO",
    data: allRecords.flat(),
  };
};

const exports = { load, name: "atproto" };
export default exports;
