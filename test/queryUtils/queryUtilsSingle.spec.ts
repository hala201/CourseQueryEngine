import {validateQuery} from "../../src/controller/queryUtils/queryValidation/QueryValidity";
import {expect} from "chai";
import {InsightError} from "../../src/controller/IInsightFacade";
import {getJsonObject} from "./queryTestUtils";
import exp from "constants";

describe("Test suite for query parsing", function () {
	it("validQueryWithoutOrder", function () {
		let query = getJsonObject("simple.json");

		let result = validateQuery(query, ["courses"]);
		expect(result).to.be.true;
	});
});
