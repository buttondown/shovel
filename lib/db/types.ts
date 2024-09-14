import type {
	ColumnType,
	Insertable,
	JSONColumnType,
	Selectable,
} from "kysely";

export interface Database {
	domains: DomainTable;
	detected_technologies: DetectedTechnologyTable;
	affiliations: AffiliationTable;
}

export interface AffiliationTable {
	domain: string;
	identifier: string;
	metadata: JSONColumnType<any>;
	creation_date: ColumnType<Date, string | undefined, never>;
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

export type Affiliation = Selectable<AffiliationTable>;
export type NewAffiliation = Insertable<AffiliationTable>;
