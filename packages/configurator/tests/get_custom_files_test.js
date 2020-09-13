const { dirname } = require('path');
const mocha = require('mocha');
const { expect } = require('chai');
const { getCustomFiles } = require('../lib/parse/custom-files');

describe('Testing getting custom files', () => {
	it('Local path', () => {
		const files = getCustomFiles('tests/fixtures');
		expect(files.path).to.be.equal('tests/fixtures');
		expect(files.files.length).to.be.equal(1);
		expect(files.files[0].filename).to.be.equal('/common-config.json');
	});

	it('Bundled package', () => {
		const files = getCustomFiles('@iconify/types');

		const packageJSON = require.resolve('@iconify/types');
		const parts = packageJSON.split('/');
		parts.pop();
		const dir = parts.join('/');
		expect(files.path).to.be.equal(dir);
		expect(files.files.length > 0).to.be.equal(true);

		// Check types.ts
		const packageFile = files.files.filter(
			(item) => item.filename === '/types.ts'
		);
		expect(packageFile.length).to.be.equal(1);
	});

	it('Local package, not bundled', () => {
		const files = getCustomFiles('@iconify/search-themes/iconify');

		const dir = dirname(dirname(__dirname)) + '/themes/iconify';
		expect(files.path).to.be.equal(dir);
		expect(files.files.length > 0).to.be.equal(true);
	});
});
