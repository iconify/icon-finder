export interface UITranslation {
	lang: string;
	search: {
		placeholder: string;
		namedPlaceholder: string;
		collectionsPlaceholder: string;
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
}
