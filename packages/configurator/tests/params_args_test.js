const mocha = require('mocha');
const { expect } = require('chai');
const { argsToParams, paramsToArgs } = require('../lib/params/args');

describe('Testing converting arguments from/to parameters', () => {
	it('Theme', (done) => {
		// --theme=name
		let data = argsToParams(['--theme=figma']);
		expect(data.theme).to.be.equal('figma');
		expect(paramsToArgs(data)).to.be.eql(['--theme=figma']);

		// --theme name
		data = argsToParams(['--theme', 'figma']);
		expect(data.theme).to.be.equal('figma');
		expect(paramsToArgs(data)).to.be.eql(['--theme=figma']);

		// invalid theme
		try {
			argsToParams(['--theme=/etc/hosts']);
			done('Expected exception for invalid theme');
		} catch (err) {
			//
		}

		// missing value
		try {
			argsToParams(['--theme']);
			done('Expected exception for missing value');
		} catch (err) {
			//
		}

		done();
	});

	it('Config files', (done) => {
		// --config-file=value
		let data = argsToParams(['--config-file=config.json']);
		expect(data.configFiles).to.be.eql(['config.json']);
		expect(paramsToArgs(data)).to.be.eql(['--config-file', 'config.json']);

		// --config-file=value
		data = argsToParams(['--config-file', 'test.json']);
		expect(data.configFiles).to.be.eql(['test.json']);
		expect(paramsToArgs(data)).to.be.eql(['--config-file', 'test.json']);

		// missing value
		try {
			argsToParams(['--config-file']);
			done('Expected exception for missing value');
		} catch (err) {
			//
		}

		done();
	});

	it('Rebuild', (done) => {
		// --rebuild-all
		let data = argsToParams(['--rebuild-all']);
		expect(data.rebuild).to.be.eql({
			core: true,
			theme: true,
			components: true,
		});
		expect(paramsToArgs(data)).to.be.eql(['--rebuild-all']);

		// --rebuild-theme
		data = argsToParams(['--rebuild-theme']);
		expect(data.rebuild).to.be.eql({
			core: false,
			theme: true,
			components: false,
		});
		expect(paramsToArgs(data)).to.be.eql(['--rebuild-theme']);

		// --rebuild-core --rebuild-components
		data = argsToParams(['--rebuild-core', '--rebuild-components']);
		expect(data.rebuild).to.be.eql({
			core: true,
			theme: false,
			components: true,
		});
		expect(paramsToArgs(data)).to.be.eql([
			'--rebuild-core',
			'--rebuild-components',
		]);

		// invalid value
		try {
			argsToParams(['--rebuild-files']);
			done('Expected exception for invalid value');
		} catch (err) {
			//
		}

		done();
	});

	it('Config', (done) => {
		const config1 = {
			foo: 1,
		};

		// --common-config=value
		let data = argsToParams(['--common-config=' + JSON.stringify(config1)]);
		expect(data.config.common).to.be.eql([config1]);
		expect(paramsToArgs(data)).to.be.eql([
			'--common-config',
			JSON.stringify(config1),
		]);

		// --theme-config value
		data = argsToParams(['--theme-config', JSON.stringify(config1)]);
		expect(data.config.theme).to.be.eql([config1]);
		expect(paramsToArgs(data)).to.be.eql([
			'--theme-config',
			JSON.stringify(config1),
		]);

		// invalid key
		try {
			argsToParams(['--test-config', JSON.stringify(config1)]);
			done('Expected exception for invalid key');
		} catch (err) {
			//
		}

		// invalid value
		try {
			argsToParams(['--common-config', 'test']);
			done('Expected exception for invalid value');
		} catch (err) {
			//
		}

		done();
	});
});
