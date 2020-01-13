# Iconify Icon Finder: Core

Core package is doing all the heavy stuff. It takes route object, retrieves data from API, filters data and returns simple objects that can be displayed by UI without any additional steps.

Everything is asynchronous. Package uses events to react to requests.

Script is written in TypeScript to provide types for all data, so editors such as VSCode will give you types and object keys for data provided by core.

## How does it work

Creating instance:

-   You create core instance and provide callback. That callback will be called whenever data changes.
-   You supply core with route or tell it to navigate to home page.
-   Core sends requests to API to retrieve data.
-   When data is available, core parses that data, filters it according to route, converts everything to simple objects and calls callback.
-   In callback you render data.

To change something, for example a page, you should do this:

-   Apply action, such as `action('pagination', 1)` to get second page of results.
-   Core will apply that change to current route, retrieve data (if needed), filter data and call callback with udpated data.

## Route

Every request and response has a route associated with it. Route is a simple object describing current view.

For example, this route represents collections list:

```json
{
	"type": "collections"
}
```

Each route can have parameters object, which is optional.

For example, this route represents displaying second page (pages start with 0) of collection "mdi":

```json
{
	"type": "collection",
	"params": {
		"prefix": "mdi",
		"page": 1
	}
}
```

In this example route represents searching collection "mdi" for icons that contain "arrow" and are part of "Account / User" category:

```json
{
	"type": "collection",
	"params": {
		"prefix": "mdi",
		"filter": "arrow",
		"tag": "Account / User"
	}
}
```

Each route can have parent route. For example this is what route looks like if you browsed collections list, then searched for "home", then from search results selected "ant-design" collection to show only icons that belong to that collection:

```json
{
	"type": "collection",
	"params": {
		"prefix": "ant-design",
		"filter": "home"
	},
	"parent": {
		"type": "search",
		"params": {
			"keyword": "home"
		},
		"parent": {
			"type": "collections"
		}
	}
}
```

### Route types

There are 4 types of routes. Almost all of them have required parameters:

-   collections: Shows list of collections. No required parameters.
-   collection: Shows one collection. Required parameter: "prefix" that matches collection prefix.
-   search: Shows search results. Required parameter: "keyword" that contains phrase to search for. Search is case insensitive.
-   custom: Shows custom icons list (more about custom views below). Required parameter: "customType".

## Views

View is script's internal presentation of route. For each route type there is a view type.

View does all heavy lifting:

-   It takes route
-   Sends API request
-   Parses API response
-   Applies filters
-   Renders blocks
-   Handles all actions

Views are not supposed to be used by external scripts. They are mentioned here to make it easier to understand how core works.

## Blocks

When rendering view, it generates list of blocks. Each block represents one set of data.

Each block has a corresponding type, making it easy to use with TypeScript.

To check if block is empty use function appropriate for that block, for example like this:

```js
if (!isIconsBlockEmpty(blocks.icons)) {
	// Render icons block
}
```

All types and functions can be imported from main file or from `lib/blocks/{block-type}.js`

There are several types of blocks:

### Collection info

Type: `CollectionInfoBlock`
Empty test: `isCollectionInfoBlockEmpty`

This block shows information about current icon set. It is available only in collection view.

Example of collections list data:

```json
{
	"prefix": "fa-regular",
	"info": {
		"prefix": "fa-regular",
		"name": "Font Awesome 5 Regular",
		"total": 151,
		"version": "5.12.0",
		"author": {
			"name": "Dave Gandy",
			"url": "http://fontawesome.io/"
		},
		"license": {
			"title": "CC BY 4.0",
			"spdx": "",
			"url": "https://creativecommons.org/licenses/by/4.0/"
		},
		"samples": ["bell", "comment", "hand-point-left"],
		"category": "General",
		"palette": false,
		"height": 32,
		"displayHeight": 16
	}
}
```

"prefix" is always available, but "info" object might not be available if API did not include information in response.

Information properties:

