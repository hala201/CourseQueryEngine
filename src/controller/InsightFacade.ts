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


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private dataSets: Map<string, any>;
	private dataSetsIDs: string[];
	// private dirPath: string = __dirname + "/data/";
	private idChecker;
	private dataController;

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

		this.idChecker = new IDChecker();
		this.dataController = new DataController();

		// Validate disk and local parity
		this.validateParity();

	}

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {

		// Check for valid id
		const improperID: boolean = this.idChecker.checkValidID(id);
		if (improperID) {
			return Promise.reject(new InsightError("Invalid ID"));
		}

		const loadedIDs: string[] = this.dataController.getDatasets();

		const notUniqueID: boolean = this.idChecker.checkUniqueID(id, loadedIDs);
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
			await this.dataController.saveToDisk(content, data, id);
		} catch (err) {
			return Promise.reject(new InsightError("Error adding dataset"));
		}

		// Store dataset to local
		let addedDatasets = this.dataController.getDatasets();
		this.saveToLocal(id,data);
		return Promise.resolve(addedDatasets);
	}

	public removeDataset(id: string): Promise<string> {
		// Check for valid id

		const improperID: boolean = this.idChecker.checkValidID(id);
		if (improperID) {
			return Promise.reject(new InsightError("Invalid ID"));
		}

		const loadedIDs: string[] = this.dataController.getDatasets();
		const uniqueID: boolean = !this.idChecker.checkUniqueID(id, loadedIDs);
		if (uniqueID) {
			return Promise.reject(new NotFoundError("Dataset with ID is not found"));
		}

		// Remove dataset from disk
		try {
			this.dataController.removeFromDisk(id);
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
		let returnArray: any[] = [];
		for (let dataID of this.dataSetsIDs) {
			let numRows = this.dataSets.get(dataID).data.length;
			let dataObject = {
				id: dataID,
				kind: InsightDatasetKind.Courses,
				numRows: numRows,
			};
			returnArray.push(dataObject);
		}
		return Promise.resolve(returnArray);
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

	private validateParity(){
		let onDiskNotLocalIDs: string[] = this.dataController.checkLocalDiskParity(this.dataSetsIDs);
		for (let item in onDiskNotLocalIDs) {
			let JSONData: object = this.dataController.parseDiskJSONData(item);
			this.saveToLocal(item,JSONData);
		}
	}

}
