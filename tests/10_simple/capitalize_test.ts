import 'mocha';
import { expect } from 'chai';
import { capitalize } from '../../lib/misc/capitalize';

describe('Testing capitalize', () => {
	it('Testing capitalize()', () => {
		expect(capitalize('vue')).to.be.equal('Vue');
		expect(capitalize('vue3')).to.be.equal('Vue 3');
		expect(capitalize('framework1.2.3')).to.be.equal('Framework 1.2.3');
		expect(capitalize('icon-framework')).to.be.equal('Icon Framework');
	});
});
