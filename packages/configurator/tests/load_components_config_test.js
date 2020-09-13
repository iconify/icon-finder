const mocha = require('mocha');
const { expect } = require('chai');
const { argsToParams } = require('../lib/params/args');
const { loadConfigFromParams } = require('../lib/parse/load-configs');
const { loadComponentsConfig } = require('../lib/parse/load-components-config');

describe('Testing loading components config', () => {
	it('Loading from external package', () => {
		// Set params
		const params = argsToParams([]);
		const configs = loadConfigFromParams(params);
		expect(configs).to.be.eql({
			common: [],
			components: [],
			theme: [],
		});

		// Get default config
		const config = loadComponentsConfig(
			'@iconify/search-components',
			configs
		);
		expect(config.language).to.be.equal('en');
	});
});
