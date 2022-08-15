export const iconifyVersion = '2.2.1';
export const iconifyIconVersion = '1.0.0-beta.3';

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
	},
	vue2: {
		name: '@iconify/vue2',
	},
	vue3: {
		name: '@iconify/vue',
	},
	svelte: {
		name: '@iconify/svelte',
	},
	ember: {
		name: '@iconify/ember',
	},
};

/**
 * Get package name to install
 */
export function getComponentInstall(
	key: PackageInfoKeys,
	dev?: boolean
): string {
	const item = componentPackages[key];
	let result = item.name;
	if (item.version !== void 0) {
		result += item.version;
	}

	if (typeof dev === 'boolean') {
		return 'npm install --save' + (dev ? '-dev ' : ' ') + result;
	}

	return result;
}
