import { IconFinderCommonConfig } from './common';
import { IconFinderThemeConfig } from './theme';
import { IconFinderComponentsConfig } from './components';
import { CustomFiles } from '../parse/custom-files';

/**
 * Interface for full config
 *
 * Components type will be replaced by components implementation, but either way it is an object
 */
export interface IconFinderConfig {
	common: IconFinderCommonConfig;
	theme: IconFinderThemeConfig;
	components: IconFinderComponentsConfig;
}

/**
 * Interface for config stored in components
 */
export interface StoredIconFinderConfig {
	replacements: Record<string, string>;
	customFiles: CustomFiles;
}
