/**
 * Levo CloudFlare Worker
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
	HarMetadata,
	buildHarFromRequestResponse,
	shouldSendToLevo,
} from "./levo/cloudflare/har";

export interface Env {
	// environment variables
	LEVO_ORG_ID?: string;
	LEVO_SATELLITE_URL?: string;
	LEVO_ENV?: string;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		// Forward / Proxy original request
		const response = await fetch(request);
		// Send to Levo, NOTE: Does NOT block / wait
		ctx.waitUntil(sendToLevo(request, response, env));
		// Done
		return response;
	},
};

async function sendToLevo(
	request: Request,
	response: Response,
	env: Env
): Promise<void> {
	if (!shouldSendToLevo(request, response)) {
		return;
	}
	// TODO: Check if we need the following checks
	if (!env.LEVO_ORG_ID) {
		console.warn("LEVO_ORG_ID not set, skipping");
		return;
	}
	if (!env.LEVO_SATELLITE_URL) {
		console.warn("LEVO_SATELLITE_URL not set, skipping");
		return;
	}
	const levo_url = `${env.LEVO_SATELLITE_URL}${
		env.LEVO_SATELLITE_URL.charAt(env.LEVO_SATELLITE_URL.length - 1) === "/"
			? ""
			: "/"
	}1.0/har`;
	const metadata: HarMetadata = {
		levoHarResource: {
			levoEnv: env.LEVO_ENV,
			sensorType: "cloudflare_worker",
			sensorVersion: "1.1.0", // TODO: Get from package.json
			hostname: new URL(request.url).hostname,
		},
	};
	const har_log = await buildHarFromRequestResponse(
		request,
		response.clone(),
		metadata
	);
	const levo_request = new Request(levo_url, {
		method: "POST",
		body: JSON.stringify(har_log),
		headers: {
			"Content-Type": "application/json",
			"x-levo-organization-id": env.LEVO_ORG_ID,
		},
	});
	const levo_response = await fetch(levo_request);
	if (levo_response.status >= 400) {
		console.error(
			`Levo response: ${levo_response.status} ${
				levo_response.statusText
			}, Body: ${await levo_response.text()}`
		);
	}
}
