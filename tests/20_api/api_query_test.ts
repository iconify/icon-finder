import 'mocha';
import { expect } from 'chai';
import { API } from '../fake_api';
import { Registry } from '../../lib/registry';
import type { CollectionInfo } from '../../lib/converters/collection';

describe('Testing API', function () {
	const namespace = __filename;
	let nsCounter = 0;

	it('Sending query', function (done) {
		// Retries counter
		let retry = 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const originalTitle = this.test!.title;
		const canRetry = (): boolean => retry < 3;
		const testTimer = (
			diff: number,
			min: number,
			max: number,
			message: string,
			next: () => void
		): boolean => {
			if (diff > min && diff < max) {
				// Success
				return true;
			}
			// Fail
			if (!canRetry()) {
				done(message);
				return false;
			} else {
				if (this.test) {
					this.test.title =
						originalTitle + ' (attempt #' + (retry + 2) + ')';
				}
				setTimeout(() => {
					retry++;
					next();
				});
				return false;
			}
		};

		// Run test
		const test = (): void => {
			const registry = new Registry(namespace + nsCounter++);
			const api = new API(registry);
			let loaded = false;
			const startTime = Date.now();

			api.loadFixture('', '/collections', {}, 'collections');

			expect(api.isCached('', '/collections', {})).to.be.equal(false);
			expect(api.isPending('', '/collections', {})).to.be.equal(false);

			api.query(
				'',
				'/collections',
				{},
				(data: unknown, cached?: boolean) => {
					expect(cached).to.be.equal(false);

					// Check if response is object
					expect(typeof data).to.be.equal('object');
					const response = data as Record<string, CollectionInfo>;

					// Callback should be called only once
					expect(loaded).to.be.equal(false);
					loaded = true;

					// Check delay, should be almost instant
					const diff = Date.now() - startTime;
					if (
						!testTimer(
							diff,
							0,
							25,
							`Loading should be instant, got ${diff}ms`,
							test
						)
					) {
						return;
					}

					// Check contents
					expect(typeof response.jam).to.be.equal('object');
					expect(response.jam).to.be.eql({
						name: 'Jam Icons',
						total: 896,
						author: 'Michael Amprimo',
						url: 'https://github.com/michaelampr/jam',
						license: 'MIT',
						licenseURL:
							'https://raw.githubusercontent.com/michaelampr/jam/master/LICENSE',
						height: 24,
						samples: [
							'chevrons-square-up-right',
							'luggage-f',
							'rubber',
						],
						palette: 'Colorless',
						category: 'General',
					});

					// Check if response is cached or pending
					expect(api.isCached('', '/collections', {})).to.be.equal(
						false
					);
					expect(api.isPending('', '/collections', {})).to.be.equal(
						false
					);

					done();
				}
			);

			// Make sure response is asynchronous
			expect(loaded).to.be.equal(false);
			expect(api.isPending('', '/collections', {})).to.be.equal(true);
		};

		test();
	});

	it('Testing cache', function (done) {
		// Retries counter
		let retry = 0;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const originalTitle = this.test!.title;
		const canRetry = (): boolean => retry < 3;
		const testTimer = (
			diff: number,
			min: number,
			max: number,
			message: string,
			next: () => void
		): boolean => {
			if (diff > min && diff < max) {
				// Success
				return true;
			}
			// Fail
			if (!canRetry()) {
				done(message);
				return false;
			} else {
				if (this.test) {
					this.test.title =
						originalTitle + ' (attempt #' + (retry + 2) + ')';
				}
				setTimeout(() => {
					retry++;
					next();
				});
				return false;
			}
		};

		// Run test
		const test = (): void => {
			const registry = new Registry(namespace + nsCounter++);
			const api = new API(registry);
			const startTime = Date.now();
			let loaded = false;

			api.loadFixture('', '/collections', {}, 'collections', {
				responseDelay: 100,
				cacheResult: true,
			});

			api.query(
				'',
				'/collections',
				{},
				(data: unknown, cached?: boolean) => {
					expect(cached).to.be.equal(false);

					// Check if response is object
					expect(typeof data).to.be.equal('object');

					// Callback should be called only once
					expect(loaded).to.be.equal(false);
					loaded = true;

					// Check delay, should be just above 100ms
					const diff = Date.now() - startTime;
					if (
						!testTimer(
							diff,
							90,
							125,
							`Delay should be just above 100ms, got ${diff}ms`,
							test
						)
					) {
						return;
					}

					let secondCallbackCalled = false;

					// Send another query
					api.query(
						'',
						'/collections',
						{},
						(data: unknown, cached?: boolean) => {
							// Response should have been cached and returned almost immediately
							expect(cached).to.be.equal(true);
							expect(typeof data).to.be.equal('object');

							// Test isCached and isPending
							expect(
								api.isCached('', '/collections', {})
							).to.be.equal(true);
							expect(
								api.isPending('', '/collections', {})
							).to.be.equal(false);

							expect(secondCallbackCalled).to.be.equal(false);
							secondCallbackCalled = true;
						}
					);

					// Callback should be synchronous because data is already cached
					expect(secondCallbackCalled).to.be.equal(true);

					done();
				}
			);

			// Make sure response is asynchronous
			expect(loaded).to.be.equal(false);
		};

		test();
	});
});
