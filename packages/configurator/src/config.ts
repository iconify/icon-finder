import { APIProviderRawData } from '@iconify/types/provider';

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
 * Full configuration
 */
export interface IconFinderConfig {
	// Theme name
	theme: string;

	// Custom files directory
	customFilesDir: string;

	// Language pack
	language: string;

	// Toggle views
	views: {
		custom: boolean;
	};

	// Layout
	layout: {
		canShortenName: boolean; // Shorten icon name when prefix is not needed
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
		};
		showCustomisationsTitle: boolean; // Shows title in customisations block

		// Buttons
		showButtons: boolean;
		buttons: Record<string, FooterButton>;

		// Full sample maximum dimensions
		fullSample: {
			width: number;
			height: number;
		};
	};

	// API providers
	providers: {
		canAdd: boolean;

		// Default provider name
		default: string;

		// Custom providers list
		custom: Record<string, APIProviderRawData>;
	};
}

/**
 * Partial config
 */
type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>;
};

export type PartialIconFinderConfig = RecursivePartial<IconFinderConfig>;

/**
 * Default configuration
 */
export const config: IconFinderConfig = {
	theme: '',
	customFilesDir: '',
	language: 'en',
	views: {
		custom: true,
	},

	// Layout
	layout: {
		canShortenName: false,
	},

	// Footer
	showFooter: true,
	footer: {
		components: {
			footer: 'simple',
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
		},
		showCustomisationsTitle: false,

		// Buttons
		showButtons: true,
		buttons: {},

		// Footer sample dimensions
		fullSample: {
			width: 200,
			height: 300,
		},
	},

	// API providers
	providers: {
		canAdd: false,
		default: '',
		custom: Object.create(null),
	},
};
