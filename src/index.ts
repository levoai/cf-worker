/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { buildHarFromRequestResponse, shouldSendToLevo } from "./levo/cloudflare/har";

addEventListener("fetch", (event: FetchEvent) => {
	const response = handleRequest(event.request);
	event.respondWith(response);
	event.waitUntil(sendToLevo(event.request, response))
});

async function handleRequest(request: Request): Promise<Response> {
	const response = await fetch(request);
	return response
}
async function sendToLevo(request: Request, response: Promise<Response>): Promise<void> {
	if (!shouldSendToLevo(request, await response)) {
		return;
	}
	if (!LEVO_AUTH_KEY) {
		console.warn("LEVO_AUTH_KEY not set, skipping");
		return;
	}
	if (!LEVO_SATELLITE_URL) {
		console.warn("LEVO_AUTH_KEY not set, skipping");
		return;
	}
	const levo_url = `${LEVO_SATELLITE_URL}${LEVO_SATELLITE_URL.charAt(LEVO_SATELLITE_URL.length - 1) === "/" ? "" : "/"}1.0/har`;
	const responseObj = await response;
	const harLog = await buildHarFromRequestResponse(request, responseObj.clone());
	const levo_request = new Request(levo_url, {
		method: "POST",
		body: JSON.stringify(harLog),
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${LEVO_AUTH_KEY}`,
			"x-levoai-version": "1.0",
		},
	});
	const levo_response = await fetch(levo_request);
	if (levo_response.status >= 400) {
		console.error(`Levo response: ${levo_response.status} ${levo_response.statusText}, Body: ${await levo_response.text()}`);
	}
}
