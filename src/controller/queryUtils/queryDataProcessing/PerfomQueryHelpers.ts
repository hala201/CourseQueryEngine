import {InsightError, InsightResult, ResultTooLargeError} from "../../IInsightFacade";
import {columnsReferencedInQuery, dataSetsReferencedInQuery, validateQuery} from "../queryValidation/QueryValidity";
import {processListOfSections} from "./SectionsProcessing";
import {filterList} from "./QueryFilterProcessing";
import {processListColumns} from "./QueryColumnsProcessing";
import {sortList} from "./QueryOrderSort";

export function performQueryHelper(
	query: unknown,
	dataSetIDs: string[],
	dataSets: Map<string, any>
): InsightResult[] {
	validateQuery(query, dataSetIDs);
	let queryObject: any = query;
	let id = dataSetsReferencedInQuery(query);
	let insightResult = dataSets.get(id);
	if (Object.values(queryObject.WHERE).length === 0) {
		return insightResult.data;
	}
	let processedSectionsList = processListOfSections(insightResult.data, id);
//	let columnsToProcess = columnsReferencedInQuery(query);
	/**
	 * Todo: This method will then sort the result according to the order if it exists
	 */

	let filteredSections: any[] = [];
	processedSectionsList.forEach((list: any) => {
		if (filterList(queryObject.WHERE, list)) {
			filteredSections.push(list);
		}
	});
	filteredSections = processListColumns(filteredSections, query);
	sortList(query, filteredSections);
	return filteredSections;
}
