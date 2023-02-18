/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { export_har } from "./levo/cloudflare/har";

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket
}

addEventListener("fetch", (event: FetchEvent) => {
	const response = handleRequest(event.request);
	event.respondWith(response);
	event.waitUntil(sendToLevo(event.request, response))
});

async function handleRequest(request: Request): Promise<Response> {
	console.log(`Handling request for ${request.url} received`);
	const response = await fetch(request);
	return response
}
async function sendToLevo(request: Request, response: Promise<Response>): Promise<void> {
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
	const harLog = await export_har(request, responseObj.clone());
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
