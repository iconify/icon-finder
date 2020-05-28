import { readFileSync } from 'fs';
import {
	IconFinderConfig,
	config as defaultConfig,
	PartialIconFinderConfig,
	FooterButton,
} from './config';
import {
	fileExists,
	themeSourceTestFiles,
	coreTestFiles,
	filesExist,
	themeCompiledTestFiles,
	componentsCompiledConfigFile,
} from './files';

/**
 * Regex to test theme name
 */
const themeMatch = /^[a-z0-9][a-z0-9_.-]+[a-z0-9]$/gi;

/**
 * Parameters
 */
export interface ConfiguratorParams {
	// Optional config file to read
	configFile?: string;

	// Custom configuration
	// Overrides data from 'configFile'
	config?: PartialIconFinderConfig;

	// Theme to use
	// Overrides data from 'configFile' and 'config'
	theme?: string;
}

type ConfiguratorKeys = 'theme' | 'config' | 'config-file';

/**
 * Modules status
 */
export interface RebuildModules {
	core: boolean;
	theme: boolean;
	components: boolean;
}

export type PartialRebuildModules = Partial<RebuildModules>;

/**
 * TypeScript check to make sure all cases have been parsed
 */
function assertNever(value: never) {
	// Do nothing
}

/**
 * Params parser class
 */
export class Params {
	/**
	 * Status of each module
	 */
	rebuild: RebuildModules = {
		core: false,
		theme: false,
		components: false,
	};

	/**
	 * Parameters
	 */
	params: ConfiguratorParams = {};

	/**
	 * Configuration
	 */
	config: IconFinderConfig;

	/**
	 * Constructor
	 */
	constructor(params?: ConfiguratorParams, rebuild?: PartialRebuildModules) {
		if (params) {
			Object.assign(this.params, params);
		}
		if (rebuild) {
			Object.assign(this.rebuild, rebuild);
		}
	}

	/**
	 * Set parameter: theme
	 */
	_setTheme(value: string) {
		if (value.match(themeMatch)) {
			this.params.theme = value;
		} else if (value !== '') {
			throw new Error(`Invalid theme: ${value}`);
		}
	}

	/**
	 * Set parameter: config file
	 */
	_setConfigFile(value: string) {
		if (value.split('.').pop() === 'json') {
			this.params.configFile = value;
		} else if (value !== '') {
			throw new Error(`Invalid config file: ${value}`);
		}
	}

	/**
	 * Set parameter: config (or config file)
	 */
	_setConfig(value: string) {
		if (value === '') {
			return;
		}
		if (value.split('.').pop() === 'json') {
			// Using --config to set file instead of data
			this.params.configFile = value;
			return;
		}

		// JSON string
		if (value.slice(0, 1) !== '{' || value.slice(-1) !== '}') {
			throw new Error(
				`Invalid config data. Config value should be a valid JSON string`
			);
		}
		let config: PartialIconFinderConfig;
		try {
			config = JSON.parse(value);
		} catch (err) {
			throw new Error(
				`Invalid config data. Config value should be a valid JSON string`
			);
		}
		this.params.config = config;
	}

	/**
	 * Set parameter from command line
	 */
	_setParam(key: ConfiguratorKeys, value: string) {
		switch (key) {
			case 'theme':
				this._setTheme(value);
				break;

			case 'config-file':
				this._setConfigFile(value);
				break;

			case 'config':
				this._setConfig(value);
				break;

			default:
				assertNever(key);
		}
	}

	/**
	 * Parse environment variables
	 */
	applyEnv(env = process.env) {
		if (typeof env.UI_THEME === 'string') {
			this._setTheme(env.UI_THEME);
		}

		if (typeof env.UI_CONFIG_FILE === 'string') {
			this._setConfigFile(env.UI_CONFIG_FILE);
		}
	}

