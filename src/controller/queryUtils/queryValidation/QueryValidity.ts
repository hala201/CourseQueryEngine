import {validateFilter} from "./FilterValidaty";
import {validateColumns} from "./ColumnsValidaty";
import {validateOrder} from "./OrderValidaty";
import InsightFacade from "../../InsightFacade";
import {InsightError} from "../../IInsightFacade";

function checkSameCoursesReferenced(
	filterResult: Set<string>,
	orderResult: any,
	columnsResult: any,
	dataSetIDs: string[]
) {
	if (Object.keys(orderResult).length !== 0) {
		if (
			!columnsResult.keysSetReferenceSoFar.has(orderResult.key) ||
			!columnsResult.dataSetsReferenceSoFar.has(orderResult.dataset) ||
			(filterResult.size > 0 && !filterResult.has(orderResult.dataset))
		) {
			throw new InsightError();
		}
	}
	if (!eqSet(filterResult, columnsResult.dataSetsReferenceSoFar)) {
		throw new InsightError();
	}

	columnsResult.dataSetsReferenceSoFar.forEach((dataset: string) => {
		if (!dataSetIDs.includes(dataset)) {
			throw new InsightError();
		}
	});

	filterResult.forEach((dataset: string) => {
		if (!dataSetIDs.includes(dataset)) {
			throw new InsightError();
		}
	});
	return true;
}

function eqSet(as: Set<string>, bs: Set<string>) {
	for (let a of as) {
		if (!bs.has(a)) {
			return false;
		}
	}
	return true;
}

export function validateQuery(query: unknown, dataSetIDs: string[]): boolean {
	return (
		validateQueryType(query) &&
		isBodyAndOptionsExist(query) &&
		isWhereExist(query) &&
		isColumnsExist(query) &&
		validateWhere(query) &&
		validateOptions(query) &&
		checkSameCoursesReferenced(validateFilter(query), validateOrder(query), validateColumns(query), dataSetIDs)
	);
}

/**
 * REQUIRES: Valid Query
 * Returns: the first value in the set which corresponds to the id of the dataset
 * @param query
 */
export function dataSetsReferencedInQuery(query: unknown): string {

	return [...validateColumns(query).dataSetsReferenceSoFar].toString();
}

/**
 * REQUIRES: Valid Query
 * Returns: the referenced columns in the query concatenated to the id
 * @param query
 */
export function columnsReferencedInQuery(query: unknown): string[] {
	let id = dataSetsReferencedInQuery(query);
	let columns = [...validateColumns(query).keysSetReferenceSoFar];
	return columns.map((value) => {
		return value = id + "_" + value;
	});
	// return columns;
}

/**
 * Check that query has the proper type
 * @param query
 */
function validateQueryType(query: unknown): boolean {
	let queryObject: any = query;
	if ((query === undefined || query === null) && !(queryObject instanceof Object)) {
		throw new InsightError();
	}
	return true;
}

/**
 * Check that the body and options and only body and options of the query exist
 * @param query
 */
function isBodyAndOptionsExist(query: unknown): boolean {
	const queryObject: any = query;
	if (
		queryObject.OPTIONS === undefined ||
		queryObject.WHERE === undefined ||
		queryObject.OPTIONS === null ||
		queryObject.WHERE === null ||
		!(Object.keys(queryObject).length === 2)
	) {
		throw new InsightError();
	}
	return true;
}

/**
 * Check that the WHERE key exists
 * @param query
 */
function isWhereExist(query: unknown): boolean {
	const queryObject: any = query;
	if (queryObject.WHERE === undefined || queryObject.WHERE === null) {
		throw new InsightError();
	}
	return true;
}

function isColumnsExist(query: unknown): boolean {
	const queryObject: any = query;
	if (queryObject.OPTIONS.COLUMNS === undefined || queryObject.OPTIONS.COLUMNS === null) {
		throw new InsightError();
	}
	return true;
}

/**
 * This method assumes that we have a body for our query and our query is valid
 * Check that the body is valid
 * @param query
 */
function validateWhere(query: unknown) {
	const queryObject: any = query;
	if (Object.keys(queryObject.WHERE).length > 1 && !queryObject.WHERE.FILTER) {
		throw new InsightError();
	}
	return true;
}

function validateOptions(query: unknown) {
	const queryObject: any = query;
	if (Object.keys(queryObject.OPTIONS).length > 2 || Object.keys(queryObject.OPTIONS).length === 0) {
		throw new InsightError();
	}
	if (queryObject.OPTIONS.ORDER === null) {
		throw new InsightError();
	}
	if (queryObject.OPTIONS.COLUMNS === undefined || queryObject.OPTIONS.COLUMNS === null) {
		throw new InsightError();
	}
	return true;
}
