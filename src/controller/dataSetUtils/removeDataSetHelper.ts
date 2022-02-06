
import * as fs from "fs";

/**
 * https://stackoverflow.com/questions/2727167/how-do-you-get-a-
 * list-of-the-names-of-all-files-present-in-a-directory-in-node-j
 * **/

export function validateDataSetIDToRemove(id: string, dataSetsIDs: string[]): boolean {
	return dataSetsIDs.includes(id)
		&& !id === null;
}
export function deleteDataSetHelper(
	id: string,
	dirPath: string,
	dataSets: Map<string, any>,
	dataSetsIDs: string[]
) {
	let ret: number;
	let filePath = dirPath + id + ".json";
	if(validateDataSetIDToRemove(id, dataSetsIDs)) {
		dataSets.delete(id);
		ret = 204;
	}
	if(fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
		ret = 204;
	} else {
		ret  = 404;
	}
	return ret;
}
