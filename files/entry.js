// The entry point for your application.
/// <reference types="@fastly/js-compute" />

import {Server} from "SERVER";
import {manifest, prerendered} from "MANIFEST";

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

const server = new Server(manifest);

/**
 * @param {FetchEvent} event
 */
async function handleRequest(event) {

  // TODO: Not sure where `env` would be coming from, so passing an empty
  //  object for now
  const env = {};
  const context = {};
  await server.init({ env });

  // Get the client request.
  let req = event.request;

  let url = new URL(req.url);

  // prerendered pages and index.html files
  const pathname = url.pathname.replace(/\/$/, '');
  let file = pathname.substring(1);

  try {
    file = decodeURIComponent(file);
  } catch (err) {
    // ignore
  }

  // static assets
  // TODO: Implement this, cloudflare example below:
  // if (url.pathname.startsWith(prefix)) {
  // 			/** @type {Response} */
  // 			const res = await get_asset_from_kv(req, env, context);
  // 			if (is_error(res.status)) return res;
  //
  // 			const cache_control = url.pathname.startsWith(prefix + 'immutable/')
  // 				? 'public, immutable, max-age=31536000'
  // 				: 'no-cache';
  //
  // 			return new Response(res.body, {
  // 				headers: {
  // 					// include original headers, minus cache-control which
  // 					// is overridden, and etag which is no longer useful
  // 					'cache-control': cache_control,
  // 					'content-type': res.headers.get('content-type'),
  // 					'x-robots-tag': 'noindex'
  // 				}
  // 			});
  // 		}

  // prerendered pages and index.html files
  // if (
  //   manifest.assets.has(file) ||
  //   manifest.assets.has(file + '/index.html') ||
  //   prerendered.has(pathname || '/')
  // ) {
  //   // TODO: Implement this
  // }

  // dynamically-generated pages
  return await server.respond(req, {
    platform: { env, context, caches },
    getClientAddress() {
      return req.headers.get('cf-connecting-ip');
    }
  });


  // Catch all other requests and return a 404.
  return new Response("The page you requested could not be found", {
    status: 404,
  });
}
