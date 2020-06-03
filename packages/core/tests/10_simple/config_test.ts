import 'mocha';
import { expect } from 'chai';
import { Config } from '../../lib/data/config';

describe('Testing config', () => {
	it('Config test', () => {
		const c = new Config();

		// Check data
		expect(typeof c.data.display).to.be.equal('object');
		expect(c.data.display.itemsPerPage).to.be.equal(52);
		expect(c.data.foo).to.be.equal(void 0);

		// There should be no customised data
		expect(c.customised()).to.be.eql({});

		// Change value
		c.set({
			display: {
				itemsPerPage: 64,
			},
			foo: {
				bar: 1,
			},
		});
		expect(c.data.display.itemsPerPage).to.be.eql(64);
		expect(typeof c.data.foo).to.be.equal('undefined');
		expect(c.customised()).to.be.eql({
			display: {
				itemsPerPage: 64,
			},
		});
	});
});
