export default class IDChecker{

	public checkID(id: string){
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
}
