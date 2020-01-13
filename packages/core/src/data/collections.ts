import { CollectionInfo } from '../converters/collection';

interface CollectionInfoList {
	[index: string]: CollectionInfo;
}

export class CollectionsData {
	public data: CollectionInfoList = Object.create(null);

	/**
	 * Set data
	 */
	set(prefix: string, data: CollectionInfo): void {
		if (this.data[prefix] === void 0 || data.index) {
			// Overwrite previous entry only if index is set
			this.data[prefix] = data;
		}
	}

	/**
	 * Get data
	 */
	get(prefix: string): CollectionInfo | null {
		return this.data[prefix] === void 0 ? null : this.data[prefix];
	}

	/**
	 * Get collection title (or prefix if not available)
	 */
	title(prefix: string): string {
		if (this.data[prefix] === void 0) {
			return prefix;
		}
		return this.data[prefix].name;
	}
}
