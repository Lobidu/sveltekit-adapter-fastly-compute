import { Adapter } from '@sveltejs/kit';

interface adapterOptions {
  outDir?: string;
}

export default function plugin(opts: adapterOptions): Adapter;
