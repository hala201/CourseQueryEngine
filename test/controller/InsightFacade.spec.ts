import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect} from "chai";

describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDir = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		courses: "./test/resources/archives/courses.zip",
		emptyCourses: "./test/resources/archives/empty.zip",
		mathCourses: "./test/resources/archives/coursesmath.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run
		fs.removeSync(persistDir);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			insightFacade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent from the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDir);
		});

		it("Should add a valid dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get(id) ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		it("Should add two valid datasets", function () {
			const id1: string = "courses";
			const id2: string = "coursesmath";
			const content1: string = datasetContents.get(id1) ?? "";
			const content2: string = datasetContents.get(id2) ?? "";
			const expected: string[] = [id1, id2];
			return insightFacade.addDataset(id1, content1, InsightDatasetKind.Courses).then(() => {
				return insightFacade.addDataset(id2, content2, InsightDatasetKind.Courses);
			}).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		it("Should reject adding the same ID", async function () {
			const id: string = "courses";
			const content: string = datasetContents.get(id) ?? "";
			try {
				await insightFacade.addDataset(id, content, InsightDatasetKind.Courses);
				await insightFacade.addDataset(id, content, InsightDatasetKind.Courses);
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
				// Check to make sure that there is still one instance of courses in the dataset
				return insightFacade.listDatasets().then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(1);
				});
			}
		});

		it ("Should reject adding an id with only whitespace", async function() {
			const id: string = "   ";
			const content: string = datasetContents.get("courses") ?? "";
			try{
				await insightFacade.addDataset(id, content, InsightDatasetKind.Courses);
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it ("Should reject adding an id with an underscore", async function() {
			const id: string = "courses_underscore";
			const content: string = datasetContents.get("courses") ?? "";
			try{
				await insightFacade.addDataset(id, content, InsightDatasetKind.Courses);
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

		it ("Should reject adding an empty dataset", async function() {
			const id: string = "emptyCourses";
			const content: string = datasetContents.get(id) ?? "";
			try{
				await insightFacade.addDataset(id, content, InsightDatasetKind.Courses);
				expect.fail("Should have rejected!");
			} catch (err) {
				expect(err).to.be.instanceof(InsightError);
			}
		});

	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			insightFacade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDir);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries",
			{
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError(actual, expected) {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);
	});
});