-   name: Icon set name
-   total: Number of icons
-   version: current version number.
-   author: information about author.
-   license: information about license.
-   samples: list of icons to display in collections list. Array of strings, up to 3 entries.
-   category: category in collections list.
-   palette: true if icons in set have predefined palette (such as emojis), false if icons use currentColor.
-   height: height of icons: number or array of numbers.
-   displayHeight: height for displaying samples, a number between 16 and 24.

Most properties, except for "name" and "total" could be empty or missing.

### Collections filter

Type: `CollectionsFilterBlock`
Empty test: `isCollectionsFilterBlockEmpty`

This is a special block used only in collections list. It displays search form.

Value is a simple object with only one key: "search".

Example:

```json
{
	"search": ""
}
```

### Collections list

Type: `CollectionsListBlock`
Empty test: `isCollectionsBlockEmpty`

This block represents collections list, used only in collections list. It is one of biggest blocks.

Example:

```json
{
	"showCategories": true,
	"collections": {
		"General": {
			"mdi": {
				"prefix": "mdi",
				"name": "Material Design Icons",
				"total": 4882,
				"version": "",
				"author": {
					"name": "Austin Andrews",
					"url": "https://github.com/Templarian/MaterialDesign"
				},
				"license": {
					"title": "Open Font License",
					"spdx": "",
					"url": "https://raw.githubusercontent.com/Templarian/MaterialDesign/master/LICENSE"
				},
				"samples": [
					"account-check",
					"bell-alert-outline",
					"calendar-edit"
				],
				"category": "General",
				"palette": false,
				"height": 24,
				"displayHeight": 24,
				"index": 0
			},
			"mdi-light": {
				"prefix": "mdi-light",
				"name": "Material Design Light",
				"total": 267,
				"version": "",
				"author": {
					"name": "Austin Andrews",
					"url": "https://github.com/Templarian/MaterialDesignLight"
				},
				"license": {
					"title": "Open Font License",
					"spdx": "",
					"url": "https://raw.githubusercontent.com/Templarian/MaterialDesignLight/master/LICENSE.md"
				},
				"samples": ["cart", "home", "login"],
				"category": "General",
				"palette": false,
				"height": 24,
				"displayHeight": 24,
				"index": 1
			},
			"ic": {
				"prefix": "ic",
				"name": "Google Material Icons",
				"total": 5680,
				"version": "",
				"author": {
					"name": "Material Design Authors",
					"url": "https://github.com/cyberalien/google-material-design-icons-updated"
				},
				"license": {
					"title": "Apache 2.0",
					"spdx": "",
					"url": "https://github.com/cyberalien/google-material-design-icons-updated/blob/master/LICENSE"
				},
				"samples": [
					"baseline-notifications-active",
					"outline-person-outline",
					"twotone-videocam-off"
				],
				"category": "General",
				"palette": false,
				"height": 24,
				"displayHeight": 24,
				"index": 2
			}
		},
		"Emoji": {
			"noto": {
				"prefix": "noto",
				"name": "Noto Emoji",
				"total": 2807,
				"version": "",
				"author": {
					"name": "Google Inc",
					"url": "https://github.com/googlei18n/noto-emoji"
				},
				"license": {
					"title": "Apache 2.0",
					"spdx": "",
					"url": "https://github.com/googlei18n/noto-emoji/blob/master/LICENSE"
				},
				"samples": [
					"beaming-face-with-smiling-eyes",
					"computer-mouse",
					"dove"
				],
				"category": "Emoji",
				"palette": true,
				"height": 16,
				"displayHeight": 16,
				"index": 46
			}
		}
	}
}
```

This blocks has 2 properties:

-   showCategories: boolean attribute. If false, UI should not show categories.
-   collections: list of collections. Each entry is object, where key is category title, value is another object, where key is prefix, value is collection information block (see collection info block description).

Helper functions that can be imported from `lib/blocks/collections.js`:

