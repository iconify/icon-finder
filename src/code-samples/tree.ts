import { capitalize } from '../misc/capitalize';
import { codeSampleTitles } from './phrases';
import type {
	CodeSampleMode,
	CodeSampleTab,
	CodeSampleKey,
	CodeSampleType,
	CodeSampleAPIConfig,
} from './types';

/**
 * Code tree
 */
// Common properties for all objects
interface CodeSamplesTreeCommonProps {
	title: string;
}

// Common properties for objects without child items
interface CodeSamplesTreeCommonChildProps {
	mode: CodeSampleMode;
	type: CodeSampleType;
}

// Child item
export interface CodeSamplesTreeChildItem
	extends CodeSamplesTreeCommonProps,
		CodeSamplesTreeCommonChildProps {
	//
}

// Parent item (with or without children)
export interface CodeSamplesTreeItem
	extends Partial<CodeSamplesTreeCommonChildProps>,
		CodeSamplesTreeCommonProps {
	tab?: CodeSampleTab;
	children?: CodeSamplesTreeChildItem[];
}

export type CodeSamplesTree = CodeSamplesTreeItem[];

/**
 * Default code samples tree
 */
type RawCodeSamplesTreeChildItem = Partial<
	Record<CodeSampleMode, CodeSampleType>
>;
type RawCodeSamplesTreeWithChildren = Record<
	CodeSampleTab,
	RawCodeSamplesTreeChildItem
>;
type RawCodeSamplesTreeWithoutChildren = Record<CodeSampleMode, CodeSampleType>;

type RawCodeSamplesTree =
	| RawCodeSamplesTreeWithChildren
	| RawCodeSamplesTreeWithoutChildren;

const rawCodeTabs: RawCodeSamplesTree = {
	iconify: 'api',
	react: {
		'react-npm': 'npm',
		'react-api': 'api',
	},
	vue: {
		vue3: 'npm',
		vue2: 'npm',
	},
	svelte: 'npm',
	svg: {
		'svg-raw': 'raw',
		'svg-box': 'raw',
		'svg-uri': 'raw',
	},
};

/**
 * Get code samples tree
 */
export function getCodeSamplesTree(
	config: CodeSampleAPIConfig
): CodeSamplesTree {
	const results: CodeSamplesTree = [];

	/**
	 * Check if code sample can be shown
	 */
	function canUse(type: CodeSampleType): boolean {
		switch (type) {
			case 'raw':
				return config[type];

			case 'api':
			case 'npm':
				return config[type] !== void 0;
		}
	}

	/**
	 * Get title
	 */
	function getTitle(mode: CodeSampleKey): string {
		if (codeSampleTitles[mode] !== void 0) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return codeSampleTitles[mode]!;
		}
		return capitalize(mode);
	}

	for (const key in rawCodeTabs) {
		// Using weird type casting because TypeScript can't property resolve it
		const attr = key as CodeSampleKey;
		const item = rawCodeTabs[key as keyof typeof rawCodeTabs] as
			| RawCodeSamplesTreeChildItem
			| CodeSampleType;

		// Item without children
		if (typeof item === 'string') {
			const mode = attr as CodeSampleMode;
			if (canUse(item)) {
				// Add item without children
				const newItem: CodeSamplesTreeItem = {
					mode,
					type: item,
					title: getTitle(attr),
				};
				results.push(newItem);
			}
			continue;
		}

		// Item with children
		const children: CodeSamplesTreeChildItem[] = [];
		for (const key2 in item) {
			const mode = key2 as CodeSampleMode;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const type = item[mode]!;
			if (canUse(type)) {
				const newItem: CodeSamplesTreeChildItem = {
					mode,
					type,
					title: getTitle(mode),
				};
				children.push(newItem);
			}
		}

		let firstChild: CodeSamplesTreeChildItem;
		const tab = attr as CodeSampleTab;
		const title = getTitle(tab);
		switch (children.length) {
			case 0:
				break;

			case 1:
				// Merge children
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				firstChild = children[0]!;
				results.push({
					tab,
					mode: firstChild.mode,
					type: firstChild.type,
					title,
				});
				break;

			default:
				// Add all children
				results.push({
					tab,
					children,
					title,
				});
		}
	}

	return results;
}
