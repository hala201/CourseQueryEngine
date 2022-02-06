import fs = require("fs");
import {rejects} from "assert";

export default class DataController{

	public saveToDisk(dataset: any[], id: string){
		try{
			if (!fs.existsSync("./data")) {
				fs.mkdirSync("./data");
			}
			let datasetString = JSON.stringify(dataset);
			fs.writeFileSync("./data/" +  id + ".json", datasetString);
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
