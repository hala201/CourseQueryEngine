const KEYS: Map<string, string> = new Map<string, string>([
	["dept", "dept"],
	["id", "id"],
	["avg", "avg"],
	["instructor", "instructor"],
	["title", "title"],
	["pass", "pass"],
	["fail", "fail"],
	["audit", "audit"],
	["uuid", "uuid"],
	["year", "year"]
	// ["Audit", "audit"],
	// ["Avg", "avg"],
	// ["Course", "id"],
	// ["Fail", "fail"],
	// ["id", "uuid"],
	// ["Pass", "pass"],
	// ["Professor", "instructor"],
	// ["Subject", "dept"],
	// ["Title", "title"],
	// ["Year", "year"],
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
	let listOfSections = getListOfSections(sections);
	let processedSections: any[] = [];
	sections.forEach((section) => {
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
	} else if (key === "uuid") {
		newSection[id + "_" + KEYS.get("uuid")] =
			oldSection[key] === "overall" ? 1900 : oldSection["uuid"].toString();
	} else if (key === "year") {
		newSection[id + "_" + KEYS.get("year")] =
			oldSection[key] === "overall" ? 1900 : oldSection["year"];
	} else {
		newSection[id + "_" + KEYS.get(key)] = oldSection[key];
	}
}
