# Levo AI CloudFlare Worker

## Deploy using CloudFlare deploy

In order to deploy using `https://deploy.workers.cloudflare.com` you'll need to follow the steps provided after clicking the following button linking your github account and forking this repository.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/levoai/cf-worker)


## Deploy using wrangler

To deploy the worker using [Wrangler](https://github.com/cloudflare/wrangler) please fork this repository and run after setting Wrangler up:

`wrangler deploy`

## Configuration

This worker will require two secrets variables that you can setup in the dashboard:

* `LEVO_ORG_ID`
* `LEVO_SATELLITE_URL`

### Configure secrets in CloudFlare dashboard

For configureing this variables in the dashboard go to the `levo-cf-worker` worker and then navigate to `Settings > Variables > Edit Variables`. Once there create a new variable setting name and value and then click on `Encrypt`.

This changes will be applied automatically next time the worker handles a new request.


## Configure secrets using Wrangler

If you are forking the repository and publishing using Wrangler you can run the following command to set the secrets:

`echo <VALUE> | wrangler secrets put <SECRET_NAME>`

## Issues

If you run into issues with this specific project, please feel free to file an issue [here](https://github.com/levoai/cf-worker/issues). If the problem is with Wrangler, please file an issue [here](https://github.com/cloudflare/wrangler/issues).
