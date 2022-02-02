import JSZip, {JSZipObject} from "jszip";
import {InsightError} from "./IInsightFacade";

export default class ZipLoader{

	public loadDataset(content: string){

		let dataset;

		// Calls to JSZip API
		const zipContent = new JSZip();
		zipContent.loadAsync(content, {base64: true})
			.then(function(zip) {
				// Loads the courses folder
				let zipFolder = zip.folder("courses");
				// Check if courses exist. Returns null if it doesn't.
				// Otherwise, load the json files.
				if (zipFolder === null){
					dataset = [];
				} else{
					zipFolder.forEach(function (relativePath, file){
						dataset = ZipLoader.loadJson(relativePath, file);
					});
				}
			});
		return dataset;
	}

	private static loadJson(relativePath: string, file: JSZipObject){
		file.async("string").then((output)=>{
			let jsonOutput = JSON.parse(output);
			// let result = {Year: jsonOutput.Year};
			console.log(jsonOutput.result[0].Year);
		});
		return [];
	}
}
