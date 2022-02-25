import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
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
		emptyContent: "./test/resources/archives/emptyZip.zip",
		invalidContent: "./test/resources/archives/invalidJson.zip",
		validContent: "./test/resources/archives/validCourses.zip",
		invalidCourseSectionContent: "./test/resources/archives/invalidJsonSections.zip",
		multipleDataset: "./test/resources/archives/multipleDataSets.zip",
		invalidCourseDirectory: "./test/resources/archives/InvalidCoursesDirectory.zip",
		nonZip: "./test/resources/archives/nonZip.txt",

		rooms: "./test/resources/archives/rooms.zip",
		roomsNoIndex: "./test/resources/archives/roomsNoIndex.zip",
		roomsNoRooms: "./test/resources/archives/roomsNoRooms.zip",
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

		// This is a unit test. You should create more like this!
		it("Should add a valid course dataset", function () {
			const id: string = "courses";
			const content: string = datasetContents.get("courses") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Courses).then((result: string[]) => {
				expect(result).to.deep.equal(expected);
			});
		});

		it("test add an invalid course dataset directory", async function () {
			try {
				let ids = await insightFacade.addDataset(
					"courses",
					datasetContents.get("invalidCourseDirectory") ?? "",
					InsightDatasetKind.Courses
				);
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add two valid course datasets", async function () {
			try {
				await insightFacade.addDataset(
					"courses",
					datasetContents.get("courses") ?? "",
					InsightDatasetKind.Courses
				);
				let ids = await insightFacade.addDataset(
					"invalidCourses",
					datasetContents.get("validContent") ?? "",
					InsightDatasetKind.Courses
				);
				expect(ids.length).to.equal(2);
				expect(ids).to.deep.equal(["courses", "invalidCourses"]);
			} catch (e) {
				expect.fail("Should not throw an exception");
			}
		});

		it("test add empty course dataset", async function () {
			try {
				const ids = await insightFacade.addDataset(
					"emptyCourses",
					datasetContents.get("emptyContent") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added an empty dataSet, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add multiple course datasets in the same zip file", async function () {
			try {
				const ids = await insightFacade.addDataset(
					"courses",
					datasetContents.get("multipleDataset") ?? "",
					InsightDatasetKind.Courses
				);
				expect(ids).to.deep.equal(["courses"]);
			} catch (e) {
				expect.fail("Should not throw an exception");
			}
		});

		it("test add course dataset with whitespace id", async function () {
			let ids;
			try {
				ids = await insightFacade.addDataset(
					" ",
					datasetContents.get("emptyContent") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a course dataset with whitespace id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with whitespace in the id string", async function () {
			let ids;
			try {
				ids = await insightFacade.addDataset(
					" courses fun ",
					datasetContents.get("emptyContent") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a course dataset with whitespace id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with whitespace id and content", async function () {
			try {
				const ids = await insightFacade.addDataset(" ", " ", InsightDatasetKind.Courses);
				expect.fail("Added a course dataset with white space id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with empty id", async function () {
			try {
				const ids = await insightFacade.addDataset(
					"",
					datasetContents.get("emptyContent") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a course dataset with white space id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with underscore id", async function () {
			try {
				const ids = await insightFacade.addDataset(
					"__courses",
					datasetContents.get("emptyContent") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a course dataset with underscore id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with astresik", async function () {
			let ids;
			try {
				ids = await insightFacade.addDataset(
					"*courses",
					datasetContents.get("emptyContent") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a course dataset with asterisk id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with whitespace content", async function () {
			try {
				const ids = await insightFacade.addDataset("emptyCourses", " ", InsightDatasetKind.Courses);
				expect.fail("Added empty string for course dataset content, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with empty content", async function () {
			try {
				const ids = await insightFacade.addDataset("emptyCourses", "", InsightDatasetKind.Courses);
				expect.fail("Added empty string for course dataset content, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with whitespace in the id", async function () {
			try {
				const ids = await insightFacade.addDataset(
					"Courses_content",
					datasetContents.get("courses") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a string with id in the middle for course dataset id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add course dataset with invalid json", async function () {
			let ids;
			try {
				ids = await insightFacade.addDataset(
					"invalidCourses",
					datasetContents.get("invalidContent") ?? "",
					InsightDatasetKind.Courses
				);
			} catch (e) {
				expect.fail("Added a course dataset with invalid json objects should skip over them");
			} finally {
				expect(ids).to.deep.equal(["invalidCourses"]);
			}
		});

		it("test add course dataset with already existing id", async function () {
			try {
				let ids;
				ids = await insightFacade.addDataset(
					"courses",
					datasetContents.get("courses") ?? "",
					InsightDatasetKind.Courses
				);
				expect(ids).to.deep.equal(["courses"]);
			} catch (e) {
				expect.fail("Should not throw an error");
			}

			try {
				await insightFacade.addDataset(
					"courses",
					datasetContents.get("courses") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a dataset with existing id, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add non zip file", async function () {
			try {
				await insightFacade.addDataset(
					"courses",
					datasetContents.get("nonZip") ?? "",
					InsightDatasetKind.Courses
				);
				expect.fail("Added a dataset that is not zip file, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add a valid room dataset", async function () {
			// TODO
			try {
				await insightFacade.addDataset(
					"courses",
					datasetContents.get("courses") ?? "",
					InsightDatasetKind.Rooms
				);
				expect.fail("Added a dataset with rooms, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add two valid room datasets", async function () {
			// TODO
		});

		it("test add room dataset with whitespace id", async function () {
			// TODO
		});

		it("test add room dataset with whitespace in the id string", async function () {
			// TODO
		});

		it("test add room dataset with whitespace id and content", async function () {
			// TODO
		});

		it("test add room dataset with underscore id", async function () {
			// TODO
		});

		it("test add room dataset with empty content", async function () {
			// TODO
			try {
				await insightFacade.addDataset("courses", " ", InsightDatasetKind.Rooms);
				expect.fail("Added a dataset with rooms, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("test add room dataset with empty id", async function () {
			try {
				await insightFacade.addDataset(" ", datasetContents.get("courses") ?? "", InsightDatasetKind.Rooms);
				expect.fail("Added a dataset with rooms, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});


		it("test add room dataset with already existing id", async function () {
			// TODO
		});

		it("test add course dataset with already existing room dataset with same id", async function () {
			// TODO
		});

		it("test add room dataset with already existing course dataset with same id", async function () {
			// TODO
		});

		it("test add room dataset with no index.htm", async function () {
			// TODO
		});

		it("test add room dataset with no rooms", async function () {
			// TODO
		});

		// TEST Remove Dataset

		it("remove a course dataset", async function () {
			const id = "courses";
			const ids = await insightFacade.addDataset(
				id,
				datasetContents.get("courses") ?? "",
				InsightDatasetKind.Courses
			);
			expect(ids).deep.equal([id]);
			try {
				await insightFacade.removeDataset(id);
				const insightDatasets = await insightFacade.listDatasets();
				expect(insightDatasets).to.deep.equal([]);
			} catch (e) {
				expect.fail("Should not throw an error");
			}
		});

		it ("should remove a room dataset", async function() {
			const id = "rooms";
			const ids = await insightFacade.addDataset(
				id,
				datasetContents.get("rooms") ?? "",
				InsightDatasetKind.Rooms
			);
			expect(ids).deep.equal([id]);
			try {
				await insightFacade.removeDataset(id);
				const insightDatasets = await insightFacade.listDatasets();
				expect(insightDatasets).to.deep.equal([]);
			} catch (e) {
				expect.fail("Should not throw an error");
			}
		});

		it("add two and remove two course datasets", async function () {
			try {
				await insightFacade.addDataset(
					"courses",
					datasetContents.get("courses") ?? "",
					InsightDatasetKind.Courses
				);
				let ids = await insightFacade.addDataset(
					"invalidCourses",
					datasetContents.get("courses") ?? "",
					InsightDatasetKind.Courses
				);
				expect(ids.length).to.equal(2);
				expect(ids).to.deep.equal(["courses", "invalidCourses"]);
				await insightFacade.removeDataset("courses");

				const insightDatasets = await insightFacade.listDatasets();
				expect(insightDatasets).to.deep.equal([
					{
						id: "invalidCourses",
						kind: InsightDatasetKind.Courses,
						numRows: 64612,
					},
				]);

				await insightFacade.removeDataset("invalidCourses");
				const insightTwoDatasets = await insightFacade.listDatasets();
				expect(insightTwoDatasets).to.deep.equal([]);
			} catch (e) {
				expect.fail("Should not throw an exception");
			}
		});

		it ("add two and remove two room datasets", async function() {
			try {
				await insightFacade.addDataset(
					"rooms",
					datasetContents.get("rooms") ?? "",
					InsightDatasetKind.Rooms
				);
				let ids = await insightFacade.addDataset(
					"rooms-2",
					datasetContents.get("rooms") ?? "",
					InsightDatasetKind.Rooms
				);
				expect(ids.length).to.equal(2);
				expect(ids).to.deep.equal(["rooms", "rooms-2"]);
				await insightFacade.removeDataset("rooms");

				const insightDatasets = await insightFacade.listDatasets();
				expect(insightDatasets).to.deep.equal([
					{
						id: "rooms-2",
						kind: InsightDatasetKind.Rooms,
						numRows: 1, // TODO figure out how many rows there are
					},
				]);

				await insightFacade.removeDataset("invalidCourses");
				const insightTwoDatasets = await insightFacade.listDatasets();
				expect(insightTwoDatasets).to.deep.equal([]);
			} catch (e) {
				expect.fail("Should not throw an exception");
			}
		});

		it("remove a dataset that does not exist", async function () {
			try {
				await insightFacade.removeDataset("nonexistentcourses");
				expect.fail("removed a dataset that does not exist, should reject");
			} catch (e) {
				expect(e).to.be.instanceOf(NotFoundError);
			}
		});

		it("remove a dataset with a whitespaces id", async function () {
			try {
				await insightFacade.removeDataset(" ");
				expect.fail("removed a dataset with a whitespace id");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("remove a dataset with an empty id", async function () {
			try {
				await insightFacade.removeDataset("");
				expect.fail("removed a dataset with a whitespace id");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		it("remove a dataset with an underscore id", async function () {
			try {
				await insightFacade.removeDataset("_courses_");
				expect.fail("removed a dataset with id that contains underscore");
			} catch (e) {
				expect(e).to.be.instanceOf(InsightError);
			}
		});

		// TEST List Dataset

		it("should list no datasets", async function () {
			const insightDatasets = await insightFacade.listDatasets();
			expect(insightDatasets).to.deep.equal([]);
		});

		it("should list one course dataset", async function () {
			await insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses);
			const insightDatasets = await insightFacade.listDatasets();

			expect(insightDatasets).to.deep.equal([
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);
		});

		it ("should list one room dataset", async function() {
			await insightFacade.addDataset("rooms", datasetContents.get("rooms") ?? "", InsightDatasetKind.Rooms);
			const insightDatasets = await insightFacade.listDatasets();

			expect(insightDatasets).to.deep.equal([
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 1, // TODO figure out how many rows there are
				},
			]);
		});

		it("should list multiple course datasets", async function () {
			await insightFacade.addDataset("courses", datasetContents.get("courses") ?? "", InsightDatasetKind.Courses);
			await insightFacade.addDataset(
				"courses-2",
				datasetContents.get("courses") ?? "",
				InsightDatasetKind.Courses
			);
			const insightDatasets = await insightFacade.listDatasets();
			expect(insightDatasets).to.deep.equal([
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
				{
					id: "courses-2",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);
		});

		it ("should list multiple room datasets", async function() {
			await insightFacade.addDataset("rooms", datasetContents.get("rooms") ?? "", InsightDatasetKind.Rooms);
			await insightFacade.addDataset(
				"rooms-2",
				datasetContents.get("rooms") ?? "",
				InsightDatasetKind.Rooms
			);
			const insightDatasets = await insightFacade.listDatasets();
			expect(insightDatasets).to.deep.equal([
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 1, // TODO figure out how many rows there are
				},
				{
					id: "rooms-2",
					kind: InsightDatasetKind.Rooms,
					numRows: 1, // TODO figure out how many rows there are
				},
			]);
		});

		it ("should list multiple datasets of mixed kind", async function() {
			await insightFacade.addDataset("rooms", datasetContents.get("rooms") ?? "", InsightDatasetKind.Rooms);
			await insightFacade.addDataset(
				"courses",
				datasetContents.get("courses") ?? "",
				InsightDatasetKind.Courses
			);
			const insightDatasets = await insightFacade.listDatasets();
			expect(insightDatasets).to.deep.equal([
				{
					id: "rooms",
					kind: InsightDatasetKind.Rooms,
					numRows: 1, // TODO figure out how many rows there are
				},
				{
					id: "courses",
					kind: InsightDatasetKind.Courses,
					numRows: 64612,
				},
			]);
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

			return Promise.all(loadDatasetPromises).catch((e) => {
				console.log("Error");
			});
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
