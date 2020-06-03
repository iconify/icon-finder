import 'mocha';
import { expect } from 'chai';
import {
	stringToIcon,
	validateIcon,
	iconToString,
	compareIcons,
	Icon,
} from '../../lib/icon';

describe('Testing icon', () => {
	it('Converting and validating', () => {
		let icon;

		// Simple prefix-name
		icon = stringToIcon('fa-home') as Icon;
		expect(icon).to.be.eql({
			provider: '',
			prefix: 'fa',
			name: 'home',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('fa:home');

		// Simple prefix:name
		icon = stringToIcon('fa:arrow-left') as Icon;
		expect(icon).to.be.eql({
			provider: '',
			prefix: 'fa',
			name: 'arrow-left',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('fa:arrow-left');

		// Longer prefix:name
		icon = stringToIcon('mdi-light:home-outline') as Icon;
		expect(icon).to.be.eql({
			provider: '',
			prefix: 'mdi-light',
			name: 'home-outline',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('mdi-light:home-outline');

		// Provider
		icon = stringToIcon('@iconify:mdi-light:home-outline') as Icon;
		expect(icon).to.be.eql({
			provider: 'iconify',
			prefix: 'mdi-light',
			name: 'home-outline',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal(
			'@iconify:mdi-light:home-outline'
		);

		// Provider without @
		icon = stringToIcon('iconify:mdi-light:home-outline') as Icon;
		expect(icon).to.be.eql({
			provider: 'iconify',
			prefix: 'mdi-light',
			name: 'home-outline',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal(
			'@iconify:mdi-light:home-outline'
		);

		// Provider with short prefix
		icon = stringToIcon('@fa:arrow-left') as Icon;
		expect(icon).to.be.eql({
			provider: 'fa',
			prefix: 'arrow',
			name: 'left',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('@fa:arrow:left');

		// Underscore is not an acceptable separator
		icon = stringToIcon('fa_home');
		expect(icon).to.be.eql(null);
		expect(validateIcon(icon)).to.be.equal(false);

		// Invalid character '_': fail validateIcon
		icon = stringToIcon('fa:home_outline') as Icon;
		expect(icon).to.be.eql({
			provider: '',
			prefix: 'fa',
			name: 'home_outline',
		});
		expect(validateIcon(icon)).to.be.equal(false);
		expect(iconToString(icon)).to.be.equal('fa:home_outline');

		// Too many colons: fail stringToIcon
		icon = stringToIcon('mdi:light:home:outline');
		expect(icon).to.be.eql(null);
		expect(validateIcon(icon)).to.be.equal(false);

		// Upper case: fail validateIcon
		icon = stringToIcon('MD:Home') as Icon;
		expect(icon).to.be.eql({
			provider: '',
			prefix: 'MD',
			name: 'Home',
		});
		expect(validateIcon(icon)).to.be.equal(false);
		expect(iconToString(icon)).to.be.equal('MD:Home');

		// Numbers: pass
		icon = stringToIcon('1:foo') as Icon;
		expect(icon).to.be.eql({
			provider: '',
			prefix: '1',
			name: 'foo',
		});
		expect(validateIcon(icon)).to.be.equal(true);
		expect(iconToString(icon)).to.be.equal('1:foo');

		// Accented letters: fail validateIcon
		icon = stringToIcon('md-fõö') as Icon;
		expect(icon).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'fõö',
		});
		expect(validateIcon(icon)).to.be.equal(false);
		expect(iconToString(icon)).to.be.equal('md:fõö');
	});

	it('Comparing', () => {
		let icon1, icon2;

		// Identical icons
		icon1 = stringToIcon('md-home');
		icon2 = stringToIcon('md:home');
		expect(icon1).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'home',
		});
		expect(icon2).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'home',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(true);

		// Different prefix
		icon1 = stringToIcon('md-home');
		icon2 = stringToIcon('md-twotone:home');
		expect(icon1).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'home',
		});
		expect(icon2).to.be.eql({
			provider: '',
			prefix: 'md-twotone',
			name: 'home',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(false);

		// Different provider
		icon1 = stringToIcon('@iconify:md-twotone:home');
		icon2 = stringToIcon('md-twotone:home');
		expect(icon1).to.be.eql({
			provider: 'iconify',
			prefix: 'md-twotone',
			name: 'home',
		});
		expect(icon2).to.be.eql({
			provider: '',
			prefix: 'md-twotone',
			name: 'home',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(false);

		// Different name
		icon1 = stringToIcon('md-home');
		icon2 = stringToIcon('md:house');
		expect(icon1).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'home',
		});
		expect(icon2).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'house',
		});
		expect(compareIcons(icon1, icon2)).to.be.equal(false);

		// Extra properties
		icon1 = stringToIcon('md:thin-home-outline');
		expect(icon1).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'thin-home-outline',
		});
		icon2 = stringToIcon('md:thin-home-outline') as Icon;
		expect(icon2).to.be.eql({
			provider: '',
			prefix: 'md',
			name: 'thin-home-outline',
		});

		Object.assign(icon2, {
			tags: ['Navigation'],
			chars: ['f000'],
			aliases: ['medium-home-outline'],
			themePrefix: 'thin',
			themeSuffix: 'outline',
		});
		expect(icon2).to.be.eql({
			provider: '',
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
