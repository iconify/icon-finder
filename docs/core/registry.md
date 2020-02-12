# Registry class in Iconify Icon Finder

## When to use Registry?

Registry class is more complex than APICore class. It is not as straight forward as APICore and requires reading documentation to understand how things work. So why would you want to use it? To access internal stuff directly, like events, configuration, and API.

## Creating Registry instance

To create Registry instance, you need to use import class `Registry` from `lib/registry` and initialise it:

```js
const { Registry } = require('@iconify/icon-finder-core/lib/registry');

const registry = new Registry();
```

## Namespace

Icon Finder Core is designed to share data between various instances. What data is shared?

-   API. This means if you run multiple instances, for each type of API query there is only one request. Why request data that has already been requested by another instance?
-   Configuration. This allows you to set configuration once, then create multiple instances.
-   Icon sets information. Since the API endpoint is the same, information about any icon set is the same, so why not share it between instances?

There are cases when you do not want to share information. Shared information is tied to a namespace. All you need to do is simply pass different namespace value to Registry constructor:

```js
const registry1 = new Registry('iconify');
const registry2 = new Registry('custom');
```

That's it. Those instances will no longer share information.

## Events

Icon Finder Core uses events to send messages across different parts. The event system is a very simple custom class that you can find in `src/events.ts`. It is a custom class because Core is designed to work in both Node.js and the browser and be as small as possible.

To get events instance from Registry instance, simply call `events` property:

```js
const events = registry.events;
const renderEventHandler = data => {
	// Render stuff
};

// Subscribe
events.subscribe('render', renderEventHandler);

// Unsubscrbe
events.unsubscribe('render', renderEventHandler);
```

You can have multiple subscribers for each event, so creating a new subscriber won't automatically unsubscribe the previous subscriber.

Each event has one parameter: payload. The type of payload depends on an event.

Available events:

-   `render`: Called when new data is available. The payload type is `RouterEvent`. See [render.md](render.md).
-   `load-*`: Called when loading icons for a custom view. The event name starts with "load-", followed by the custom view's `customType` property value. The payload is a callback to call when a custom icons list is available. See [custom-view.md](custom-view.md).

## Collections info

Icon Finder Core has storage for retrieved collections. It stores [`CollectionInfo` objects](types.md#collectioninfo).

To get that storage, use Registry's `collections` property:

```js
const collections = registry.collections;

// Get collection information
const info = collections.get('mdi'); // CollectionInfo | null

// Get collection title, returns prefix if title is not available
const title = collections.title('fa-regular'); // string

// Set custom data
collections.set('noto', {
	// ...
});
```

## API

The registry gives direct access to API class. API class is responsible for retrieving data from the Iconify API.

```js
const api = registry.api;
api.query(
	'/collection',
	{
		prefix: 'emojione',
	},
	(data, error, cached) => {
		// Data has been retrieved. Do something with it.
		if (data === null) {
			// 404 error message
			console.error('emojione does not exist');
			return;
		}

		// Do stuff
	}
);
```