	/**
	 * Parse process arguments
	 */
	applyArguments(argv?: string[]): (keyof RebuildModules)[] {
		type NextAction = 'none' | ConfiguratorKeys;
		let nextAction: NextAction = 'none';
		const watching: (keyof RebuildModules)[] = [];

		(argv instanceof Array ? argv : process.argv.slice(2)).forEach(
			(param) => {
				if (param.slice(0, 2) === '--') {
					nextAction = 'none';

					const action = param.slice(2);
					const actionKey = action as ConfiguratorKeys;

					// Test for key
					switch (actionKey) {
						// Next argument is value
						case 'theme':
						case 'config-file':
						case 'config':
							nextAction = actionKey;
							return;

						default:
							assertNever(actionKey);
					}

					// Check for --build-* or --rebuild-* or --watch-*
					const buildParts = action.split('-');
					if (buildParts.length === 2) {
						const value = buildParts.pop() as keyof RebuildModules;
						let isWatching = false;
						switch (buildParts.shift()) {
							case 'watch':
								isWatching = true;
							case 'build':
							case 'rebuild':
								// --rebuild-all
								if (
									!isWatching &&
									(value as string) === 'all'
								) {
									Object.keys(this.rebuild).forEach((key) => {
										this.rebuild[key] = true;
									});
									return;
								}

								// --rebuild-theme
								switch (value) {
									case 'theme':
									case 'core':
									case 'components':
										this.rebuild[value] = true;
										if (
											isWatching &&
											watching.indexOf(value) === -1
										) {
											watching.push(value);
										}
										return;

									default:
										assertNever(value);
								}
						}
					}

					// --theme=value
					const actionParts = action.split('=');
					if (actionParts.length > 1) {
						const firstPart = actionParts.shift() as ConfiguratorKeys;
						const value = actionParts.join('=');
						switch (firstPart) {
							case 'theme':
							case 'config-file':
							case 'config':
								this._setParam(firstPart, value);
								break;

							default:
								assertNever(firstPart);
						}
						return;
					}
				}

				// --theme value
				switch (nextAction) {
					case 'theme':
					case 'config-file':
					case 'config':
						this._setParam(nextAction, param);
						break;

					case 'none':
						break;

					default:
						assertNever(nextAction);
				}

				nextAction = 'none';
			}
		);

		return watching;
	}

	/**
	 * Build configuration
	 */
	buildConfig() {
		// Copy default config without changing it
		this.config = JSON.parse(JSON.stringify(defaultConfig));

		// Merge configurator.json
		this._mergeConfigFile(
			this.params.configFile
				? this.params.configFile
				: 'configurator.json',
			true
		);

		// Merge object
		if (this.params.config) {
			this._mergeConfig(this.params.config, true);
		}

		// Theme
		if (this.params.theme) {
			this._mergeConfig(
				{
					theme: this.params.theme,
				},
				true
			);
		}
	}

	/**
	 * Validate theme
	 */
	validateTheme(): string {
		const theme =
			this.config === void 0 ? this.params.theme : this.config.theme;
		if (typeof theme !== 'string' || theme === '') {
			throw new Error('Missing theme in configuration');
		}

		if (!theme.match(themeMatch)) {
			throw new Error(
				'Invalid theme. Theme value should be name of directory with theme that exists in packages/themes/'
			);
		}
		if (!filesExist(themeSourceTestFiles(theme))) {
			throw new Error('Selected theme does not exist or invalid');
		}

		return theme;
	}

	/**
	 * Check modules to see if any modules need to be rebuilt
	 */
	checkModules() {
		if (this.config === void 0) {
			this.buildConfig();
		}

		// Check core
		this.rebuild.core = this.rebuild.core || !filesExist(coreTestFiles());
		if (this.rebuild.core) {
			// Components depend on core
			this.rebuild.components = true;
		}

		// Check theme
		if (
			!this.rebuild.theme &&
			!filesExist(themeCompiledTestFiles(this.config.theme))
		) {
			this.rebuild.theme = true;
		}
		if (this.rebuild.theme) {
			// Components depend on theme
			this.rebuild.components = true;
		}

		// Check components
		const componentsConfig = componentsCompiledConfigFile();
		if (!this.rebuild.components && !fileExists(componentsConfig)) {
			this.rebuild.components = true;
		}
		if (!this.rebuild.components) {
			// Validate previous config
			try {
				const config = JSON.parse(
					readFileSync(componentsConfig, 'utf8')
				);
				this.rebuild.components = !this._compareConfig(config);
			} catch (err) {
				this.rebuild.components = true;
			}
		}
	}

