import {
	buildHarFromRequestResponse,
	shouldSendToLevo,
} from "../../../src/levo/cloudflare/har";

test("should add query params correctly when present", async () => {
	// Given
	const request = new Request("http://example.com?key=value", {
		method: "GET",
	});
	const response = new Response("Hello World from GET!", { status: 200 });
	// When
	const har = await buildHarFromRequestResponse(request, response);
	// Then
	expect(har.log.entries[0].request.queryString).toStrictEqual([
		{ name: "key", value: "value" },
	]);
});

test("should not add query params when there are none", async () => {
	// Given
	const request = new Request("http://example.com", { method: "GET" });
	const response = new Response("Hello World from GET!", { status: 200 });
	// When
	const har = await buildHarFromRequestResponse(request, response);
	// Then
	expect(har.log.entries[0].request.queryString).toStrictEqual([]);
});

test("should not add query params if the url ends with a '?'", async () => {
	// Given
	const request = new Request("http://example.com/?", { method: "GET" });
	const response = new Response("Hello World from GET!", { status: 200 });
	// When
	const har = await buildHarFromRequestResponse(request, response);
	// Then
	expect(har.log.entries[0].request.queryString).toStrictEqual([]);
});

describe("request body capture", () => {
	test("POST with JSON body populates postData", async () => {
		const body = JSON.stringify({ foo: "bar" });
		const request = new Request("http://example.com/api", {
			method: "POST",
			body,
			headers: { "Content-Type": "application/json" },
		});
		const response = new Response("{}", { status: 200 });
		const har = await buildHarFromRequestResponse(request, response);
		expect(har.log.entries[0].request.postData).toStrictEqual({
			mimeType: "application/json",
			text: body,
		});
	});

	test("PUT with body populates postData", async () => {
		const body = "name=Alice&age=30";
		const request = new Request("http://example.com/api/1", {
			method: "PUT",
			body,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});
		const response = new Response("{}", { status: 200 });
		const har = await buildHarFromRequestResponse(request, response);
		expect(har.log.entries[0].request.postData).toStrictEqual({
			mimeType: "application/x-www-form-urlencoded",
			text: body,
		});
	});

	test("PATCH with body populates postData", async () => {
		const body = JSON.stringify({ age: 31 });
		const request = new Request("http://example.com/api/1", {
			method: "PATCH",
			body,
			headers: { "Content-Type": "application/json" },
		});
		const response = new Response("{}", { status: 200 });
		const har = await buildHarFromRequestResponse(request, response);
		expect(har.log.entries[0].request.postData).toStrictEqual({
			mimeType: "application/json",
			text: body,
		});
	});

	test("GET does not populate postData", async () => {
		const request = new Request("http://example.com/api", { method: "GET" });
		const response = new Response("{}", { status: 200 });
		const har = await buildHarFromRequestResponse(request, response);
		expect(har.log.entries[0].request.postData).toBeUndefined();
	});
});

describe("shouldSendToLevo content-type filtering", () => {
	const makeRequest = () => new Request("http://example.com/api");

	test("passes built-in content types", () => {
		const response = new Response("{}", {
			headers: { "Content-Type": "application/json" },
		});
		expect(shouldSendToLevo(makeRequest(), response)).toBe(true);
	});

	test("blocks unknown content types by default", () => {
		const response = new Response("data", {
			headers: { "Content-Type": "application/octet-stream" },
		});
		expect(shouldSendToLevo(makeRequest(), response)).toBe(false);
	});

	test("passes when content type is in additionalContentTypes", () => {
		const response = new Response("data", {
			headers: { "Content-Type": "application/octet-stream" },
		});
		expect(
			shouldSendToLevo(makeRequest(), response, ["application/octet-stream"])
		).toBe(true);
	});

	test("additionalContentTypes matching is case-insensitive", () => {
		const response = new Response("data", {
			headers: { "Content-Type": "Application/Octet-Stream" },
		});
		expect(
			shouldSendToLevo(makeRequest(), response, ["application/octet-stream"])
		).toBe(true);
	});

	test("passes when Content-Type is missing", () => {
		const response = new Response("data", { status: 200 });
		expect(shouldSendToLevo(makeRequest(), response)).toBe(true);
	});
});
