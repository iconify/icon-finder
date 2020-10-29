/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import type { IconFinderConfig } from '../../lib/data/config';
import { customisedConfig, createConfig } from '../../lib/data/config';

describe('Testing config', () => {
	it('Config test', () => {
		const c = createConfig();

		// Check data
		expect(typeof c.ui).to.be.equal('object');
		expect(c.ui!.itemsPerPage).to.be.equal(52);
		expect((c as Record<string, unknown>).foo).to.be.equal(void 0);

		// There should be no customised data
		expect(customisedConfig(c)).to.be.eql({});
	});

	it('Custom value', () => {
		// Change value
		const c = createConfig(({
			ui: {
				itemsPerPage: 64,
			},
			foo: {
				bar: 1,
			},
		} as unknown) as IconFinderConfig);
		expect(c.ui!.itemsPerPage).to.be.eql(64);
		expect(typeof (c as Record<string, unknown>).foo).to.be.equal(
			'undefined'
		);
		expect(customisedConfig(c)).to.be.eql({
			ui: {
				itemsPerPage: 64,
			},
		});
	});
});
