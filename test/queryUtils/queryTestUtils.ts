import * as fs from "fs";

export const getJsonObject = function (path: string) {
	return JSON.parse(fs.readFileSync(`test/resources/queries/${path}`, "utf8")).input;
};

export const getJsonObjectWithFullPath = function (path: string) {
	return JSON.parse(fs.readFileSync(path, "utf8")).input;
};

export const getJsonObjectResult = function (path: string) {
	return JSON.parse(fs.readFileSync(`test/resources/queries/${path}`, "utf8")).errorExpected;
};

export const getJsonObjectWithFullPathExpected = function (path: string) {
	return JSON.parse(fs.readFileSync(path, "utf8")).expected;
};
