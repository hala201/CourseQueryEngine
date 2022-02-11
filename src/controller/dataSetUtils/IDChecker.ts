import DataController from "./DataController";

export default class IDChecker{

	public checkValidID(id: string){
		const underscore: boolean = IDChecker.checkUnderscore(id);
		const whitespace: boolean = IDChecker.checkOnlyWhitespaces(id);
		return (underscore || whitespace);
	}

	private static checkUnderscore(id: string) {
		return id.indexOf("_") > -1;

	}

	private static checkOnlyWhitespaces(id: string){
		return !id.replace(/\s/g, "").length;

	}

	public checkUniqueID(id: string, loadedIDs: string[]) {
		return loadedIDs.includes(id);
	}
}
