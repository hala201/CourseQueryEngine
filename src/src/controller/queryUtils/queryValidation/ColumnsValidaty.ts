import {InsightError} from "../../IInsightFacade";
import {resolveSrv} from "dns";

export const QUERY_KEYS: string[] = [
	"dept",
	"id",
	"avg",
	"instructor",
	"title",
	"pass",
	"fail",
	"audit",
	"uuid",
	"year",
];


function isValidQueryKeys(columnValues: string[],
	dataSetsReferenceSoFar: Set<string>, keysSetReferenceSoFar: Set<string>): boolean {
	for (let columnValue of columnValues) {
		let keys = columnValue.split("_");
		if (keys.length > 2) {
			return false;
		}
		if (!QUERY_KEYS.includes(keys[1])) {
			console.log("returning false where you expected it");
			return false;
		}
		dataSetsReferenceSoFar.add(keys[0]);
		keysSetReferenceSoFar.add(keys[1]);
	}

	return dataSetsReferenceSoFar.size === 1;
}

/**
 * If the columns are successfully validated return a set of datasets to confirm with filter that there haven't been
 * any referenced datasets in the filters not in the columns
 * @param query
 */
export function validateColumns(query: unknown) {
	let dataSetsReferenceSoFar = new Set<string>();
	let keysSetReferenceSoFar = new Set<string>();
	const queryObject: any = query;
	let columnValues: any = Object.values(queryObject.OPTIONS.COLUMNS);
	if (columnValues.length === 0) {
		throw new InsightError();
	}

	if (!isValidQueryKeys(columnValues, dataSetsReferenceSoFar, keysSetReferenceSoFar)) {
		throw new InsightError();
	}

	return {dataSetsReferenceSoFar, keysSetReferenceSoFar};
}
