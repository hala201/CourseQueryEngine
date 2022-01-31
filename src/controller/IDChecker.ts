export default class IDChecker{

	public checkID(id: string){
		const underscore: boolean = this.checkUnderscore(id);
		const whitespace: boolean = this.checkOnlyWhitespaces(id);
		return (underscore || whitespace);
	}

	private checkUnderscore(id: string) {
		return id.indexOf("_") > -1;

	}

	private checkOnlyWhitespaces(id: string){
		return !id.replace(/\s/g, "").length;

	}
}
