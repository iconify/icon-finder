import { UITranslation } from './types';

export const phrases: UITranslation = {
	lang: 'English',
	search: {
		placeholder: {
			collection: 'Search {name}',
			collections: 'Filter collections',
		},
		defaultPlaceholder: 'Search all icons',
		button: 'Find Icons',
	},
	errors: {
		noCollections: 'No matching icon sets found.',
		noIconsFound: 'No icons found.',
		defaultError: 'Error loading Iconify Icon Finder.',
		custom: {
			loading: 'Loading...',
			timeout: 'Connection timed out.',
			invalid_data: 'Invalid response from Iconify API.',
			empty: 'Nothing to show.',
			not_found: 'Collection {prefix} does not exist.',
			bad_route: 'Invalid route.',
			home: 'Click here to return to main page.',
		},
	},
	icons: {
		header: {
			full: 'Displaying {count} icons:',
			more:
				'Displaying {count} icons (click second page to load more results):',
			listMode: 'Display icons as list',
			gridMode: 'Display icons as grid',
		},
		headerWithCount: {
			0: 'No icons to display.',
			1: 'Displaying 1 icon:',
		},
		tooltip: {
			size: '\nSize: {size}',
			colorless: '',
			colorful: '\nHas palette',
			char: '\nIcon font character: {char}',
			length: '', //'\nContent: {length} bytes',
		},
		more: '3 ...', // 'Find more icons'
		moreAsNumber: true, // True if text above refers to third page, false if text above shows "Find more icons" or similar text
	},
	filters: {
		'uncategorised': 'Uncategorised',
		'collections': 'Filter search results by icon set:',
		'collections-collections': '',
		'tags': 'Filter by tag:',
		'themePrefixes': 'Icon type:',
		'themeSuffixes': 'Icon type:',
	},
	collectionInfo: {
		total: 'Number of icons:',
		height: 'Height of icons:',
		author: 'Author:',
		license: 'License:',
		palette: 'Palette:',
		colorless: 'Colorless',
		colorful: 'Has colors',
		link: 'Show all icons',
	},
	parent: {
		default: 'Return to previous page',
		collections: 'Return to collections list',
		collection: 'Return to {name}',
		search: 'Return to search results',
	},
	collection: {
		by: 'by ',
	},
	providers: {
		section: 'Icons source:',
		add: 'Add Provider',
		addForm: {
			title: "Enter API provider's host name:",
			placeholder: 'https://api.iconify.design',
			submit: 'Add API Provider',
			invalid:
				'Example of a valid API host name: https://api.iconify.design',
		},
		status: {
			loading: 'Checking {host}...',
			error: '{host} is not a valid Iconify API or cannot be reached.',
		},
	},
	footer: {
		iconName: 'Selected icon:',
		iconNamePlaceholder: 'Enter icon by name...',
	},
	footerButtons: {
		submit: 'Submit',
		change: 'Change',
		select: 'Select',
		cancel: 'Cancel',
		close: 'Close',
	},
	footerBlocks: {
		title: 'Customize icon:',
		color: 'Color',
		flip: 'Flip',
		hFlip: 'Horizontal',
		vFlip: 'Vertical',
		rotate: 'Rotate',
		width: 'Width',
		height: 'Height',
		size: 'Size', // Width + height in one block
		alignment: 'Alignment',
	},
	footerOptionButtons: {
		hFlip: 'Horizontal',
		vFlip: 'Vertical',
		rotate: '{num}' + String.fromCharCode(0x00b0),
		rotateTitle: 'Rotate {num}' + String.fromCharCode(0x00b0),
	},
};
