import JSZip, {JSZipObject} from "jszip";

export default class ZipLoader{

	public async loadDataset(content: string): Promise<any[]>{

		let dataset: any[];
		dataset = [];

		// Calls to JSZip API
		const zipContent = new JSZip();
		return new Promise((resolve) => {
			zipContent.loadAsync(content, {base64: true})
				.then(async (zip) => {
					// Loads the courses folder
					let zipFolder = zip.folder("courses");
					// Check if courses exist. If it does, load json files.
					// Otherwise, return empty dataset.
					if (zipFolder != null) {
						// Store data as promises for async loading
						const promises: any[] = [];
						zipFolder.forEach(function (relativePath, file) {
							promises.push(zip.file(file.name)?.async("text"));
						});
						// Resolve promises and then parse jsons
						Promise.all(promises).then(function (data) {
							return data;
						}).then(async (data) => {
							dataset = await Promise.all(await ZipLoader.loadJson(data));
						}).then((result) => {
							return resolve(dataset || []);
						});
					}
				});
		});
	}

	private static async loadJson(data: any[]): Promise<any[]>{
		let itemArray: any[];
		itemArray = [];

		for (const dataItem of data) {
			let dataResults = JSON.parse(dataItem).result;
			for (let result of dataResults){
				// Based on c1 spec req
				if (result.Section === "overall"){
					result.year = "1900";
				}
				// Set each item based on the json file
				let item = {
					dept: result.Subject,
					id: result.Course,
					avg: result.Avg,
					instructor: result.Professor,
					title: result.Title,
					pass: result.Pass,
					fail: result.Fail,
					audit: result.Audit,
					uuid: result.id,
					year: result.year
				};
				itemArray.push(item);
			}

		}
		return itemArray;
	}
}
