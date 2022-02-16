import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import IDChecker from "./dataSetUtils/IDChecker";
import ZipLoader from "./dataSetUtils/ZipLoader";
import DataController from "./dataSetUtils/DataController";
import {performQueryHelper} from "./queryUtils/queryDataProcessing/PerfomQueryHelpers";
import {deleteDataSetHelper} from "./dataSetUtils/removeDataSetHelper";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private dataSets: Map<string, any>;
	private dataSetsIDs: string[];
	private dirPath: string = __dirname + "/data/";

	constructor() {
		/**
		 * you might want to check if the data folder contains dataSets then you should load them otherwise dataSet
		 * contains no datasets
		 *
		 * This dataset contains the id for a dataset and the content
		 */
		this.dataSets = new Map<string, any>();
		/**
		 * REQUIREMENT: The promise should fulfill with a string array,
		 * containing the ids of all currently added datasets upon a successful add.
		 * I added this filed, so we can fulfill a promise with this array
		 */
		this.dataSetsIDs = [];

	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

		const idChecker = new IDChecker();
		const dataController = new DataController();

		// Check for valid id
		const improperID: boolean = idChecker.checkValidID(id);
		if (improperID) {
			return Promise.reject(new InsightError("Invalid ID"));
		}

		const loadedIDs: string[] = dataController.getDatasets();

		// Validate disk and local parity
		let onDiskNotLocalIDs: string[] = dataController.checkLocalDiskParity(this.dataSetsIDs);
		for (let item in onDiskNotLocalIDs) {
			let JSONData: object = dataController.parseDiskJSONData(item);
			this.saveToLocal(id,JSONData);
		}

		const notUniqueID: boolean = idChecker.checkUniqueID(id, loadedIDs);
		if (notUniqueID) {
			return Promise.reject(new InsightError("Dataset with same ID exists"));
		}

		// Parse content
		const zipLoader = new ZipLoader();
		let data = [];
		try {
			data = await zipLoader.loadDataset(content);
		} catch {
			return Promise.reject(new InsightError("Improper Dataset"));
		}

		if (data.length === 0) {
			return Promise.reject(new InsightError("Empty Dataset"));
		}

		// Store dataset to disk
		try {
			await dataController.saveToDisk(content, data, id);
		} catch (err) {
			return Promise.reject(new InsightError("Error adding dataset"));
		}

		// Store dataset to local
		let addedDatasets = dataController.getDatasets();
		this.saveToLocal(id,data);
		return Promise.resolve(addedDatasets);
	}

	public removeDataset(id: string): Promise<string> {
		// Check for valid id
		const idChecker = new IDChecker();
		const dataController = new DataController();

		const improperID: boolean = idChecker.checkValidID(id);
		if (improperID) {
			return Promise.reject(new InsightError("Invalid ID"));
		}

		const loadedIDs: string[] = dataController.getDatasets();
		const uniqueID: boolean = !idChecker.checkUniqueID(id, loadedIDs);
		if (uniqueID) {
			return Promise.reject(new NotFoundError("Dataset with ID is not found"));
		}

		// Remove dataset from disk
		try {
			dataController.removeFromDisk(id);
		} catch (err){
			return Promise.reject("Error removing dataset from disk");
		}

		// Remove dataset from local
		this.removeFromLocal(id);

		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let result: InsightResult[] = [];
		try {
			result = performQueryHelper(query, this.dataSetsIDs, this.dataSets);
			if (result.length > 5000) {
				return Promise.reject(new ResultTooLargeError());
			}
		} catch (e) {
			return Promise.reject(e);
		}
		return Promise.resolve(result);
	}

	public listDatasets(): Promise<InsightDataset[]> {
	//	return Promise.reject("Not implemented.");
		let values = Array.from(this.dataSets.values());
		return new Promise<InsightDataset[]>(function (resolve, reject) {
			resolve(values);
		});
	}

	private saveToLocal(id: string, data: any) {
		this.dataSetsIDs.push(id);
		let insightDataSet = {
			id,
			data
		};
		this.dataSets.set(id, insightDataSet);
	}

	private removeFromLocal(id: string){
		this.dataSetsIDs = this.dataSetsIDs.filter((string) => string !== id);
		this.dataSets.delete(id);
	}

}
