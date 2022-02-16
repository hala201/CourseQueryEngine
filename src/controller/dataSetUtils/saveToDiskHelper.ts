async function retrieveValidCourses(files: any) {
	let validCourses: any[] = [];
	/**
	 * Todo: we need to make sure that each file is valid too so we need to filter valid files
	 */
	let validFiles: string[] = retrieveValidFiles(files);
	let promises: any[] = [];
	for (let file of validFiles) {
		promises.push(retrieveValidCourseData(file, validCourses));
	}

	await Promise.all(promises);
	return validCourses;
}
function findDataSetNumRows(data: string): number {
	return  data.split("/\r\n|\r|\n/").length;
}
function isCourseValid(fileData: any) {
	// Todo: implement this method
	return true;
}

function isFileValid(file: string) {
	// Todo: this method is not fully implemented, implement this method
	return !(file === "courses/" || file.includes("__MACOSX"));
}

function retrieveValidFiles(files: any): string[] {
	return files.filter((file: string) => {
		return isFileValid(file);
	});
}

async function retrieveValidCourseData(file: any, validCourses: any[]) {
	/**
	 * https://stackoverflow.com/questions/53481435/retrieving-data-from-a-zip-file-nodejs
	 * To read the contents of a file in the zip archive you can use the following.
	 */
	let fileData: string = await file.async("string");
	fileData = JSON.parse(fileData);
	if (isCourseValid(fileData)) {
		validCourses.push(fileData);
	}
}
