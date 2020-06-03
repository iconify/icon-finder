import { CollectionInfo } from '../converters/collection';

interface CollectionInfoList {
	[index: string]: CollectionInfo;
}

export class CollectionsData {
	public data: Record<string, CollectionInfoList> = Object.create(null);

	/**
	 * Set data
	 */
	set(provider: string, prefix: string, data: CollectionInfo): void {
		if (this.data[provider] === void 0) {
			this.data[provider] = Object.create(null);
		}
		const providerData = this.data[provider];
		if (providerData[prefix] === void 0 || data.index) {
			// Overwrite previous entry only if index is set
			providerData[prefix] = data;
		}
	}

	/**
	 * Get data
	 */
	get(provider: string, prefix: string): CollectionInfo | null {
		return this.data[provider] !== void 0 &&
			this.data[provider][prefix] === void 0
			? null
			: this.data[provider][prefix];
	}

	/**
	 * Get collection title (or prefix if not available)
	 */
	title(provider: string, prefix: string): string {
		if (
			this.data[provider] === void 0 ||
			this.data[provider][prefix] === void 0
		) {
			return prefix;
		}
		return this.data[provider][prefix].name;
	}
}
