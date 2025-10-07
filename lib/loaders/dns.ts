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

const DOH_TYPE_MAP: Record<string, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  MX: 15,
  TXT: 16,
  AAAA: 28,
};

type DoHAnswer = {
  data: string;
};

type DoHResponse = {
  Answer?: DoHAnswer[];
};

const FALLBACK_ERROR_CODES = new Set(["ENOTIMP", "ENOSYS"]);

const stripTrailingDot = (value: string) =>
  value.endsWith(".") ? value.slice(0, -1) : value;

const convertDoHAnswer = (type: string, data: string) => {
  switch (type) {
    case "MX": {
      const [priority, ...rest] = data.split(" ");
      const exchange = stripTrailingDot(rest.join(" "));
      return { exchange, priority: Number(priority) };
    }
    case "TXT": {
      return data.replace(/^"|"$/g, "");
    }
    default:
      return stripTrailingDot(data);
  }
};

const normalizeRecordValue = (type: string, record: any): string => {
  if (type === "MX") {
    const { exchange, priority } = record as {
      exchange: string;
      priority: number;
    };
    return `${exchange} (priority: ${priority})`;
  }

  if (type === "TXT") {
    if (Array.isArray(record)) {
      return record.join("");
    }
    return record;
  }

  const value = typeof record === "string" ? record : String(record);
  return stripTrailingDot(value);
};

const fetchFromDoH = async (domain: string, type: string) => {
  const dohType = DOH_TYPE_MAP[type];
  if (!dohType) {
    return [];
  }

  try {
    const response = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${dohType}`,
    );
    if (!response.ok) {
      return [];
    }
    const data: DoHResponse = await response.json();
    const answers = data.Answer ?? [];
    return answers.map((answer) => convertDoHAnswer(type, answer.data));
  } catch (error) {
    return [];
  }
};

const lookupRecords = async (
  domain: string,
  type: string,
  method: (domain: string) => Promise<any>,
) => {
  try {
    return await method(domain);
  } catch (error: any) {
    if (error && FALLBACK_ERROR_CODES.has(error.code)) {
      return fetchFromDoH(domain, type);
    }
    return [];
  }
};

const load: Loader = async (domain: string) => {
  const allRecords = await Promise.all(
    Object.entries(TYPE_TO_LOOKUP).map(async ([type, method]) => {
      const records = await lookupRecords(domain, type, method);
      return records.map((record: any) => ({
        value: normalizeRecordValue(type, record),
        type,
      }));
    }),
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