`getCollectionsBlockCategories(block): string[]` - retrieves list of categories as array of strings.

```js
const categories = getCollectionsBlockCategories(blocks.collections);
categories.forEach(category => {
	// do something with category:
	const categoryItems = blocks.collections.collections[category];
	// do something with list of items
});
```

`getCollectionsBlockPrefixes(block): string[]` - retrieves list of collection prefixes as array of strings.

```js
const prefixes = getCollectionsBlockPrefixes(blocks.collections);
if (prefixes.indexOf('mdi') !== -1) {
	console.log('Found Material Design Icons!');
}
```

`iterateCollectionsBlock(block, callback)` - iterate all collections. Similar to Array.forEach, but for collections.

```js
iterateCollectionsBlock(blocks.collections, (info, prefix, category) => {
	// info is CollectionInfo object, same as in 'info' property in collection info block (see above)
	console.log(
		`Found collection ${info.name} with prefix ${prefix} in category ${category}!`
	);
});
```

### Filters

Type: `FiltersBlock`
Empty test: `isFiltersBlockEmpty`

This block is used in almost all views. This block represents list of filters, such as categories (collections list, collection view), themes (collection view), collections (search view).

Example:

```json
{
	"type": "tags",
	"active": null,
	"filters": {
		"Accessibility": {
			"title": "Accessibility",
			"index": 0,
			"disabled": false
		},
		"Alert": {
			"title": "Alert",
			"index": 1,
			"disabled": false
		},
		"Arrows": {
			"title": "Arrows",
			"index": 2,
			"disabled": false
		},
		"Audio & Video": {
			"title": "Audio & Video",
			"index": 3,
			"disabled": false
		},
		"Vehicles": {
			"title": "Vehicles",
			"index": 50,
			"disabled": false
		},
		"Weather": {
			"title": "Weather",
			"index": 51,
			"disabled": false
		},
		"Writing": {
			"title": "Writing",
			"index": 52,
			"disabled": false
		}
	}
}
```

Block has following properties:

-   type: Type of filter, string:
    -   In collections list: "categories" (list of categories)
    -   In collection view: "tags", "themePrefixes", "themeSuffixes"
    -   In search view: "collections" (list of collections)
-   active: Currently active filter. Null if none or filter key.
-   filters: List of available filters. Filter key is used to uniquely identify filter. Value is an object:
    -   title: Filter title, should be used by UI instead of key, though they usually match, except for collections list filter in search results.
    -   index: Filter index. If filters have color rotation, index should be used to set color.
    -   disabled: True if filter is disabled. Filter is disabled when for example user is searching icons in icon set, filter represents a tag and applying that tag would return 0 results.

In example above there are 53 filters (most were removed to reduce sample size). Usually there aren't that many filters, that is an extreme case. UI must make sure all filters are visible, but they don't most important content, which is icons list, hidden below filters, so ideally UI should have max-height and overflow scrolling for filters block.

### Icons list

Type: `IconsListBlock`
Empty test: `isIconsListBlockEmpty`

Icons list is a simple block that shows icons. Only icons displayed on current page are shown (see pagination block).

Example:

```json
{
	"icons": [
		{
			"prefix": "uil",
			"name": "0-plus",
			"tags": ["User Interface"]
		},
		{
			"prefix": "uil",
			"name": "10-plus",
			"tags": ["User Interface"]
		},
		{
			"prefix": "uil",
			"name": "android",
			"tags": ["Brand Logos"]
		},
		{
			"prefix": "uil",
			"name": "android-alt",
			"tags": ["Brand Logos"]
		},
		{
			"prefix": "uil",
			"name": "android-phone-slash",
			"tags": ["User Interface"]
		},
		{
			"prefix": "uil",
			"name": "angle-double-down",
			"tags": ["Arrows"]
		}
	]
}
```

This block has only one property: icons, which is an array of `ExtendedIcon` objects.

Each icon must have prefix and name attributes. Other attributes are optional.

