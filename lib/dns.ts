import dns from "dns/promises";

export type DNSRecord = {
  value: string;
  type: string;
};

const TYPE_TO_LOOKUP: {
  [key: string]: keyof typeof dns;
} = {
  MX: "resolveMx",
  A: "resolve4",
  AAAA: "resolve6",
  TXT: "resolveTxt",
  NS: "resolveNs",
  CNAME: "resolveCname",
};

const TYPE_TO_MUNGING_FUNCTION = {
  MX: ({ exchange, priority }: { exchange: string; priority: number }) =>
    `${exchange} (priority: ${priority})`,
};

const lookup = async (domain: string): Promise<DNSRecord[]> => {
  const allRecords = await Promise.all(
    Object.entries(TYPE_TO_LOOKUP).map(async ([type, method]) => {
      try {
        const records = await dns[method](domain);
        return records.map((record: any) => ({
          value: TYPE_TO_MUNGING_FUNCTION[type]
            ? TYPE_TO_MUNGING_FUNCTION[type](record)
            : record,
          type,
        }));
      } catch (error) {
        return [];
      }
    })
  );
  return allRecords
    .flat()
    .sort((a, b) => `${a.type}${a.value}`.localeCompare(`${b.type}${b.value}`));
};

export default { lookup };
