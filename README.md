# sveltekit-adapter-fastly-compute

NOTE: This project is under active development. It is not functional yet.
Feel free to contribute!

SvelteKit adapter that creates a Fastly Compute@Edge site using a function for 
dynamic server rendering. Based on sveltekit's own `adapter-cloudflare-workers`

**Requires [Wrangler v2](https://developers.cloudflare.com/workers/wrangler/get-started/).** Wrangler v1 is no longer supported.
## Usage

Install with `npm i -D sveltekit-adapter-fastly-compute`, then add the adapter to your `svelte.config.js`:

```js
import adapter from 'sveltekit-adapter-fastly-compute';

export default {
  kit: {
    adapter: adapter()
  }
};
```

## Basic Configuration

This adapter expects to find a [fastly.toml](https://developer.fastly.com/reference/compute/fastly-toml/) file in the project root. It should look something like this:

```toml
manifest_version = 2
name = "my-compute-project"
description = "A wonderful Compute@Edge project that adds edge computing goodness to my application architecture."
authors = ["me@example.com"]
language = "javascript"
service_id = "SU1Z0isxPaozGVKXdv0eY"
```


If you have not done so before, install the [Fastly CLI](https://developer.fastly.com/learning/tools/cli).
After installing, configure it with:

```sh
fastly profile create
```

Then, you can build your app and deploy it:

```sh
fastly publish
```

## Environment variables

The [`env`](https://developers.cloudflare.com/workers/runtime-apis/fetch-event#parameters) object, containing KV/DO namespaces etc, is passed to SvelteKit via the `platform` property along with `context` and `caches`, meaning you can access it in hooks and endpoints:

```js
export async function POST({ request, platform }) {
  const x = platform.env.YOUR_DURABLE_OBJECT_NAMESPACE.idFromName('x');
}
```

To make these types available to your app, reference them in your `src/app.d.ts`:

```diff
/// <reference types="@sveltejs/kit" />
+/// <reference types="sveltekit-adapter-fastly-compute" />

declare namespace App {
	interface Platform {
+		env?: {
+			YOUR_KV_NAMESPACE: KVNamespace;
+			YOUR_DURABLE_OBJECT_NAMESPACE: DurableObjectNamespace;
+		};
	}
}
```

[//]: # (## Changelog)

[//]: # ()
[//]: # ([The Changelog for this package is available on GitHub]&#40;https://github.com/sveltejs/kit/blob/master/packages/adapter-cloudflare-workers/CHANGELOG.md&#41;.)
