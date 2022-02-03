import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import IDChecker from "./IDChecker";
import ZipLoader from "./ZipLoader";

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
		const improperID: boolean = idChecker.checkID(id);
		if (improperID) {
			return Promise.reject(new InsightError("Invalid ID"));
		}

		// Parse content
		const zipLoader = new ZipLoader();
		const data = await zipLoader.loadDataset(content);
		console.log(data);


		if (kind === InsightDatasetKind.Courses) {
			// do work
		} else if (kind === InsightDatasetKind.Rooms) {
			// do work
		} else {
			// Should not get here
			return Promise.reject(new InsightError("Invalid Kind"));
		}

		// Add dataset to
		return Promise.reject("Not fully implemented.");
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
