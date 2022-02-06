import {InsightError} from "../IInsightFacade";
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

let dataSetsReferenceSoFar: Set<string>;
let keysSetReferenceSoFar: Set<string>;

function isValidQueryKeys(columnValues: string[]): boolean {
	for (let columnValue of columnValues) {
		let keys = columnValue.split("_");
		if (keys.length > 2) {
			return false;
		}
		if (!QUERY_KEYS.includes(keys[1]) || processDatasetID(keys[0])) {
			return false;
		}
		dataSetsReferenceSoFar.add(keys[0]);
		keysSetReferenceSoFar.add(keys[1]);
	}

	return dataSetsReferenceSoFar.size === 1;
}

function processDatasetID(dataSetID: string): boolean {
	let underScoreCounter = 0;

	for (let i of dataSetID) {
		if (i === "_") {
			underScoreCounter++;
		}
	}

	if (underScoreCounter > 1) {
		return false;
	}

	return dataSetID.length < 0 || dataSetID.includes("_");
}

/**
 * If the columns are successfully validated return a set of datasets to confirm with filter that there havent been
 * any refernced datasets in the filters not in the columns
 * @param query
 */
export function validateColumns(query: unknown) {
	dataSetsReferenceSoFar = new Set<string>();
	keysSetReferenceSoFar = new Set<string>();
	const queryObject: any = query;
	let columnValues: any = Object.values(queryObject.OPTIONS.COLUMNS);
	if (columnValues.length === 0) {
		throw new InsightError();
	}

	if (!isValidQueryKeys(columnValues)) {
		/**
		 * Todo: check if the dataset added
		 */
		throw new InsightError();
	}

	return {dataSetsReferenceSoFar, keysSetReferenceSoFar};
}
