// Iconify version (replaced during build!)
export const iconifyVersion = '2.0.0';

/**
 * Packages
 */
interface PackageInfo {
	name: string;
	version?: string;
}
type PackageInfoKeys = 'react' | 'vue2' | 'vue3' | 'svelte' | 'ember';
export const componentPackages: Record<PackageInfoKeys, PackageInfo> = {
	react: {
		name: '@iconify/react',
		version: '@alpha',
	},
	vue2: {
		name: '@iconify/vue2',
	},
	vue3: {
		name: '@iconify/vue',
		version: '@alpha',
	},
	svelte: {
		name: '@iconify/svelte',
		version: '@alpha',
	},
	ember: {
		name: '@iconify/ember',
	},
};

/**
 * Get import value for package
 */
export function getComponentImport(key: PackageInfoKeys): string {
	const item = componentPackages[key];
	let result = item.name;
	if (item.version !== void 0) {
		result += item.version;
	}
	return result;
}
