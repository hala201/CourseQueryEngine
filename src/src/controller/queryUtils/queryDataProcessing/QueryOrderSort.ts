import {QUERY_KEYS_VALUES} from "../queryValidation/FilterValidaty";
import {compileFunction} from "vm";

let orderKey: string;

export function sortList(query: unknown, list: any[]) {
	let queryObject: any = query;
	if (!queryObject.OPTIONS.ORDER) {
		// Order does not have any keys
		return;
	}
	orderKey = queryObject.OPTIONS.ORDER;
	/**
	 * Todo: check if you want to sort a string or a number
	 */
	list.sort(compare);
	return list;
}

function compare(a: any, b: any) {
	let aValue: any;
	let bValue: any;

	for (const [key, value] of Object.entries(a)) {
		if (key === orderKey) {
			aValue = value;
			break;
		}
	}
	for (const [key, value] of Object.entries(b)) {
		if (key === orderKey) {
			bValue = value;
			break;
		}
	}

	if (aValue <= bValue) {
		return -1;
	}
	if (aValue > bValue) {
		return 1;
	}
	return 0;
}

