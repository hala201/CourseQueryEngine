export default class IDChecker{

	public checkID(id: string){
		const underscore: boolean = this.checkUnderscore(id);
		const whitespace: boolean = this.checkOnlyWhitespaces(id);
		return (underscore || whitespace);
	}

	private checkUnderscore(id: string) {
		if (id.indexOf("_") > -1) {
			return true;
		}
		return false;
	}

	private checkOnlyWhitespaces(id: string){
		if (!id.replace(/\s/g, "").length) {
			return true;
		}
		return false;
	}
}
