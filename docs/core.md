# Iconify Icon Finder: Core

Icon Finder Core is doing all the heavy stuff. It takes route object, retrieves data from API, filters data and returns simple objects that can be displayed by UI without any additional steps.

Everything is asynchronous. Icon Finder Core uses events to react to requests.

Code is written in TypeScript to provide types for all data, so editors such as VSCode will give you types and object keys for data provided by core.

## How does it work

Creating instance:

-   You create [APICore instance](core/api-core.md) and provide a callback. That callback will be called whenever data changes.
-   You supply core with a route. If a route is not supplied, Icon Finder Core will navigate to collections list.
-   Icon Finder Core sends requests to API to retrieve data.
-   When data is available, Icon Finder Core parses that data, filters it according to route, converts everything to simple objects and calls callback you have provided when you were creating new APICore instance.
-   In callback you render data. See [render event callback](core/render.md).

To change something, for example, a page, you should do this:

-   Apply action, such as `action('pagination', 1)` to get second page of results.
-   Icon Finder Core will apply that change to the current route, retrieve data (if needed), filter data and call your callback with updated data.

## APICore and Registry

There are two ways to work with Icon Finder Core: using [APICore class](core/api-core.md) and using [Registry class](core/registry.md).

APICore class is accessed by importing APICore from package's main file:

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

Registry class gives full access to all internal stuff. You can also access it from APICore instance by calling method `getInternalRegistry()`.

To create Registry instance, import Registry class from `lib/registry` and create new instance:

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

For more examples of code, see [APICore class](core/api-core.md) or [Registry class](core/registry.md).

## Routes

Every request and response has a route associated with it. Route is a simple object describing the current view.

For description of routes see [core/routes.md](core/routes.md).

## Views

View is script's internal presentation of the route. For each route type, there is a view type.

View does all heavy lifting:

-   It takes route
-   Sends API request
-   Parses API response
-   Applies filters
-   Renders blocks
-   Handles all actions

Views are not supposed to be used by external scripts. They are mentioned here to make it easier to understand how Icon Finder Core works.

## Blocks

When your callback is called, it includes a list of blocks that UI should display.

Each block represents one set of data.

For description of all available blocks see [core/blocks.md](core/blocks.md).

## Actions

When a user clicks something in UI, UI should send action to Icon Finder Core.

For list of actions see [core/actions.md](core/actions.md).

## Types

Icon Finder Core is written in TypeScript. This has several major advantages:

-   You can easily look up properties for objects, parameters for callbacks.
-   When using a library written in TypeScript, editors such as VSCode will give you hints and autofill properties, making it much easier to use the library.
-   Easier to avoid bugs. While core does have unit tests, TypeScript provides an additional layer of code checking, reducing chances of bugs.

For description of types that are relevant to implementing UI, see [core/types.md](core/types.md).
