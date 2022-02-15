const KEYS: Map<string, string> = new Map<string, string>([
	["Audit", "audit"],
	["Avg", "avg"],
	["Course", "id"],
	["Fail", "fail"],
	["id", "uuid"],
	["Pass", "pass"],
	["Professor", "instructor"],
	["Subject", "dept"],
	["Title", "title"],
	["Year", "year"],
]);

function getListOfSections(sections: any[]): any[] {
	let listOfSections: any[] = [];
	sections.forEach((result) => {
		Object.keys(result).forEach((section: any) => {
			listOfSections.push(section);
		});
	});
	return listOfSections;
}

export function processListOfSections(sections: any[], id: string): any[] {
	let listOfSection = getListOfSections(sections);
	let processedSections: any[] = [];
	listOfSection.forEach((section) => {
		let newSection: any = {};
		Object.keys(section).forEach((key) => {
			if (KEYS.has(key)) {
				processKeys(section, newSection, key, id);
			}
		});
		processedSections.push(newSection);
	});
	return processedSections;
}

function processKeys(oldSection: any, newSection: any, key: string, id: string) {
	/**
	 * TODO: This is wrong
	 */
	if (key === "id") {
		newSection[id + "_" + KEYS.get(key)] = oldSection[key].toString();
	} else if (key === "Section") {
		newSection[id + "_" + KEYS.get("Year")] =
			oldSection[key] === "overall" ? 1900 : oldSection["year"];
	} else if (key === "year") {
		console.log("No Implemented");
	} else {
		newSection[id + "_" + KEYS.get(key)] = oldSection[key];
	}
}
