# Custom views in Iconify Icon Finder

The custom view is similar to the search results view, except that it uses custom source for icons list. You must set icons list when the view is being initialised. You can do that asynchronously, similar to querying API for search results.

The custom view is used for things like bookmarked icons, recent icons list.

## Creating a custom view

To create any view in Icon Finder, you need to change the route. This is a basic route for a custom view:

```json
{
	"type": "custom",
	"params": {
		"customType": "recent"
	}
}
```

See [routes.md](routes.md) for more information about routes.

## customType

In a custom view route, `customType` parameter is very important. It defines the type of custom view. It is used to tell the difference between various custom views.

Value can be any string, for example, "recent" for recent icons list or "bookmarks" for bookmarked icons.

## How to set icons

Setting icons is done by creating a callback (if you are using [APICore class](api-core.md)) or an event listener (if you are using [Registry class](registry.md)).

Example with APICore class:

```js
const { APICore } = require('@iconify/icon-finder-core');

const core = new APICore({
	// List of custom
	custom: {
		// Callback name matches "customType" attribute value.
		recent: callback => {
			// Load icons from somewhere, call callback.
			callback(['mdi-home']);
		},
		bookmarks: callback => {
			// It can be done asynchronously as well, for example if loading data from external resource
			setTimeout(() => {
				callback(['ic:baseline-home']);
			}, 100);
		},
	},
	// Other parameters here
	// ...
	callback: (data, core) => {
		// Main callback where all stuff happens
	},
});
```

If you are using Registry class, you need to use an event listener:

```js
const { createRegistry } = require('@iconify/icon-finder-core/lib/registry');

// Create registry, set event listeners to loading custom icons
const registry = createRegistry();
const events = registry.events;

// Event name starts with "load-", followed by "customType" value.
events.subscribe('load-recent', callback => {
	// Load icons from somewhere, call callback.
	callback(['mdi-home']);
});

events.subscribe('load-recent', callback => {
	// It can be done asynchronously as well, for example if loading data from external resource
	setTimeout(() => {
		callback(['ic:baseline-home']);
	}, 100);
});
```

## How to change icons

If you want to change icons list at any point after an initial callback, for example, if you add "Delete" button to the custom view in UI and user clicked that button, there are several ways to do it:

### "set" action

The easiest way is to use "set" action on a custom view.

See [actions.md](actions.md#set)

Action is always performed on currently visible view. So using "set" action requires the custom view to be visible when you use that action. Changing the icons list is most likely a result of a user action in UI, done while the custom view is rendered.

### Using router

You can also use Router instance's `setCustomIcons(customType: string, icons: IconsList)` method. Unlike "set" action, Router will first check if the currently visible view is a custom view with correct `customType`. If not, it will also check a pending view. A view can be pending if, for example, you have just changed route, but the new view hasn't loaded yet.

An example using [APICore class](api-core.md) instance:

```js
core.getRouter().setCustomIcons('recent', ['mdi:home']);
```

An example using [Registry class](registry.md) instance:

```js
const router = registry.router;
router.setCustomIcons('recent', ['mdi:home']);
```

## How to get full icons list

Icons are retrieved from UI using callback (or event), so UI should have access to original icons list for a custom view.

Because of that, you shouldn't need to get a list of icons. However, if for some reason you do need to do it, you can use router's `getCustomIcons(customType: string): Icon[] | null` function.

`getCustomIcons` function is similar to `setCustomIcons` function in examples above, but instead of taking icons list as an argument, it returns icons list. If a matching custom view is not found, the function returns null.

An example using [APICore class](api-core.md) instance:

```js
const icons = core.getRouter().getCustomIcons('bookmarks');
```

An example using [Registry class](registry.md) instance:

```js
const router = registry.router;
const icons = router.getCustomIcons('bookmarks');
```
