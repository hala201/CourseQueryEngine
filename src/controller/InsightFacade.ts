import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import IDChecker from "./IDChecker";
import ZipLoader from "./ZipLoader";
import DataController from "./DataController";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

		// Check for valid id
		const idChecker = new IDChecker();
		const dataController = new DataController();

		const improperID: boolean = idChecker.checkValidID(id);
		if (improperID) {
			return Promise.reject(new InsightError("Invalid ID"));
		}

		const loadedIDs: string[] = dataController.getDatasets();
		const notUniqueID: boolean = idChecker.checkUniqueID(id, loadedIDs);
		if (notUniqueID) {
			return Promise.reject(new InsightError("Dataset with same ID exists"));
		}


		// Parse content
		const zipLoader = new ZipLoader();
		const data = await zipLoader.loadDataset(content);
		if (data.length === 0){
			return Promise.reject(new InsightError("Empty Dataset"));
		}
		// console.log(data);

		// Store dataset to disk
		try{
			await dataController.saveToDisk(data, id);
		} catch (err) {
			return Promise.reject(new InsightError("Error adding dataset"));
		}

		let addedDatasets = dataController.getDatasets();
		return Promise.resolve(addedDatasets);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
