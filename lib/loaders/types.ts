export type Record = {
  value: string;
  type: string;
};

export type RecordGroup = {
  label: string;
  data: Record[];
};

export type Loader = (domain: string) => Promise<RecordGroup>;
