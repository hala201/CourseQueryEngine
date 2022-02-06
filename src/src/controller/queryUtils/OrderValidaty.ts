import {QUERY_KEYS_VALUES} from "./FilterValidaty";
import {InsightError} from "../IInsightFacade";

/**
 * Throws an exception if the order section is invalid, otherwise returns true
 * @param query
 */
export function validateOrder(query: unknown) {
	const queryObject: any = query;
	if (queryObject.OPTIONS.ORDER === undefined) {
		// This query does not have an order
		return {};
	}
	if (queryObject.OPTIONS.ORDER instanceof Array) {
		throw new InsightError();
	}

	let underScoreCounter = 0;
	let key = queryObject.OPTIONS.ORDER;
	for (let i of key) {
		if (i === "_") {
			underScoreCounter++;
		}
	}

	if (underScoreCounter > 1) {
		throw new InsightError();
	}

	let dataset = key.split("_");
	if (dataset.length > 2) {
		throw new InsightError();
	}

	return {dataset: dataset[0], key: dataset[1]};
}
