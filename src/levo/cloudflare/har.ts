import { Cookie, Har, Header } from "har-format";
import { parse } from "cookie";

export interface Metadata {
	startedDateTime?: string;
	time?: number;
}

// Build a HAR object from Cloudflare Worker Request Response objects
export const buildHarFromRequestResponse = async (
	request: Request,
	response: Response,
	metadata?: Metadata
) => {
	const request_cookies = parse(request.headers.get("Cookie") || "");
	const response_cookies = response.headers
		.getAll("Set-Cookie")
		.map((value) => parse(value));
	const request_headers: Header[] = [];
	for (const [name, value] of request.headers) {
		request_headers.push({
			name,
			value,
		});
	}
	const response_headers: Header[] = [];
	for (const [name, value] of response.headers) {
		response_headers.push({
			name,
			value,
		});
	}
	const har: Har = {
		log: {
			version: "1.2",
			creator: {
				name: "Levo",
				version: "0.0.1",
			},
			pages: [
				{
					id: "page_1",
					title: "Levo HAR",
					startedDateTime:
						metadata?.startedDateTime || new Date().toISOString(),
					pageTimings: {
						onContentLoad: metadata?.time || -1,
						onLoad: metadata?.time || -1,
					},
				},
			],
			entries: [
				{
					pageref: "page_1",
					request: {
						method: request.method,
						url: request.url.split("?")[0],
						httpVersion: "HTTP/1.1",
						cookies: Object.entries(request_cookies).map(([name, value]) => {
							return {
								name,
								value,
							} as Cookie;
						}),
						headers: request_headers,

						queryString: (request.url.split("?")[1] || "")
							.split("&")
							.map((queryParam) => {
								const [name, value] = queryParam.split("=");
								return {
									name,
									value,
								};
							}),
						headersSize: -1,
						bodySize: parseInt(request.headers.get("Content-Length") || "-1"),
					},
					response: {
						status: response.status,
						statusText: response.statusText,
						httpVersion: "HTTP/1.1",
						cookies: response_cookies.map((cookie) => {
							return {
								name: Object.keys(cookie)[0],
								value: Object.values(cookie)[0],
							} as Cookie;
						}),
						headers: response_headers,
						content: {
							size: parseInt(response.headers.get("Content-Length") || "-1"),
							mimeType: response.headers.get("Content-Type") || "",
							text: await response.text(),
						},
						redirectURL: "",
						headersSize: -1,
						bodySize: parseInt(response.headers.get("Content-Length") || "-1"),
						_transferSize: -1,
						comment: "",
					},
					cache: {},
					timings: {
						blocked: -1,
						dns: -1,
						ssl: -1,
						connect: -1,
						send: -1,
						wait: -1,
						receive: -1,
					},
					serverIPAddress: "",
					connection: "",
					startedDateTime: metadata?.startedDateTime?.toString() || "",
					time: metadata?.time || -1,
				},
			],
		},
	};
	return har;
};

// Only report request/response pairs when response content type is application/json
export const shouldSendToLevo = (request: Request, response: Response) => {
	const contentType = response.headers.get("Content-Type") || "";
	return contentType.toLowerCase().includes("application/json");
};
