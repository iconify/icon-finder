import { LoadedConfigs } from './configs';
import {
	IconFinderCommonConfig,
	config as defaultConfig,
	merge as mergeConfig,
} from '../config/common';
import { merge } from '../config/merge';

export function loadCommonConfig(
	configs: LoadedConfigs
): IconFinderCommonConfig {
	let config = defaultConfig();

	// Merge all custom configurations
	configs.common.forEach((item) => {
		config = merge(config, item, mergeConfig);
	});

	return config;
}
