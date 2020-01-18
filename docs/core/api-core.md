# APICore class in Iconify Icon Finder

APICore class makes it easy to interact with Iconify Icon Finder Core.

All configuration values, initial route and callbacks are set in the constructor. Then all you need to do is react to the main callback.

```js
const { APICore } = require('@iconify/icon-finder-core');

const core = new APICore({
	// Configuration
	config: {
		display: {
			itemsPerPage: 32,
		},
	},
	// Default route. If default route fails, script will navigate to home page
	defaultRoute: {
		type: 'collections',
	},
	callback: (data, core) => {
		// Main callback where all stuff happens
	},
});
```
