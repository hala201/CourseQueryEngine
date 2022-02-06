import {getJsonObject, getJsonObjectResult} from "./queryTestUtils";
import {validateQuery} from "../../src/controller/queryUtils/queryValidation/QueryValidity";
import {expect} from "chai";
import {InsightError} from "../../src/controller/IInsightFacade";
import * as fs from "fs";

const testFolder = "test/resources/queries";
describe("Validate All Queries Test Suite", function () {
	it("Validate All Queries", function () {
		fs.readdirSync(testFolder).forEach((file) => {
			console.log(file);
			let query = getJsonObject(file);
			let result = getJsonObjectResult(file);
			if (result) {
				try {
					validateQuery(query, ["courses"]);
					expect.fail("This query is invalid and should not pass");
				} catch (e) {
					expect(e).to.be.instanceOf(InsightError);
				}
			} else {
				try {
					let queryResult = validateQuery(query, ["courses"]);
					expect(queryResult).to.be.true;
				} catch (e) {
					expect.fail("This query is valid and should pass");
				}
			}
		});
	});
});
