import { ConfiguratorParams } from './type';

/**
 * Regex to test theme name
 */
const themeMatch = /^[a-z0-9][a-z0-9_.-]*[a-z0-9]$/gi;

/**
 * Convert args to paramters
 */
export function argsToParams(
	args: string[],
	env?: Record<string, string>
): ConfiguratorParams {
	const params: ConfiguratorParams = {
		configFiles: [],
		config: {
			common: [],
			components: [],
			theme: [],
		},
		theme: '',
		rebuild: {
			core: false,
			theme: false,
			components: false,
		},
	};

	function isValidAction(action: string): boolean {
		if (action === 'theme' || action === 'config-file') {
			return true;
		}

		// 2 part actions
		const parts = action.split('-');
		if (parts.length !== 2) {
			return false;
		}

		if (parts[1] === 'config' && params.config[parts[0]] !== void 0) {
			// --*-config
			return true;
		}
		if (
			(parts[0] === 'rebuild' && parts[1] === 'all') ||
			params.rebuild[parts[1]] !== void 0
		) {
			// --rebuild-*
			return true;
		}
		return false;
	}

	let nextAction = '';
	args.forEach((item) => {
		if (item.slice(0, 2) === '--') {
			if (nextAction !== '') {
				throw new Error(
					`Unexpected parameter ${item}, expected value for --${nextAction}`
				);
			}

			// --key or --key=value
			const parts = item.split('=');
			const action = parts.shift().slice(2);
			if (!isValidAction(action)) {
				throw new Error(`Invalid parameter --${action}`);
			}

			nextAction = action;
			if (!parts.length) {
				// Check for actions without value
				const actionParts = nextAction.split('-');
				if (actionParts.length === 2 && actionParts[0] === 'rebuild') {
					// --rebuild-*
					nextAction = '';

					if (actionParts[1] === 'all') {
						// Rebuild all modules
						Object.keys(params.rebuild).forEach((key) => {
							params.rebuild[key] = true;
						});
						return;
					}

					const key = actionParts[1];
					if (params.rebuild[key] !== void 0) {
						params.rebuild[key] = true;
						return;
					}

					// Invalid --rebuild-* parameter
					throw new Error(`Invalid parameter --${action}`);
				}

				return;
			}

			item = parts.join('=');
		}

		// Parse value

		// Parse theme
		if (nextAction === 'theme') {
			if (!item.match(themeMatch)) {
				throw new Error(`Invalid theme: ${item}`);
			}
			params.theme = item;
			nextAction = '';
			return;
		}

		// Parse config file
		if (nextAction === 'config-file') {
			params.configFiles.push(item);
			nextAction = '';
			return;
		}

		// Config
		const actionParts = nextAction.split('-');
		if (
			actionParts.length !== 2 ||
			actionParts[1] !== 'config' ||
			params.config[actionParts[0]] === void 0
		) {
			throw new Error(`Invalid parameter --${nextAction}`);
		}
		try {
			const value = JSON.parse(item);
			params.config[actionParts[0]].push(value);
			nextAction = '';
		} catch (err) {
			throw new Error(
				`Invalid value for --${nextAction}, expected JSON string`
			);
		}
	});

	// Last action
	if (nextAction !== '') {
		throw new Error(`Missing value for --${nextAction}`);
	}

	// Parse environment variables
	if (typeof env === 'object') {
		// Set theme
		if (typeof env.UI_THEME === 'string') {
			const theme = env.UI_THEME;
			if (theme !== '') {
				if (!theme.match(themeMatch)) {
					throw new Error(
						`Invalid enviroment variable value for UI_THEME`
					);
				}
				params.theme = theme;
			}
		}

		// Custom config file
		if (typeof env.UI_CONFIG_FILE === 'string') {
			const configFile = env.UI_CONFIG_FILE;
			if (configFile !== '') {
				params.configFiles.push(configFile);
			}
		}
	}

	return params;
}

/**
 * Convert parameters object to array of arguments
 */
export function paramsToArgs(params: ConfiguratorParams): string[] {
	let result: string[] = [];

	// Add config files
	params.configFiles.forEach((file) => {
		result.push('--config-file');
		result.push(file);
	});

	// Add custom config
	Object.keys(params.config).forEach((key) => {
		params.config[key].forEach((item) => {
			result.push(`--${key}-config`);
			result.push(JSON.stringify(item));
		});
	});

	// Add theme
	if (typeof params.theme === 'string' && params.theme !== '') {
		result.push('--theme=' + params.theme);
	}

	// Rebuild
	if (!Object.values(params.rebuild).filter((item) => !item).length) {
		// Rebuild all components
		result.push('--rebuild-all');
	} else {
		result = result.concat(
			Object.keys(params.rebuild)
				.filter((key) => params.rebuild[key])
				.map((key) => '--rebuild-' + key)
		);
	}

	return result;
}
