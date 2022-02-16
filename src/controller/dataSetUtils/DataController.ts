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

	public checkLocalDiskParity(localDatasets: string[]): string[]{
		let diskDatasets = this.getDatasets();

		let onDiskNotLocalIDs: any[] = [];

		// Convert to set for easier parsing
		let localSetDatasets = new Set(localDatasets);

		// add id that is on disk but not on local to array
		for (let dataset of diskDatasets){
			if (!localSetDatasets.has(dataset)) {
				onDiskNotLocalIDs.push(dataset);
			}
		}

		return onDiskNotLocalIDs;
	}

	public parseDiskJSONData(id: string): object{
		let JSONData: object = {};
		try{
			JSONData = fs.readFileSync("./data/" +  id + ".json");
		} catch (err){
			console.log("Error with reading dataset on disk. Error: \n" + err);
			return JSONData;
		}
		return JSONData;
	}

	public removeFromDisk(id: string) {
		try{
			fs.unlinkSync("./data/" +  id + ".json");
		} catch (err){
			throw new Error();
		}
	}

}
