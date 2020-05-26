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

	// Button title. If missing, title will be generated using this logic:
	// 1. phrases for key will be checked: footerButtons[key]
	// 2. key will be capitalised: 'submit' => 'Submit'
	title?: string;

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
		showCustoisations: boolean;
		customisations: {
			color: boolean; // Color picker
			width: boolean; // Width
			height: boolean; // Height
			flip: boolean; // Horizontal and vertical flip
			rotate: boolean;
		};
		showCustomisationsTitle: boolean; // Shows title in customisations block

		// Buttons
		showButtons: boolean;
		buttons: Record<string, FooterButton>;

		// Full sample maximum dimensions
		fullSample?: {
			width: number;
			height: number;
		};
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
		showCustoisations: true,
		customisations: {
			color: true,
			width: true,
			height: true,
			flip: true,
			rotate: true,
		},
		showCustomisationsTitle: false,

		// Buttons
		showButtons: true,
		buttons: {},
	},
};
