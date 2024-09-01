import { ColumnType, Insertable, JSONColumnType, Selectable } from "kysely";

export interface Database {
    domains: DomainTable;
    detected_technologies: DetectedTechnologyTable;
}

export interface DomainTable {
    domain: string;
    data: JSONColumnType<any>;
    creation_date: ColumnType<Date, string | undefined, never>;
}

export interface DetectedTechnologyTable {
    domain: string;
    technology: string;
    data: JSONColumnType<any>;
    creation_date: ColumnType<Date, string | undefined, never>;
}

export type Domain = Selectable<DomainTable>;
export type NewDomain = Insertable<DomainTable>;

export type DetectedTechnology = Selectable<DetectedTechnologyTable>;
export type NewDetectedTechnology = Insertable<DetectedTechnologyTable>;