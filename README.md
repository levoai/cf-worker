# Levo CloudFlare Worker

> [!TIP]
> Find the up-to-date installation instructions at https://docs.levo.ai/install-traffic-capture-sensors/cloudflare-worker.

## Deploy using CloudFlare deploy

In order to deploy using `https://deploy.workers.cloudflare.com` you'll need to follow the steps provided after clicking the following button linking your github account and forking this repository.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/levoai/cf-worker)


## Deploy using wrangler

To deploy the worker using [Wrangler](https://github.com/cloudflare/wrangler) please fork this repository and run after setting Wrangler up:

`wrangler deploy`

## Configuration

### Secrets

This worker requires a secret variable that you must setup:

* `LEVO_ORG_ID`

You can obtain your organization ID by navigating to https://app.levo.ai/settings/organizations.

#### Configure secrets in Cloudflare dashboard

Go to the `levo-cf-worker` worker and then navigate to `Settings > Variables > Edit Variables`.
Once there, create a new variable with a name and value and click on `Encrypt`.

This change will be applied automatically next time the worker handles a new request.

#### Configure secrets using Wrangler

If you are forking the repository and publishing using Wrangler you can run the following command to set the secrets:

`echo <VALUE> | wrangler secret put LEVO_ORG_ID`

### Variables

You may optionally configure the following variables:

* `LEVO_ENV`: The environment that the app belongs to (e.g. `dev`, `prod`, etc). The default is `staging`.
* `LEVO_SATELLITE_URL`: The URL of a satellite that traces are sent to. The default is `https://collector.levo.ai`.
* `LEVO_ADDITIONAL_HEADERS`: Additional headers to be sent with the request to the satellite. The default is an empty string.
  - Example: LEVO_ADDITIONAL_HEADERS='X-Custom-Header1=Value1, X-Custom-Header2=Value2'

#### Configure variables in Cloudflare dashboard

Go to the `levo-cf-worker` worker and then navigate to `Settings > Variables > Edit Variables`.
Once there, create a new variable with a name and value.

#### Configure secrets using Wrangler

Add the variables as `KEY=VALUE` pairs under `[vars]` in `wrangler.toml`, and run `wrangler deploy`.

## Issues

If you run into issues with this specific project, please feel free to file an issue [here](https://github.com/levoai/cf-worker/issues). If the problem is with Wrangler, please file an issue [here](https://github.com/cloudflare/wrangler/issues).
