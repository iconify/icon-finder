import { UITranslation } from './types';

export const phrases: UITranslation = {
	lang: 'English',
	search: {
		placeholder: 'Search all icons',
		namedPlaceholder: 'Search {name}',
		collectionsPlaceholder: 'Filter collections',
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
		more: 'Find more icons',
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
};
