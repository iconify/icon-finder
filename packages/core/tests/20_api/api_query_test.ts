import 'mocha';
import { expect } from 'chai';
import { API } from '../fake_api';
import { Registry } from '../../lib/registry';

describe('Testing API', function() {
	const namespace = __filename;
	let nsCounter = 0;

	it('Sending query', function(done) {
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

			api.loadFixture('/collections', {}, 'collections');

			expect(api.isCached('/collections', {})).to.be.equal(false);
			expect(api.isPending('/collections', {})).to.be.equal(false);

			api.query('/collections', {}, (data, cached) => {
				expect(cached).to.be.equal(false);

				// Check if response is object
				expect(typeof data).to.be.equal('object');
				const response = data as Record<string, object>;

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
				expect(api.isCached('/collections', {})).to.be.equal(false);
				expect(api.isPending('/collections', {})).to.be.equal(false);

				done();
			});

			// Make sure response is asynchronous
			expect(loaded).to.be.equal(false);
			expect(api.isPending('/collections', {})).to.be.equal(true);
		};

		test();
	});

	it('Loading on second attempt', function(done) {
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

			// Set custom configuration
			const config = registry.config;
			config.set({
				API: {
					resources: ['host1', 'host2', 'host3'],
					rotate: 100,
				},
			});

			const api = new API(registry);
			const startTime = Date.now();
			let loaded = false;

			api.loadFixture('/collections', {}, 'collections', {
				attempt: 2,
			});

			api.query('/collections', {}, (data, cached) => {
				expect(cached).to.be.equal(false);

				// Check if response is object
				expect(typeof data).to.be.equal('object');
				const response = data as Record<string, object>;

				// Callback should be called only once
				expect(loaded).to.be.equal(false);
				loaded = true;

				// Check delay, should be just above 100ms
				const diff = Date.now() - startTime;
				if (
					!testTimer(
						diff,
						95,
						125,
						`Delay should be just above 100ms, got ${diff}ms`,
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
				done();
			});

			// Make sure response is asynchronous
			expect(loaded).to.be.equal(false);
		};

		test();
	});

	it('Testing cache', function(done) {
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

			api.loadFixture('/collections', {}, 'collections', {
				responseDelay: 100,
				cacheResult: true,
			});

			api.query('/collections', {}, (data, cached) => {
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
				api.query('/collections', {}, (data, cached) => {
					// Response should have been cached and returned almost immediately
					expect(cached).to.be.equal(true);
					expect(typeof data).to.be.equal('object');

					// Test isCached and isPending
					expect(api.isCached('/collections', {})).to.be.equal(true);
					expect(api.isPending('/collections', {})).to.be.equal(
						false
					);

					expect(secondCallbackCalled).to.be.equal(false);
					secondCallbackCalled = true;

					// Check delay, should be same as in previous callback because cache response is instant
					const diff = Date.now() - startTime;
					if (
						!testTimer(
							diff,
							90,
							125,
							`Second delay should be just above 100ms, got ${diff}ms`,
							test
						)
					) {
						return;
					}

					done();
				});

				// Callback should be async
				expect(secondCallbackCalled).to.be.equal(false);
			});

			// Make sure response is asynchronous
			expect(loaded).to.be.equal(false);
		};

		test();
	});

	it('Two simultaneous requests', function(done) {
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

			// Set custom configuration
			const config = registry.config;
			config.set({
				API: {
					resources: ['host1', 'host2', 'host3'],
					rotate: 100,
				},
			});

			const api = new API(registry);
			const startTime = Date.now();
			let loaded = false;
			let failed = false;

			api.loadFixture('/collections', {}, 'collections', {
				attempt: 2,
				cacheResult: true,
			});

			// Check if response is cached or pending
			expect(api.isCached('/collections', {})).to.be.equal(false);
			expect(api.isPending('/collections', {})).to.be.equal(false);

			api.query('/collections', {}, (data, cached) => {
				expect(cached).to.be.equal(false);
				expect(failed).to.be.equal(false);

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
						`First delay should be just above 100ms, got ${diff}ms`,
						test
					)
				) {
					failed = true;
					return;
				}

				// Check if response is cached or pending
				expect(api.isCached('/collections', {})).to.be.equal(true);
				expect(api.isPending('/collections', {})).to.be.equal(false);
			});

			// Send another request in 50ms
			setTimeout(() => {
				if (failed) {
					return;
				}
				expect(loaded).to.be.equal(false);
				api.query('/collections', {}, (data, cached) => {
					if (failed) {
						return;
					}
					expect(cached).to.be.equal(false);

					// Check if response is object
					expect(typeof data).to.be.equal('object');

					// First callback should have been called first
					expect(loaded).to.be.equal(true);

					// Check delay, should be right after first callback, even though this query was sent 50ms later
					// This is because duplicate query callback should have been attached to pending query instead of making another query
					const diff = Date.now() - startTime;
					if (
						!testTimer(
							diff,
							90,
							125,
							`Second delay should be just above 100ms, got ${diff}ms`,
							test
						)
					) {
						failed = true;
						return;
					}

					// Check if response is cached or pending
					expect(api.isCached('/collections', {})).to.be.equal(true);
					expect(api.isPending('/collections', {})).to.be.equal(
						false
					);

					done();
				});
			}, 50);
		};

		test();
	});
});