To convert, validate and compare icons there are several helper functions you can import from main file or from `lib/icon.js`:

`iconToString(icon: Icon | ExtendedIcon): string` - converts icon to string

```js
const icon: Icon = {
	prefix: 'mdi',
	name: 'home',
};
const name = iconToString(icon);
console.log(name); // "mdi:home"
```

`validateIcon(icon): boolean` - checks if icon is valid.

All icons in block are valid, but you can use it to compare with custom icons. Also helpful function is:

`stringToIcon(icon: string): Icon` - converts string to icon. Returns null on failure

```js
const icon1 = stringToIcon('mdi:home');
const icon2 = stringToIcon('mdi-home');
if (compareIcons(icon1, icon2)) {
	console.log(
		'mdi:home and mdi-home are identical (which they are because if prefix does not have "-", ":" can be replaced by "-")!'
	);
}
```

`compareIcons(icon1, icon2): boolean` - compares icons. Returns true if icons are valid and identical, false if not. See code example above.

### Pagination

Type: `PaginationBlock`
Empty test: `isPaginationEmpty`

Pagination block that is used in all views where icons list is shown, so that's every view except for collections list.

Example:

```json
{
	"page": 2,
	"length": 1114,
	"perPage": 52,
	"more": false
}
```

This block has several properties:

-   page: Current page. First page is 0.
-   length: Total number of icons. This is not number of pages.
-   perPage: Number of icons to display per page. This value is taken from configuration. See section about configuration.
-   more: boolean. This is used on search view. See below.

To help with displaying pagination, there are several helper functions:

`maxPage(block): number` - returns maximum page number. This is not total number of pages! Total number of pages is `maxPage(block) + 1`

```js
let newPage = Math.min(5, maxPage(block);
core.action('pagination', newPage);
```

In actual code you do not need to check for maximum page because core will automatically do that check. Code is shown only as example.

`showPagination(block): number[]` - return list of pages to show in pagination.

```jsx
const pages = showPagination(props.blocks.pagination);
if (pages.length) {
	let nodes = [];
	let nextPage = 0;
	pages.forEach(page => {
		if (page > nextPage) {
			// previous page != page -1, so add some dots
			nodes.push(<span key={nextPage}>...</span>);
		}
		nextPage = page + 1;

		nodes.push(
			<a
				key={page}
				href="# "
				onClick={event => {
					event.preventDefault();
					core.action('page', page);
				}}
			>
				{page + 1}
			</a>
		);
	});

	return <div>{nodes}</div>;
}
return null;
```

#### More pages

By default core will retrieve only first 2 pages of results from API. This is done to reduce load on API because often visitors don't look further than first page.

If `more` attribute in pagination block is set to `true`, UI should show either third page in pagination or button with text like "Load more results".

Clicking that button should trigger pagination action with value set to 2 (third page as number) or "more" (as string):

```js
core.action('pagination', 2);
```

See actions below.

### Search

Type: `SearchBlock`
Empty test: `isSearchBlockEmpty`

This block displays search form for icons.

Value is an object with several properties:

-   keyword: search keyword
-   type: type of search form
-   title: title

Combination of type and title are used to display placeholder, hint or button. Example combinations:

-   type = 'collection', title = 'Font Awesome 5' -> placeholder you can generate = "Filter Font Awesome 5 icons..."
-   type = 'custom', title = 'recent' -> placeholder you can generate = "Filter recent icons list..."

There are several values for `type`:

-   'all' - search all icons. Attribute `title` is not used.
-   'collection' - search collection. Attribute `title` contains collection name (or prefix if name is not available).
-   'custom' - search custom view. Attribute `title` contains view type. See "custom view" below.

Example:

```json
{
	"keyword": "arrow",
	"type": "collection",
	"title": "Material Design Icons"
}
```

## Actions

When user in UI clicks something, UI should send action to core.

## Types

### Icon and ExtendedIcon

`Icon` object has only 2 mandatory properties: prefix and name.

.... TODO
