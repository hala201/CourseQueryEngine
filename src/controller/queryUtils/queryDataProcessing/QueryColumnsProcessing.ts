import {validateColumns} from "../queryValidation/ColumnsValidaty";
import {dataSetsReferencedInQuery} from "../queryValidation/QueryValidity";

export function processListColumns(listOfSections: any[], query: unknown) {
	let columnsObject = validateColumns(query);
	let dataSet = dataSetsReferencedInQuery(query);
	let columns: any[] = [];
	columnsObject.keysSetReferenceSoFar.forEach((key) => {
		key = dataSet + "_" + key;
		columns.push(key);
	});
	let listOfProcessedColumnsSections: any[] = [];
	listOfSections.forEach((section) => {
		let newSection: any = {};
		columns.forEach((key) => {
			newSection[key] = section[key];
		});
		listOfProcessedColumnsSections.push(newSection);
	});
	return listOfProcessedColumnsSections;
}
