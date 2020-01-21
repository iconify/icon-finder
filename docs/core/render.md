# Render event callback in Iconify Icon Finder Core

This callback is the most important part of code. When there is something new to render, this callback is called. UI must create a function for callback and use it to update UI.

## Listening to "render" event

There are two ways to work with Icon Finder Core: using [APICore class](api-core.md) and using [Registry class](registry.md).

Render callback is the same using both methods, except that if you use APICore class, it has a second parameter that points to APICore instance.

This is how you should create callback when using [APICore class](api-core.md):

```js
const { APICore } = require('@iconify/icon-finder-core');

const core = new APICore({
	// Parameters here
	// ...
	callback: (data, core) => {
		// Main callback where all stuff happens
	},
});
```

This is how you should create callback when using [Registry class](registry.md):

```js
const { Registry } = require('@iconify/icon-finder-core/lib/registry');

// Create registry, get router and events
const registry = new Registry();
const router = registry.router;
const events = registry.events;

// Subscribe to render event, same as using callback in APICore example above
events.subscribe('render', data => {
	// Same as callback in example above.
});

// Navigate to home
router.home();
```

## Callback data

Parameter "data" of the callback contains data you should render. Data is an object, TypeScript type is `RouterEvent`. It has the following properties:

-   `viewChanged`: boolean. True if the current view has changed since the previous callback call. Value is true on the first callback call. This attribute should be used by UI to check if entire UI needs re-rendering, including parent views list.
-   `error`: string. Possible values:
    -   "": no error, the view is safe to render.
    -   "loading": the view is still loading. UI should render generic "Loading" page.
    -   "timeout": API request timed out.
    -   "invalid_data": API returned invalid data.
    -   "empty": API returned empty data. This can happen if, for example, there are no search matches. This error is generated before applying view filters, so lack of error does not guarantee that there are items to display.
    -   "not_found": API returned "not found" error.
-   `route`: PartialRoute. Current route. See [Route type](types.md#route).
-   `block`: Blocks. See [blocks.md](blocks.md). If there is an error (see `error` property mentioned above), blocks could be null.

## Callback logic

First check for `viewChanged` attribute. If the value is `true`, it means route was changed. UI might need to render different component for different view type, change navigation, change parent views list, change the keyword in the search form.

Then check for `error` attribute. If the value is not empty, the current view is not ready to be rendered. Display the appropriate error message. If the value is "loading", UI should show "loading" page.

If there is no error, you can access `blocks` property. UI should be split into components of the same types as blocks. Render components in whatever order you want, use data blocks as parameters.

## Buttons and inputs

Render callback is responsible only for rendering current data. If a user clicks a button or changes input value, you need to run action. See [actions.md](actions.md).
