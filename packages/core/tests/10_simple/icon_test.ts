import 'mocha';
import { expect } from 'chai';
import {
	stringToIcon,
	validateIcon,
	iconToString,
	extendIcon,
	compareIcons,
	Icon,
} from '../../lib/icon';

describe('Testing icon', () => {
	it('Converting and validating', () => {
		let icon;

		// Simple prefix-name
		icon = stringToIcon('fa-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'fa',
			name: 'home',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('fa:home');

		// Simple prefix:name
		icon = stringToIcon('fa:arrow-left') as Icon;
		expect(icon).to.be.eql({
			prefix: 'fa',
			name: 'arrow-left',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('fa:arrow-left');

		// Longer prefix:name
		icon = stringToIcon('mdi-light:home-outline') as Icon;
		expect(icon).to.be.eql({
			prefix: 'mdi-light',
			name: 'home-outline',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('mdi-light:home-outline');

		// Underscore is not an acceptable separator
		icon = stringToIcon('fa_home');
		expect(icon).to.be.eql(null);
		expect(validateIcon(icon)).to.be.equal(false);

		// Invalid character '_': fail validateIcon
		icon = stringToIcon('fa:home_outline') as Icon;
		expect(icon).to.be.eql({
			prefix: 'fa',
			name: 'home_outline',
		});
		expect(validateIcon(icon)).to.be.equal(false);
		expect(iconToString(icon)).to.be.equal('fa:home_outline');

		// Too many colons: fail stringToIcon
		icon = stringToIcon('mdi-light:home:outline');
		expect(icon).to.be.eql(null);
		expect(validateIcon(icon)).to.be.equal(false);

		// Upper case: fail validateIcon
		icon = stringToIcon('MD:Home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'MD',
			name: 'Home',
		});
		expect(validateIcon(icon)).to.be.equal(false);
		expect(iconToString(icon)).to.be.equal('MD:Home');

		// Numbers: pass
		icon = stringToIcon('1:foo') as Icon;
		expect(icon).to.be.eql({
			prefix: '1',
			name: 'foo',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('1:foo');

		// Accented letters: fail validateIcon
		icon = stringToIcon('md-fõö') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'fõö',
		});
		expect(validateIcon(icon)).to.be.equal(false);
		expect(iconToString(icon)).to.be.equal('md:fõö');
	});

	it('Extending', () => {
		let icon;

		// Empty extend
		icon = stringToIcon('fa-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'fa',
			name: 'home',
		});
		extendIcon(icon, {});
		expect(icon).to.be.eql({
			prefix: 'fa',
			name: 'home',
		});

		// Tags as array
		icon = stringToIcon('md-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		extendIcon(icon, {
			tags: ['Home', 'Baseline'],
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
			tags: ['Home', 'Baseline'],
		});

		// Tag as string
		icon = stringToIcon('md-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		extendIcon(icon, {
			tag: 'Home',
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
			tags: ['Home'],
		});

		// Tags as array (should be first in result) and string (should be last in result)
		icon = stringToIcon('md-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		extendIcon(icon, {
			tag: 'Home',
			tags: ['Baseline'],
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
			tags: ['Baseline', 'Home'],
		});

		// Unique tags
		icon = stringToIcon('md-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		extendIcon(icon, {
			tag: 'Home',
			tags: ['Home', 'Baseline', 'Home'],
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
			tags: ['Home', 'Baseline'],
		});

		// Aliases
		icon = stringToIcon('md-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		extendIcon(icon, {
			alias: 'house',
			aliases: ['baseline-home', 'baseline-house'],
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
			aliases: ['baseline-home', 'baseline-house', 'house'],
		});

		// Characters
		icon = stringToIcon('md-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		extendIcon(icon, {
			char: 'f001',
			chars: ['f002', 'f003'],
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home',
			chars: ['f002', 'f003', 'f001'],
		});

		// Prefix
		icon = stringToIcon('md-baseline-home') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'baseline-home',
		});
		extendIcon(icon, {
			themePrefix: 'baseline',
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'baseline-home',
			themePrefix: 'baseline',
		});

		// Suffix
		icon = stringToIcon('md-home-outline') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home-outline',
		});
		extendIcon(icon, {
			themeSuffix: 'outline',
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'home-outline',
			themeSuffix: 'outline',
		});

		// Mix of all properties
		icon = stringToIcon('md:thin-home-outline') as Icon;
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'thin-home-outline',
		});
		extendIcon(icon, {
			tags: ['Navigation'],
			char: 'f000',
			aliases: ['medium-home-outline'],
			themePrefix: 'thin',
			themeSuffix: 'outline',
		});
		expect(icon).to.be.eql({
			prefix: 'md',
			name: 'thin-home-outline',
			tags: ['Navigation'],
			chars: ['f000'],
			aliases: ['medium-home-outline'],
			themePrefix: 'thin',
			themeSuffix: 'outline',
		});
		expect(iconToString(icon)).to.be.equal('md:thin-home-outline');
	});

	it('Comparing', () => {
		let icon1, icon2;

		// Identical icons
		icon1 = stringToIcon('md-home');
		icon2 = stringToIcon('md:home');
		expect(icon1).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		expect(icon2).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(true);

		// Different prefix
		icon1 = stringToIcon('md-home');
		icon2 = stringToIcon('md-twotone:home');
		expect(icon1).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		expect(icon2).to.be.eql({
			prefix: 'md-twotone',
			name: 'home',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(false);

		// Different name
		icon1 = stringToIcon('md-home');
		icon2 = stringToIcon('md:house');
		expect(icon1).to.be.eql({
			prefix: 'md',
			name: 'home',
		});
		expect(icon2).to.be.eql({
			prefix: 'md',
			name: 'house',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(false);

		// Extra properties
		icon1 = stringToIcon('md:thin-home-outline');
		expect(icon1).to.be.eql({
			prefix: 'md',
			name: 'thin-home-outline',
		});
		icon2 = stringToIcon('md:thin-home-outline') as Icon;
		expect(icon2).to.be.eql({
			prefix: 'md',
			name: 'thin-home-outline',
		});
		extendIcon(icon2, {
			tags: ['Navigation'],
			char: 'f000',
			aliases: ['medium-home-outline'],
			themePrefix: 'thin',
			themeSuffix: 'outline',
		});
		expect(icon2).to.be.eql({
			prefix: 'md',
			name: 'thin-home-outline',
			tags: ['Navigation'],
			chars: ['f000'],
			aliases: ['medium-home-outline'],
			themePrefix: 'thin',
			themeSuffix: 'outline',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(true);
	});
});
