import {InsightError} from "../IInsightFacade";

export const QUERY_KEYS_VALUES = new Map<string, string>([
	["dept", "string"],
	["id", "string"],
	["avg", "number"],
	["instructor", "string"],
	["title", "string"],
	["pass", "number"],
	["fail", "number"],
	["audit", "number"],
	["uuid", "string"],
	["year", "number"],
]);
export const FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "NOT", "IS"];
export const SKEYS: string[] = ["dept", "id", "instructor", "title", "uuid"];
export const MKEYS: string[] = ["avg", "pass", "fail", "audit", "year"];
let dataSetsReferencedSoFar: Set<string>;

function validateFilterObject(filterObject: any): boolean {
	if (!FILTERS.includes(Object.keys(filterObject)[0])) {
		return false;
	}
	let newObject = Object.values(filterObject)[0];
	let objectOperator = Object.keys(filterObject)[0];
	if (objectOperator === "AND" || objectOperator === "OR") {
		return logicFilters(newObject);
	} else if (objectOperator === "LT" || objectOperator === "GT" || objectOperator === "EQ") {
		return mComparator(newObject);
	} else if (objectOperator === "NOT") {
		return negationFilter(newObject);
	} else if (objectOperator === "IS") {
		return isFilter(newObject);
	} else {
		return false;
	}
}

export function validateFilter(query: unknown) {
	dataSetsReferencedSoFar = new Set<string>();
	const queryObject: any = query;
	if (Object.keys(queryObject.WHERE).length > 1) {
		throw new InsightError();
	} else if (Object.keys(queryObject.WHERE).length === 0) {
		// This query has an empty WHERE
		return new Set<string>();
	}
	if (!validateFilterObject(Object.values(queryObject)[0])) {
		throw new InsightError();
	}
	return dataSetsReferencedSoFar;
}

function logicFilters(filterObject: any) {
	if (!(filterObject instanceof Array) || Object.values(filterObject).length === 0) {
		return false;
	}
	for (let f of filterObject) {
		if (!validateFilterObject(f)) {
			return false;
		}
	}
	return true;
}

function mComparator(filterObject: any) {
	let key = Object.keys(filterObject)[0];
	let value: any = Object.values(filterObject)[0];
	if (!MKEYS.includes(key.split("_")[1])) {
		return false;
	}

	if (filterObject instanceof Array || key.length === 0 || !(typeof value === "number")) {
		return false;
	}

	let dataset = key.split("_");
	if (typeof value !== QUERY_KEYS_VALUES.get(dataset[1])) {
		return false;
	}
	if (dataset[0].includes("_")) {
		return false;
	}

	let underScoreCounter = 0;
	for (let i of key) {
		if (i === "_") {
			underScoreCounter++;
		}
	}

	if (underScoreCounter > 1) {
		return false;
	}

	dataSetsReferencedSoFar.add(dataset[0]);
	return dataSetsReferencedSoFar.size < 2;
}

function negationFilter(filterObject: any) {
	if (Object.keys(filterObject).length !== 1) {
		return false;
	}
	return validateFilterObject(filterObject);
}

function isFilter(filterObject: any) {
	if (filterObject instanceof Array) {
		return false;
	}
	let key = Object.keys(filterObject)[0];
	let value: any = Object.values(filterObject)[0];

	if (key === undefined || value === undefined || !SKEYS.includes(key.split("_")[1])) {
		return false;
	}

	if (key.length === 0 || !(typeof value === "string") || value.length === 0) {
		return false;
	}

	for (let i = 1; i < value.length - 1; i++) {
		if (value[i] === "*") {
			return false;
		}
	}

	let underScoreCounter = 0;

	for (let i of key) {
		if (i === "_") {
			underScoreCounter++;
		}
	}

	if (underScoreCounter > 1) {
		return false;
	}

	dataSetsReferencedSoFar.add(key.split("_")[0]);
	return dataSetsReferencedSoFar.size < 2;
}
