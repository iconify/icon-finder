export interface UITranslationAddForm {
	title?: string;
	placeholder: string;
	submit: string;
	invalid?: string;
}

export interface UITranslation {
	lang: string;
	search: {
		placeholder: Record<string, string>;
		defaultPlaceholder: string;
		button: string;
	};
	errors: {
		noCollections: string;
		noIconsFound: string;
		defaultError: string;
		custom: Record<string, string>;
	};
	icons: {
		header: {
			full: string;
			more: string;
			listMode: string;
			gridMode: string;
		};
		headerWithCount: Record<number, string>;
		tooltip: {
			size: string;
			colorless: string;
			colorful: string;
			char: string;
			length: string;
		};
		more: string;
		moreAsNumber: boolean;
	};
	filters: Record<string, string>;
	collectionInfo: {
		total: string;
		height: string;
		author: string;
		license: string;
		palette: string;
		colorless: string;
		colorful: string;
		link: string;
	};
	parent: Record<string, string>;
	collection: {
		by: string;
	};
	providers: {
		section: string;
		add: string;
		addForm: UITranslationAddForm;
		status: {
			loading: string;
			error: string;
			exists: string;
			unsupported: string;
		};
	};
	footer: {
		iconName: string;
		iconNamePlaceholder: string;
		inlineSample: {
			before: string;
			after: string;
		};
	};
	footerButtons: Record<string, string>;
	footerBlocks: Record<string, string>;
	footerOptionButtons: {
		hFlip: string;
		vFlip: string;
		rotate: string;
		rotateTitle: string;
		inline: string;
		block: string;
		inlineHint: string;
		blockHint: string;
	};
	code: {
		titles: Record<string, string>;
		childTabTitle: string;
		childTabTitles: Record<string, string>;
		heading: string;
		text: Record<string, string | Record<string, string>>;
		copy: string;
		copied: string;
		docsDefault: string;
		docs?: Record<string, string>;
	};
}
