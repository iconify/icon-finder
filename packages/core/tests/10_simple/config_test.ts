import 'mocha';
import { expect } from 'chai';
import { Config } from '../../lib/data/config';

describe('Testing config', () => {
	it('Config test', () => {
		const c = new Config();

		// Check data
		expect(typeof c.data.API).to.be.equal('object');
		expect(c.data.API.rotate).to.be.equal(750);
		expect(c.data.foo).to.be.equal(void 0);

		// There should be no customised data
		expect(c.customised()).to.be.eql({});

		// Check if API resources is array
		expect(c.data.API.resources instanceof Array).to.be.equal(true);

		// Change values and add new entries
		const resources = (c.data.API.resources as string[]).slice(0);

		// Set cloned API.resources
		c.set({
			API: {
				resources: resources,
			},
		});
		expect(c.data.API.resources).to.not.be.equal(resources); // Array should have been copied
		expect(c.data.API.resources).to.be.eql(resources);

		expect(c.data.API.rotate).to.be.equal(750);
		expect(c.data.foo).to.be.equal(void 0);
		expect(c.customised()).to.be.eql({});

		// Do some changes
		c.set({
			API: {
				// Change API entries order
				resources: resources.slice(1).concat([resources[0]]),
				rotate: 500,
				timeout: 5000, // Default value
				// Function should be ignored
				limit: (): number => {
					return 5000;
				},
			},
			foo: {
				bar: 1,
			},
		});

		expect(c.data.API.resources).to.not.be.eql(resources);
		expect((c.data.API.resources as string[]).length).to.be.eql(
			resources.length
		);
		expect(c.data.API.rotate).to.be.equal(500);
		expect(c.data.API.timeout).to.be.equal(5000);
		expect(typeof c.data.foo).to.be.equal('undefined');
		expect(c.customised()).to.be.eql({
			API: {
				// Change API entries order
				resources: resources.slice(1).concat([resources[0]]),
				rotate: 500,
			},
		});
	});
});
