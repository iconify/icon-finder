/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import { EmptyView } from '../../lib/views/empty';
import { Registry } from '../../lib/registry';
import type { FullEmptyRoute } from '../../lib/route/types/routes';
import { objectToRoute } from '../../lib/route/convert';

describe('Testing empty view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Do tests
	 */
	it('Creating view', (done) => {
		const registry = new Registry(namespace + nsCounter++);

		// Set variables
		let loaded = false;
		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			expect(loaded).to.be.equal(false);
			expect(isSync).to.be.equal(false);
			loaded = true;

			const view = data as EmptyView;
			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new EmptyView(
			registry.id,
			objectToRoute({
				type: 'empty',
			}) as FullEmptyRoute
		);

		// Start loading
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'empty',
			params: {},
			parent: null,
		});

		isSync = false;
	});

	it('Creating view (syncronous)', (done) => {
		const registry = new Registry(namespace + nsCounter++);

		// Synchronous test
		const config = registry.config;
		config.router.syncRender = true;

		// Set variables
		let loaded = false;
		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			expect(loaded).to.be.equal(false);
			expect(isSync).to.be.equal(true);
			loaded = true;

			const view = data as EmptyView;
			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new EmptyView(
			registry.id,
			objectToRoute({
				type: 'empty',
			}) as FullEmptyRoute
		);

		// Start loading
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'empty',
			params: {},
			parent: null,
		});

		isSync = false;
	});
});
