const mocha = require('mocha');
const { expect } = require('chai');
const { Params } = require('../lib/params');
const { config } = require('../lib/config');

describe('Testing Params class: reading configuration', () => {
	it('Missing config file', (done) => {
		const params = new Params();
		try {
			params.buildConfig();
			done('Expected exception');
		} catch (err) {
			done();
		}
	});

	it('theme.json', (done) => {
		const configFile = 'theme.json';
		const params = new Params();

		// Attempt to validate theme
		try {
			params.validateTheme();
			done('Expected exception when validating empty theme');
		} catch (err) {}

		// Load params
		params.applyArguments(['--config=tests/fixtures/' + configFile]);
		expect(params.params).to.be.eql({
			configFile: 'tests/fixtures/' + configFile,
		});

		params.buildConfig();

		// Attempt to validate theme
		try {
			expect(params.validateTheme()).to.be.equal('figma');
		} catch (err) {
			done('Did not expect exception when validating loaded theme');
		}

		const expected = JSON.parse(JSON.stringify(config));

		// Make changes same as in config file
		expected.theme = 'figma';

		expect(params.config).to.be.eql(expected);

		done();
	});

	it('footer-test.json', () => {
		const configFile = 'footer-test.json';
		const params = new Params();

		params.applyArguments(['--config=tests/fixtures/' + configFile]);
		expect(params.params).to.be.eql({
			configFile: 'tests/fixtures/' + configFile,
		});

		params.buildConfig();

		const expected = JSON.parse(JSON.stringify(config));

		// Make changes same as in config file
		expected.showFooter = false;
		expected.footer.components.name = 'simple-editable';
		expected.footer.customisations.color.show = false;

		expect(params.config).to.be.eql(expected);
	});

	it('footer-buttons.json', () => {
		const configFile = 'footer-buttons.json';
		const params = new Params();

		params.applyArguments(['--config=tests/fixtures/' + configFile]);
		expect(params.params).to.be.eql({
			configFile: 'tests/fixtures/' + configFile,
		});

		params.buildConfig();

		const expected = JSON.parse(JSON.stringify(config));

		// Make changes same as in config file
		expected.footer.buttons = {
			submit: {
				type: 'primary',
				text: 'Submit',
			},
		};

		expect(params.config).to.be.eql(expected);
	});
});
