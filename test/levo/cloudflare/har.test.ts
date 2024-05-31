import { buildHarFromRequestResponse } from "../../../src/levo/cloudflare/har";

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
