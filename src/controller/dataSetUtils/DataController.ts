import fs = require("fs");
import {rejects} from "assert";
import JSZip from "jszip";

export default class DataController{

	public async saveToDisk(
		content: string,
		dataset: any[],
		id: string,
		// dataSets: Map<string, any>,
		// dataSetsIDs: string[]
	){
	//	let files = await JSZip.loadAsync(content, {base64:true});

		try{
			if (!fs.existsSync("./data")) {
				fs.mkdirSync("./data");
			}
			let datasetString = JSON.stringify(dataset);
			fs.writeFileSync("./data/" +  id + ".json", datasetString);
			// fs.writeFileSync(`data/${id}.json`, JSON.stringify(insightDataSet));
			// dataSetsIDs.push(id);
			// dataSets.set(id, dataset);
		} catch (err){
			return err;
		}

	}

	public getDatasets(): string[]{
		if (!fs.existsSync("./data")) {
			return [];
		}
		let files = fs.readdirSync("./data/");
		files = files.map(function (item){
			return item.replace(/\.[^/.]+$/, "");
		});
		return files;
	}
}
