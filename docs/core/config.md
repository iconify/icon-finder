# Configuration of Iconify Icon Finder Core

You can look at default configuration values in `src/data/config.ts`.

## Changing configuration

If you want to change the configuration, you should do it when initialising instance.

If you are using [APICore class](api-core.md), pass custom configuration as `config` parameter to constructor:

```js
const { APICore } = require('@iconify/icon-finder-core');

const core = new APICore({
	config: {
		API: {
			resources: ['http://localhost:5000'],
		},
		display: {
			itemsPerPage: 32,
			viewUpdateDelay: 0,
		},
	},
	// Other parameters here
	// ...
	callback: (data, core) => {
		// Main callback where all stuff happens
	},
});
```

If you are using [Registry class](registry.md), change configuration after creating registry:

```js
const { Registry } = require('@iconify/icon-finder-core/lib/registry');

// Create registry, get configuration and change it
const registry = new Registry();
const config = registry.config;
config.set({
	API: {
		resources: ['http://localhost:5000'],
	},
	display: {
		itemsPerPage: 32,
		viewUpdateDelay: 0,
	},
});

// Do other stuff
```

You can set only values that are modified. Values will be merged with the default configuration.

Important: make sure types are the same as in default configuration, otherwise things might break!

## Getting customised configuration

Sometimes UI needs to retrieve configuration values that were customised, so it could store it in some storage for next time.

This is possible only when using Registry class:

```js
const config = registry.config;
const customised = config.customised();
// Serialise (use JSON.stringify()) and store customised somewhere.
```

## Configuration sections

There are several types of configuration, split into different sections:

-   `API`: configuration for API requests.
-   `display`: configuration rendering data.
-   `router`: routes configuration.

Explanation of each configuration variable is available in `src/data/config.ts`.
