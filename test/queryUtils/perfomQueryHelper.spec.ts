
import * as fs from "fs";
import {IInsightFacade, InsightDatasetKind, ResultTooLargeError} from "../../src/controller/IInsightFacade";
import {expect} from "chai";
import {getJsonObject, getJsonObjectWithFullPath, getJsonObjectWithFullPathExpected} from "./queryTestUtils";
import {validateQuery} from "../../src/controller/queryUtils/queryValidation/QueryValidity";
import {performQueryHelper} from "../../src/controller/queryUtils/queryDataProcessing/PerfomQueryHelpers";
import exp from "constants";
import InsightFacade from "../../src/controller/InsightFacade";
import {inspect} from "util";

describe("test suite for perfomQuery helper methods", function () {
	let facade: IInsightFacade;
	// const content =
	// 	fs.readFileSync("./test/resources/archives/courses_demo.zip").toString("base64");
	const contentTwo =
		fs.readFileSync("./test/resources/archives/courses.zip").toString("base64");

	before(async function () {
		facade = new InsightFacade();
		try {
			await facade.addDataset("courses", contentTwo, InsightDatasetKind.Courses);
		} catch (e) {
			// DO NOTHING
		}
	});

	it("perform query", async function () {
		let query =
			getJsonObjectWithFullPath("test/resources/queryHelperQueries/sectionSetToOverallQuery.json");
		let expected =
			getJsonObjectWithFullPathExpected("test/resources/queryHelperQueries/sectionSetToOverallQuery.json");
		let list = await facade.performQuery(query);
		expect(list).to.be.deep.equal(expected);
	});
});
