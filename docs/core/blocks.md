# Blocks in Iconify Icon Finder

When rendering a view, it generates blocks that should be displayed by UI. Each block represents one set of data.

For example, when browsing the collections list, UI needs to render the following blocks:

-   `filter`: CollectionsFilterBlock. This block represents the search field to filter collections.
-   `categories`: FiltersBlock. This block represents the categories filters.
-   `collections`: CollectionsListBlock. This block represents the collections list.

Each block has a corresponding type, making it easy to use with TypeScript. To easily identify any block, each block has property `type`.

To check if block is empty use function `isBlockEmpty(block: Block): boolean` that works with all block types:

```js
if (!isBlockEmpty(blocks.icons)) {
	// Render icons block
}
```

All types can be imported from the main file or from `lib/blocks/{block-type}.js` and `lib/blocks/types.js`

`isBlockEmpty` can be imported from the main file or `lib/blocks/types.js`

There are several types of blocks:

## Collection info

Type: `CollectionInfoBlock`
block.type = "collection-info"

This block shows information about icons set. It is available only in a collection view.

Example of collections list data:

```json
{
	"type": "collection-info",
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

-   `name`: Icon set name
-   `total`: Number of icons
-   `version`: icon set version number.
-   `author`: information about icon set author.
-   `license`: information about icon set license.
-   `samples`: list of icons to display in the collections list. Value is an array of strings, up to 3 entries.
-   `category`: category in the collections list.
-   `palette`: true if icons in icon set have predefined palette (such as emojis), false if icons use currentColor.
-   `height`: height of icons: number or array of numbers.
-   `displayHeight`: height for displaying samples, a number between 16 and 24.

Most properties, except for "name" and "total" could be empty or missing.

For more details about CollectionInfo type, see [types.md](types.md#collectioninfo).

## Collections filter

Type: `CollectionsFilterBlock`
block.type = "collections-filter"

This is a special block used only in the collections list. It displays the search form.

Value is a simple object with only one property: "search".

Example:

```json
{
	"type": "collections-filter",
	"search": "arrow"
}
```

## Collections list

Type: `CollectionsListBlock`
block.type = "collections-list"

This block represents collections list, used only in the collections list view. It is one of the biggest blocks.

Example:

```json
{
	"type": "collections-list",
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

This block has 2 properties:

-   `showCategories`: boolean attribute. If false, UI should not show categories.
-   `collections`: list of collections. Each entry is an object, where the key is category title, value is another object, where the key is the prefix, value is collection information block: CollectionInfo.

For more details about CollectionInfo type, see [types.md](types.md#collectioninfo).

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

## Filters

Type: `FiltersBlock`
block.type = "filters"

This block is used in almost all views. This block represents a list of filters, such as categories (collections list, collection view), themes (collection view), collections (search view).

Example:

```json
{
	"type": "filters",
	"filterType": "tags",
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

Block has the following properties:

-   `filterType`: Type of filter, string:
    -   In collections list: "categories" (list of categories)
    -   In collection view: "tags", "themePrefixes", "themeSuffixes"
    -   In search view: "collections" (list of collections)
-   `active`: Currently active filter. Null if none or filter key.
-   `filters`: List of available filters. Filter key is used to uniquely identify filter. Value is an object:
    -   `title`: Filter title, should be used by UI instead of filter key, though they usually match, except for collections list filter in search results.
    -   `index`: Filter index. If filters have colour rotation, its index should be used to set UI colour.
    -   `disabled`: True if a filter is disabled. A filter is disabled when, for example, a user is searching icons in icon set, filter represents a tag and applying that tag would return 0 results.

In an example above there are 53 filters (most were removed to reduce sample size). Usually, there aren't that many filters, that is an extreme case. UI must make sure all filters are visible, but they don't most important content, which is icons list, hidden below filters, so ideally UI should have max-height and overflow scrolling for filters block.

## Icons list

Type: `IconsListBlock`
block.type = "icons-list"

Icons list is a simple block that shows icons. Only icons displayed on the current page are included (see pagination block).

Example:

```json
{
	"type": "icons-list",
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

This block has only one property: icons, which is an array of `Icon` objects.

Each icon must have prefix and name attributes. Other attributes are optional.

To convert, validate and compare icons there are several helper functions you can import from the main file or `lib/icon.js`:

`iconToString(icon: Icon): string` - converts icon to string

```js
const icon: Icon = {
	prefix: 'mdi',
	name: 'home',
};
const name = iconToString(icon);
console.log(name); // "mdi:home"
```

`validateIcon(icon): boolean` - checks if icon is valid.

All icons in the block are valid, but you can use it to compare with custom icons. Another helpful function is:

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

## Pagination

Type: `PaginationBlock`
block.type = "pagination"

Pagination block that is used in all views where icons list is shown, so that's every view except for collections list.

Example:

```json
{
	"type": "pagination",
	"page": 2,
	"length": 1114,
	"perPage": 52,
	"more": false
}
```

This block has several properties:

-   `page`: Current page. The first page is 0.
-   `length`: Total number of icons. This is not the number of pages.
-   `perPage`: Number of icons to display per page. This value is taken from Icon Finder configuration. See [config.md](config.md).
-   `more`: boolean. This is used in the search results. See below.

To help with displaying pagination, there are several helper functions:

`maxPage(block): number` - returns maximum page number. This is not the number of pages! Number of pages is `maxPage(block) + 1`. For example, you have 4 pages of icons. The first page is 0, the maximum page is maxPage() = 3, total number of pages is maxPage() + 1 = 4.

```js
let newPage = Math.min(5, maxPage(block);
core.action('pagination', newPage);
```

In actual code, you do not need to check for the maximum page because core will automatically do that check. Code is shown only as an example.

`showPagination(block): number[]` - return list of pages to show in pagination.

```jsx
const pagination = props.blocks.pagination;
if (!isBlockEmpty(pagination)) {
	const pages = showPagination(pagination);
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

### More pages

By default, Icon Finder will retrieve only first 2 pages of results from API. This is done to reduce the load on API because often visitors don't look further than the first page.

If `more` attribute in pagination block is set to `true`, UI should show either third page in pagination or button with text like "Load more results".

Clicking that button should trigger pagination action with value set to 2 (third page as number) or "more" (as string):

```js
core.action('pagination', 2);
```

For more information about actions, see [actions.md](actions.md)

## Search

Type: `SearchBlock`
block.type = "search"

This block displays the search form for icons.

Value is an object with several properties:

-   `keyword`: search keyword.
-   `searchType`: type of search form.
-   `title`: title.

Combination of `searchType` and `title` are used to display placeholder, hint or button. Example combinations:

-   searchType = 'collection', title = 'Font Awesome 5' -> placeholder you can generate = "Filter Font Awesome 5 icons..."
-   searchType = 'custom', title = 'recent' -> placeholder you can generate = "Filter recent icons list..."

There are several values for `searchType`:

-   "all" - search all icons. Attribute `title` is not used.
-   "collection" - search collection. Attribute `title` contains icon set name (or prefix, if the icon set name is not available).
-   "custom" - search custom view. Attribute `title` contains the view type. See [custom-view.md](custom-view.md).

Example:

```json
{
	"type": "search",
	"keyword": "arrow",
	"searchType": "collection",
	"title": "Material Design Icons"
}
```

# Missing blocks

2 more blocks are not rendered by any view, but should be displayed by UI:

-   Search form for searching all icons
-   Parent views

## Search form

Search form is present on all pages, so it should be treated as a separate form. UI can decide if a search form should be shown.

All previous search blocks (collections filter, search), are for searching content of the current view. They do not change the current view, so they belong to their views.

Global search form though does not belong to any view, therefore it is not part of any view. UI should not rely on the current view to render search form.

### Keyword

How to get the current keyword to a global search form?

UI should follow this logic:

-   By default set keyword to empty.
-   If the current view is changed to "search" ((see `viewChanged` and route properties of render callback)[render.md]), copy keyword from route parameters to search form.
-   When search form is submitted, run action "search" on the current view. All views can handle that action.

## Parent views

Parent views tree is also not part of the current view because it is not needed.

When rendering the current view, you have access to the route object. You can use it to render parent views. See [routes.md](routes.md).

### Rendering collection in parent views

When you are parsing parent routes and stumble upon collection route, all you have for that route is icon set prefix.

For UI you want to display icons set name instead of prefix. How to do that?

If you are using [APICore instance](api-core.md), it is simple: it has method `getCollection(prefix): CollectionInfo | null`. It will return null if information about icons set is not available, CollectionInfo object if the requested information is available:

```js
// Assumes following variables:
//	prefix = icon set prefix,
//	core = APICore instance.
const info = core.getCollection(prefix);
const title = info === null ? prefix : info.name;
```

Variable "core" is available in the callback you set when creating new APICore instance.

What if you are not using [APICore class](api-core.md)? Then you must be using [Registry](registry.md) class. To retrieve icons set information from Registry instance, you can do this:

```js
// Assumes following variables:
//	prefix = icon set prefix,
//	registry = Registry class instance.
const collections = registry.collections;
const info = collections.get(prefix);
const title = info === null ? prefix : info.name;
```

For details about CollectionInfo type, see [types.md](types.md#collectioninfo).
