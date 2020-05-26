const mocha = require('mocha');
const { expect } = require('chai');
const { Params } = require('../lib/params');

describe('Testing Params class', () => {
	it('Simple instance', () => {
		const params = new Params();
		expect(params.rebuild).to.be.eql({
			core: false,
			theme: false,
			components: false,
		});
		expect(params.params).to.be.eql({});
		expect(params.config).to.be.equal(void 0);
	});

	it('Instance with params', () => {
		const expected = {
			theme: 'default',
		};
		const params = new Params(expected);
		expect(params.rebuild).to.be.eql({
			core: false,
			theme: false,
			components: false,
		});
		expect(params.params).to.be.eql(expected);
		expect(params.config).to.be.equal(void 0);
	});

	it('Applying environment', (done) => {
		const env = {
			UI_THEME: 'iconify',
			UI_CONFIG_FILE: 'custom.json',
		};
		const params = new Params();

		// Attempt to validate theme
		try {
			params.validateTheme();
			done('Expected exception when validating empty theme');
		} catch (err) {}

		// Apply env and test it
		params.applyEnv(env);
		expect(params.rebuild).to.be.eql({
			core: false,
			theme: false,
			components: false,
		});
		expect(params.params).to.be.eql({
			configFile: 'custom.json',
			theme: 'iconify',
		});
		expect(params.config).to.be.equal(void 0);

		// Attempt to validate theme
		try {
			expect(params.validateTheme()).to.be.equal('iconify');
		} catch (err) {
			done('Did not expect exception when validating valid theme');
		}

		// Test getArguments()
		expect(params.getArguments()).to.be.eql([
			'--theme=iconify',
			'--config-file=custom.json',
		]);

		done();
	});

	it('Applying arguments', () => {
		const args = [
			'--rebuild-theme',
			'--theme',
			'default',
			'--config-file',
			'custom.json',
		];
		const params = new Params();

		expect(params.applyArguments(args)).to.be.eql([]);
		expect(params.rebuild).to.be.eql({
			core: false,
			theme: true,
			components: false,
		});
		expect(params.params).to.be.eql({
			configFile: 'custom.json',
			theme: 'default',
		});
		expect(params.config).to.be.equal(void 0);

		// Test getArguments()
		expect(params.getArguments()).to.be.eql([
			'--build-theme',
			'--theme=default',
			'--config-file=custom.json',
		]);
	});

	it('Applying arguments, short version', () => {
		const str = JSON.stringify({
			theme: 'figma',
		});
		const args = [
			'--watch-core',
			'--build-components',
			'--theme=default',
			'--config=custom.json',
			'--config=' + str,
			'ignored-value',
		];
		const params = new Params();

		expect(params.applyArguments(args)).to.be.eql(['core']);
		expect(params.rebuild).to.be.eql({
			core: true,
			theme: false,
			components: true,
		});
		expect(params.params).to.be.eql({
			configFile: 'custom.json',
			theme: 'default',
			config: {
				theme: 'figma',
			},
		});
		expect(params.config).to.be.equal(void 0);

		// Test getArguments()
		expect(params.getArguments()).to.be.eql([
			'--build-core',
			'--build-components',
			'--theme=default',
			'--config-file=custom.json',
			'--config=' + str,
		]);
	});

	it('Invalid theme', (done) => {
		const args = ['--theme=default/v1'];
		const params = new Params();

		try {
			params.applyArguments(args);
			done('Expected exception when applying arguments');
		} catch (err) {}

		// Attempt to validate theme
		try {
			params.validateTheme();
			done('Expected exception when validating theme');
		} catch (err) {}

		done();
	});

	it('Invalid theme 2', (done) => {
		const args = ['--theme', '.hidden'];
		const params = new Params();

		try {
			params.applyArguments(args);
			done('Expected exception');
		} catch (err) {
			done();
		}
	});

	it('Theme that does not exist', (done) => {
		const theme = 'invalid-theme-' + Date.now();
		const args = ['--theme', theme];
		const params = new Params();

		params.applyArguments(args);

		// Check theme
		expect(params.params.theme).to.be.equal(theme);

		// Attempt to validate theme
		try {
			params.validateTheme();
			done('Expected exception when validating theme');
		} catch (err) {}

		done();
	});

	it('Invalid config file', (done) => {
		const args = ['--config-file', '/etc/passwords'];
		const params = new Params();

		try {
			params.applyArguments(args);
			done('Expected exception');
		} catch (err) {
			done();
		}
	});

	it('Invalid config', (done) => {
		const args = ['--config', 'test'];
		const params = new Params();

		try {
			params.applyArguments(args);
			done('Expected exception');
		} catch (err) {
			done();
		}
	});
});
