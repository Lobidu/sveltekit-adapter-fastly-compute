declare namespace App {
	export interface Platform {
		context?: {
			waitUntil(promise: Promise<any>): void;
		};
		caches?: CacheStorage & { default: Cache };
	}
}
