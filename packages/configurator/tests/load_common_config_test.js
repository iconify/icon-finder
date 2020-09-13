const mocha = require('mocha');
const { expect } = require('chai');
const { config: commonConfig } = require('../lib/config/config');
const { argsToParams } = require('../lib/params/args');
const { loadConfigFromParams } = require('../lib/parse/load-configs');
const { loadCommonConfig } = require('../lib/parse/load-common-config');

describe('Testing loading common config', () => {
	it('Nothing to load', () => {
		// Set params
		const params = argsToParams([]);
		const configs = loadConfigFromParams(params);
		expect(configs).to.be.eql({
			common: [],
			components: [],
			theme: [],
		});

		// Get default config
		const config = loadCommonConfig(configs);
		expect(config).to.be.eql(commonConfig());
	});

	it('Custom config file', () => {
		// Set params
		const params = argsToParams([
			'--config-file=tests/fixtures/common-config.json',
		]);
		const configs = loadConfigFromParams(params);
		expect(configs).to.be.eql({
			common: [
				{
					theme: {
						name: 'figma',
					},
				},
			],
			components: [],
			theme: [],
		});

		// Merge with default config
		const config = loadCommonConfig(configs);
		expect(config).to.not.be.eql(commonConfig());
		expect(config.theme.name).to.be.equal('figma');
	});

	it('Custom theme name', () => {
		// Set params
		const params = argsToParams(['--theme=foo']);
		const configs = loadConfigFromParams(params);
		expect(configs).to.be.eql({
			common: [
				{
					theme: {
						name: 'foo',
					},
				},
			],
			components: [],
			theme: [],
		});

		// Merge with default config
		const config = loadCommonConfig(configs);
		expect(config).to.not.be.eql(commonConfig());
		expect(config.theme.name).to.be.equal('foo');
	});
});
