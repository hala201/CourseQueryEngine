import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
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
		let data = [];
		try {
			data = await zipLoader.loadDataset(content);
		} catch {
			return Promise.reject(new InsightError("Improper Dataset"));
		}

		if (data.length === 0) {
			return Promise.reject(new InsightError("Empty Dataset"));
		}
		// console.log(data);

		// Store dataset to disk
		try {
			await dataController.saveToDisk(content, data, id);
		} catch (err) {
			return Promise.reject(new InsightError("Error adding dataset"));
		}
		let addedDatasets = dataController.getDatasets();
		this.dataSetsIDs.push(id);
		let insightDataSet = {
			id,
			data
		};
		this.dataSets.set(id, insightDataSet);
		return Promise.resolve(addedDatasets);
	}

	public removeDataset(id: string): Promise<string> {
		// return new Promise((resolve, reject) => {
		// 	try {
		// 		let returnedNum = deleteDataSetHelper(id, this.dirPath, this.dataSets, this.dataSetsIDs);
		// 		if (returnedNum === 404) {
		// 			return Promise.reject();
		// 		} else {
		// 			resolve("remove succeeded");
		// 		}
		// 	} catch (e) {
		// 		return Promise.reject(e);
		// 	}
		// });
		return Promise.reject("Not implemented.");
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
}
