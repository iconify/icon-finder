/**
 * Footer button type
 */
type FooterButtonType = 'primary' | 'secondary' | 'destructive';

/**
 * Footer button
 */
export interface FooterButton {
	// Button type. Default = 'primary'
	type?: FooterButtonType;

	// Button text. If missing, text will be generated using this logic:
	// 1. phrases for key will be checked: footerButtons[key]
	// 2. key will be capitalised: 'submit' => 'Submit'
	text?: string;

	// Optional icon. Iconify icon name. Use "iif-custom" prefix for icons defined in theme
	icon?: string;

	// True if button should always be visible, even when footer is empty (can be used to always show "Close" button)
	always?: boolean;
}

/**
 * Footer sample data
 */
export interface IconFinderConfigFooterSample {
	width: number;
	height: number;
}

/**
 * Components configuration
 */
export interface IconFinderComponentsConfig {
	// Language pack
	language: string;

	// Toggle views
	views: {
		custom: boolean;
	};

	// True if search should be automatically focused
	focusSearch: boolean;

	// Shorten icon name when prefix is not needed
	canShortenName: boolean;

	// Options for collections list
	collectionsList: {
		// True if icon link should be in HTML
		authorLink: boolean;

		// True if entire block is clickable
		clickable: boolean;
	};

	// Options for collection view
	collectionView: {
		showInfo: boolean;
	};

	// Footer
	showFooter: boolean;
	footer: {
		components: {
			footer: string; // Footer component: 'simple', 'full', 'none'
			name: string; // Name component: 'block', 'simple', 'simple-editable'
		};

		// Icon customisations
		showCustomisations: boolean;
		customisations: {
			// Color picker
			color: {
				show: boolean;
				component: string;
				defaultColor: string;
			};

			// Dimensions
			size: {
				show: boolean;
				component: string;
				customiseWidth: boolean;
				customiseHeight: boolean;
				defaultWidth: number | string;
				defaultHeight: number | string;
			};

			// Flip
			flip: {
				show: boolean;
				component: string;
			};

			// Rotation
			rotate: {
				show: boolean;
				component: string;
			};

			// Inline
			inline: {
				show: boolean;
				component: string;
			};
		};
		showCustomisationsTitle: boolean; // Shows title in customisations block

		// Code blocks
		showCode: boolean;

		// Buttons
		showButtons: boolean;
		buttons: Record<string, FooterButton>;

		// Full sample maximum dimensions
		fullSample: IconFinderConfigFooterSample;
	};

	// Custom phrases
	phrases: Record<string, unknown>;
}

/**
 * Default configuration
 */
export function config(): IconFinderComponentsConfig {
	return {
		language: 'en',
		views: {
			custom: true,
		},

		// True if search should be automatically focused
		focusSearch: true,

		// Shorten icon name when prefix is not needed
		canShortenName: false,

		// Collections list options
		collectionsList: {
			authorLink: false,
			clickable: false,
		},

		// Collection view options
		collectionView: {
			showInfo: true,
		},

		// Footer
		showFooter: true,
		footer: {
			components: {
				footer: 'full',
				name: 'simple',
			},

			// Customisations
			showCustomisations: true,
			customisations: {
				color: {
					show: true,
					component: 'color',
					defaultColor: '',
				},
				size: {
					show: true,
					component: 'size',
					customiseWidth: true,
					customiseHeight: true,
					defaultWidth: '',
					defaultHeight: '',
				},
				flip: {
					show: true,
					component: 'flip',
				},
				rotate: {
					show: true,
					component: 'rotate',
				},
				inline: {
					show: false,
					component: 'inline',
				},
			},
			showCustomisationsTitle: false,

			// Code
			showCode: false,

			// Buttons
			showButtons: true,
			buttons: Object.create(null),

			// Footer sample dimensions
			fullSample: {
				width: 200,
				height: 300,
			},
		},

		// Custom phrases
		phrases: {},
	};
}

/**
 * Extended function to get type: checks for null and array
 */
function getType(value: unknown): string {
	const result = typeof value;
	if (result !== 'object') {
		return result;
	}
	return value === null ? 'null' : value instanceof Array ? 'array' : result;
}

/**
 * Merge values from default config and custom config
 *
 * This function returns value only if values should be merged in a custom way, such as making sure some objects don't mix
 * Returns undefined if default merge method should be used.
 */
export function merge<T>(
	path: string,
	defaultValue: T,
	customValue: T
): T | void {
	function testType(type: string | string[]): void {
		const type1 = getType(defaultValue);
		const type2 = getType(customValue);
		const types = typeof type === 'string' ? [type] : type;

		if (types.indexOf(type1) === -1 || types.indexOf(type2) === -1) {
			throw new Error(
				`Expected ${types.join(
					' or '
				)} for ${path}, got ${type1} and ${type2}`
			);
		}
	}

	switch (path) {
		case 'footer.buttons':
			// Merge custom buttons
			testType('object');
			return Object.assign(
				Object.create(null),
				defaultValue,
				customValue
			);
	}
}
