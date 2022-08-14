import type { IconCustomisations } from '../../misc/customisations';
import type { Icon } from '../../misc/icon';
import type {
	CodeSampleAPIConfig,
	CodeSampleKey,
	CodeSampleUsage,
} from '../types';

/**
 * Documentation
 */
export interface IconifyCodeDocs {
	href: string;
	type: CodeSampleKey;
}

/**
 * Code output
 */
export interface CustomCodeOutput {
	key: string;
	code: string;
}

export interface HTMLCodeOutput {
	// Code to add to <head>
	head: string;

	// HTML code
	html: string;
}

export interface CustomCodeOutputWithText {
	// Text
	text?: string;

	// Code
	code?: string;
}

type ComponentCodeUse = Record<CodeSampleUsage, string>;

export interface ComponentCodeOutput extends Partial<ComponentCodeUse> {
	// Install / import without icon
	'install-simple'?: string;
	'install-addon'?: string;
	'import-simple'?: string;

	// Install / import with icon
	'install-offline'?: string;
	'import-offline'?: string;

	// Vue specific usage
	'vue-simple'?: string;
	'vue-offline'?: string;
}

/**
 * Code sample output
 */
export interface CodeOutput {
	// Custom header and footer
	header?: CustomCodeOutputWithText;
	footer?: CustomCodeOutputWithText;

	// HTML
	html?: HTMLCodeOutput;

	// Raw code to copy
	raw?: string[];

	// Component
	component?: ComponentCodeOutput;

	// Documentation
	docs?: IconifyCodeDocs;

	// True if code relies on API, false if offline
	isAPI?: boolean;
}

/**
 * Code parser callback
 */
export type CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => CodeOutput | null;
