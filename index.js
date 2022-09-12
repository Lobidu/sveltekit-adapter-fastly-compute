import { existsSync, readFileSync, writeFileSync } from 'fs';
import { posix, dirname } from 'path';
import { execSync } from 'child_process';
import esbuild from 'esbuild';
import toml from '@iarna/toml';
import { fileURLToPath } from 'url';

/**
 * @typedef {{
 *   manifest_version: number;
 *   name: string;
 *   language: "javascript";
 * }} FastlyConfig
 */

const name = 'sveltekit-adapter-fastly-compute'

/** @type {import('.').default} */
export default function ({ outDir }) {
	return {
		name,

		async adapt(builder) {
			validate_config(builder);

      const dir = outDir || 'build'

			const files = fileURLToPath(new URL('./files', import.meta.url).href);
			const tmp = builder.getBuildDirectory(`.svelte-kit/${name}`);

			builder.rimraf(dirname(dir));

			builder.log.info('Installing worker dependencies...');
			builder.copy(`${files}/_package.json`, `${tmp}/package.json`);

			// TODO would be cool if we could make this step unnecessary somehow
			const stdout = execSync('npm install', { cwd: tmp });
			builder.log.info(stdout.toString());

			builder.log.minor('Generating worker...');
			const relativePath = posix.relative(tmp, builder.getServerDirectory());

			builder.copy(`${files}/entry.js`, `${tmp}/entry.js`, {
				replace: {
					SERVER: `${relativePath}/index.js`,
					MANIFEST: './manifest.js'
				}
			});

			writeFileSync(
				`${tmp}/manifest.js`,
				`export const manifest = ${builder.generateManifest({
					relativePath
				})};\n\nexport const prerendered = new Map(${JSON.stringify(
					Array.from(builder.prerendered.pages.entries())
				)});\n`
			);

			await esbuild.build({
				platform: 'browser',
				sourcemap: 'linked',
				target: 'es2020',
				entryPoints: [`${tmp}/entry.js`],
				outfile: dir,
				bundle: true,
				external: ['__STATIC_CONTENT_MANIFEST'],
				format: 'esm'
			});

			builder.log.minor('Copying assets...');
			builder.writeClient(dir);
			builder.writePrerendered(dir);
		}
	};
}

/**
 * @param {import('@sveltejs/kit').Builder} builder
 * @returns {FastlyConfig}
 */
function validate_config(builder) {
	if (existsSync('fastly.toml')) {
		/** @type {FastlyConfig} */
		let fastly_config;

		try {
      fastly_config = /** @type {FastlyConfig} */ (
				toml.parse(readFileSync('fastly.toml', 'utf-8'))
			);
		} catch (err) {
			err.message = `Error parsing fastly.toml: ${err.message}`;
			throw err;
		}

		if (fastly_config.language !== 'javascript') {
			throw new Error(
				'You must specify `language = "javascript"` in fastly.toml.'
			);
		}

		return fastly_config;
	}

	builder.log(
		`
		Sample fastly.toml:
		
    manifest_version = 2
    service_id = "<your-service-id>"
    name = "<your-site-name>"
    description = "A SvelteKit project deployed on Fastly Compute@Edge"
		authors = ["<your-name>"]
    language = "javascript"`
			.replace(/^\t+/gm, '')
			.trim()
	);

	throw new Error('Missing a fastly.toml file');
}