	/**
	 * Check if rebuild is required
	 */
	requiresRebuild(): boolean {
		for (let key in this.rebuild) {
			if (this.rebuild[key]) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Compare configuration
	 */
	_compareConfig(config: IconFinderConfig): boolean {
		function compare(item1, item2) {
			if (typeof item1 !== typeof item2) {
				throw new Error('Different types');
			}
			if (item1 === item2) {
				return;
			}
			if (typeof item1 !== 'object') {
				throw new Error('Different simple values');
			}
			const keys1 = Object.keys(item1);
			const keys2 = Object.keys(item2);
			if (keys1.length !== keys2.length) {
				throw new Error('Different objects');
			}
			keys1.forEach((key) => {
				if (item2[key] === void 0) {
					throw new Error('Different objects');
				}
				compare(item1[key], item2[key]);
			});
		}

		try {
			delete config['themeData'];
			compare(this.config, config);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Convert config to string
	 */
	stringifyConfig(): string {
		if (this.config === void 0) {
			this.buildConfig();
		}
		return JSON.stringify(this.config, null, 4);
	}

	/**
	 * Get current arguments
	 */
	getArguments(watching: (keyof RebuildModules)[] = []): string[] {
		const args = [];

		// Add builds
		Object.keys(this.rebuild).forEach((key) => {
			const attr = key as keyof RebuildModules;
			if (this.rebuild[attr]) {
				args.push(
					'--' +
						(watching.indexOf(attr) === -1 ? 'build' : 'watch') +
						'-' +
						attr
				);
			}
		});

		// Add params
		Object.keys(this.params).forEach((key) => {
			const attr = key as keyof ConfiguratorParams;
			const value = this.params[key];
			switch (attr) {
				case 'configFile':
					if (typeof value === 'string') {
						args.push('--config-file=' + value);
					}
					break;

				case 'config':
					if (typeof value === 'object') {
						args.push('--config=' + JSON.stringify(value));
					}
					break;

				case 'theme':
					if (typeof value === 'string') {
						args.push('--theme=' + value);
					}
					break;

				default:
					assertNever(attr);
			}
		});

		return args;
	}

	/**
	 * Merge config file
	 */
	_mergeConfigFile(file: string, canThrow = true): void {
		let config;

		// Read file
		try {
			const data = readFileSync(file, 'utf8');

			// Use eval to allow comments in file
			eval('config = ' + data);
		} catch (err) {
			if (canThrow) {
				throw new Error(`Error reading ${file}`);
			}
			return;
		}

		// Merge it
		if (typeof config === 'object') {
			this._mergeConfig(config, canThrow);
		} else if (canThrow) {
			throw new Error(`Error reading ${file}`);
		}
	}

	/**
	 * Merge configuration
	 */
	_mergeConfig(data: PartialIconFinderConfig, canThrow: boolean): void {
		// Check if data is a valid object
		if (
			typeof data !== 'object' ||
			data === null ||
			data instanceof Array
		) {
			if (canThrow) {
				throw new Error(`Configuration must be a valid object`);
			}
			return;
		}

		// Sample button to make sure fields are set correctly
		const sampleButton: Required<FooterButton> = {
			type: 'primary',
			text: '',
			icon: '',
			always: true,
		};

		// Merge
		function mergeButton(
			target: Record<string, FooterButton>,
			button: FooterButton,
			key: string
		) {
			// Check types
			if (typeof button !== 'object' || button === null) {
				// Delete button
				delete target[key];
				return;
			}

			// Validate button
			let copiedButton: FooterButton = {};
			for (let attr in button) {
				if (sampleButton[attr] === void 0) {
					throw new Error(
						`Invalid field ${attr} in footer button ${key}`
					);
				}
				if (typeof sampleButton[attr] !== typeof button[attr]) {
					throw new Error(
						`Invalid type of field ${attr} in footer button ${key}`
					);
				}
				copiedButton[attr] = button[attr];
			}

			// Overwrite button
			target[key] = copiedButton;
		}

		// Merge objects
		function merge(source: unknown, target: unknown, prefix: string) {
			Object.keys(source).forEach((key) => {
				const value = source[key];

				// Footer button
				if (prefix === 'footer.buttons.') {
					mergeButton(
						target as Record<string, FooterButton>,
						value as FooterButton,
						key
					);
					return;
				}

				if (typeof target[key] !== typeof value) {
					// No such object
					throw new Error(
						`Invalid type for configuration "${prefix}${key}"`
					);
				}

				// Simple type
				if (typeof target[key] !== 'object') {
					target[key] = value;
					return;
				}

				// Null?
				if (value === null) {
					throw new Error(
						`Invalid type for configuration "${prefix}${key}"`
					);
				}

				// Arrays
				if (value instanceof Array || target[key] instanceof Array) {
					if (
						value instanceof Array &&
						target[key] instanceof Array
					) {
						// Overwrite array
						target[key] = value;
						return;
					}

					throw new Error(
						`Invalid type for configuration "${prefix}${key}"`
					);
				}

				// Nested objects
				merge(value, target[key], prefix + key + '.');
			});
		}

		// Merge it
		try {
			merge(data, this.config, '');
		} catch (err) {
			if (canThrow) {
				throw err;
			}
		}
	}
}
