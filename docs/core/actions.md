# Actions in Iconify Icon Finder

When rendering a view, you get a list of blocks ([see blocks.md](blocks.md)). Each block has an action associated with it. Action name matches the name of the block. Each block renders only 1 type of data.

Usually, when rendering any block, there is something for a user to edit or to click. For example, in pagination block, user can click a page, in search form user and enter a keyword. To forward that action to Icon Finder Core, UI should apply action to the current view.

To apply action to currently visible view, you need to run `action(blockName: string, value: unknown)` function of router. If you are using APICore instance, do this:

```js
const router = core.getRouter();
router.action('pagination', 2); // Changes page to 2. Usable in all views, except for collections list.
router.action('search', 'arrow'); // Searches for "arrow"
```

If you are using Registry instance, code is similar, except for way you get Router instance:

```js
const router = registry.router;
router.action('collections', 'mdi'); // Click Material Design Icons in collections list. Usable in all views (though block type is different in different views, action is the same).
router.action('parent', 1); // Navigates to parent view (value is number of views to change)
```

As you can see from the code above, applying action is simple. To reset value, for an example if you want to clear search form in a collection view, run action with empty value:

```js
router.action('filter', ''); // Reset filter. All views, except for search results, have this action.
router.action('tags', null); // Reset tags. Value can also be key of currently selected tag:
```

### Instant or delayed actions

Almost all actions are instant. They work by applying filters to data that is already available in the view, such as applying tags filter, changing page or filtering collections list. Therefore UI can and should run such action immediately when the value of input changes.

Some actions are delayed. They require retrieving data from API, which can take anything from a few milliseconds to a few seconds, depending on the user's internet connection. Examples are global search, navigating to a collection. When applying such action from an input (such as global search form), UI should not run those actions immediately on the "keyup" event, instead, UI should wait for a user to click "Search" button. UI should also throttle those actions, not allowing a user to click it more than once every few seconds to prevent flooding API with requests.

List of delayed actions:

-   `search` - (all views) global search. This action creates a child view with search results. Search is done on API, so this action is not instant.
-   `collections` - (collections list view) click on collection. This action creates a child collection view. It retrieves icon set from API, so this action is not instant.

Below is the list of actions that are specific to view, followed by the list of actions available to all views.

## Actions for collections list

### categories

Block type: `filters`, TypeScript type: `FiltersBlock`, block.filterType = "categories" ([see blocks.md](blocks.md#filters)).

This block displays the list of categories as buttons, making it easy to filter icons by category.

```js
// Show only "General" category
router.action('categories', 'General');

// Reset
router.action('categories', null);
```

### collections

Block type: `collections-list`, TypeScript type: `CollectionsListBlock` ([see blocks.md](blocks.md#collections-list)).

This block displays the list of icon sets. When a user clicks any icon set, UI should send action with icon set prefix as value.

```js
// Navigate to Noto Emoji
router.action('collections', 'noto');

// Navigate to IonIcons
router.action('collections', 'ion');
```

This action has no reset function because it creates a child view. To return to icon sets list, use action 'parent' on collection view.

### filter

Block type: `collections-filter`, TypeScript type: `CollectionsFilterBlock` ([see blocks.md](blocks.md#collections-filter)).

This block displays search form that filters collections list.

```js
// Search for icon sets that contain "awesome" (case insensitive)
router.action('filter', 'awesome');

// Reset filter
router.action('filter', '');

// Search for icon sets that contain "24".
// Search checks not just icon set titles, but also other attributes,
// including grid, so it will return all icon sets that have 24x24 icons.
router.action('filter', '24');
```

## Actions in collection view

### collections

Block type: `filters`, TypeScript type: `FiltersBlock`, block.filterType = "collections" ([see blocks.md](blocks.md#filters)).

This is a special block, which does not belong to a collection view.

When a collection view is a child view of search results, this block is copied from the search results view. Search results include collections block, which lists collections where requested icons are found, making it easy to filter results by collection. Collection view displays duplicate block, so a user does not have to return to search results, making it easy to switch collections.

When collection view is a child of collections list, this block shows several previous and next collections. This makes it easy to navigate icon sets without returning to the parent view. It takes into account filters used on the parent view.

```js
// Navigate back to parent view, then to Font Awesome Regular
router.action('collections', 'fa-regular');
```

This action is not instant and it changes the current view.

### filter

Block type: `search`, TypeScript type: `SearchBlock`, block.searchType = "collection" ([see blocks.md](blocks.md#search)).

This block searches all icons in the current collection. All icon names are already available when a collection is displayed, so this action is instant.

```js
// Search for "arrow"
router.action('filter', 'arrow');

// Reset filter
router.action('filter', '');
```

### pagination

Block type: `pagination`, TypeScript type: `PaginationBlock` ([see blocks.md](blocks.md#pagination)).

This block changes the current page. The first page has a value of 0. If you set number higher than maximum, the value will automatically be changed to the maximum page number.

```js
// Change page to 5
router.action('pagination', 5);

// Navigate to start
router.action('pagination', 0);
```

### tags

Block type: `filters`, TypeScript type: `FiltersBlock`, block.filterType = "tags" ([see blocks.md](blocks.md#filters)).

This block displays a list of tags (or categories) as buttons, making it easy to filter icons by tag. Only one tag can be selected.

```js
// Show only "Accessibility" category
router.action('tags', 'Accessibility');

// Reset
router.action('tags', null);
```

### themePrefixes

Block type: `filters`, TypeScript type: `FiltersBlock`, block.filterType = "themePrefixes" ([see blocks.md](blocks.md#filters)).

This block displays a list of theme prefixes as buttons, making it easy to filter icons by theme. Only one theme prefix can be selected.

```js
// Show only "Baseline" prefix
router.action('themePrefixes', 'Baseline');

// Reset
router.action('themePrefixes', null);
```

### themeSuffixes

Block type: `filters`, TypeScript type: `FiltersBlock`, block.filterType = "themeSuffixes" ([see blocks.md](blocks.md#filters)).

This block displays a list of theme suffixes as buttons, making it easy to filter icons by theme. Only one theme suffix can be selected.

```js
// Show only "TwoTone" prefix
router.action('themeSuffixes', 'TwoTone');

// Reset
router.action('themeSuffixes', null);
```

## Actions in search results

### collections

Block type: `filters`, TypeScript type: `FiltersBlock`, block.filterType = "collections" ([see blocks.md](blocks.md#filters)).

Search results include collections block, which lists collections where requested icons are found, making it easy to filter results by collection.

```js
// Navigate to Font Awesome Regular
router.action('collections', 'fa-regular');
```

This action is not instant and it changes the current view.

### pagination

Block type: `pagination`, TypeScript type: `PaginationBlock` ([see blocks.md](blocks.md#pagination)).

This block changes the current page. The first page has a value of 0. If you set number higher than maximum, the value will automatically be changed to the maximum page number.

```js
// Change page to 5
router.action('pagination', 5);

// Navigate to start
router.action('pagination', 0);
```

## Actions in custom view

### filter

Block type: `search`, TypeScript type: `SearchBlock`, block.searchType = "custom" ([see blocks.md](blocks.md#search)).

This block searches icons in a custom view. All icon names are already available when a custom view is displayed, so this action is instant.

```js
// Search for "arrow"
router.action('filter', 'arrow');

// Reset filter
router.action('filter', '');
```

### pagination

Block type: `pagination`, TypeScript type: `PaginationBlock` ([see blocks.md](blocks.md#pagination)).

This block changes the current page. The first page has a value of 0. If you set number higher than maximum, the value will automatically be changed to the maximum page number.

```js
// Change page to 5
router.action('pagination', 5);

// Navigate to start
router.action('pagination', 0);
```

### set

Block type: none. This action has no block associated with it.

This action changes the icons list. Value is an array of new icons. Each array entry can be [`Icon` object](types.md#icon) or string.

```js
router.action('set', [
	'ant-design:home-filled',
	'ant-design:home-outlined',
	'ant-design:home-twotone',
	'bx:bx-home',
	'bx:bx-home-alt',
	'bx:bx-home-circle',
	'bx:bx-home-heart',
	'bx:bxs-home',
	'bx:bxs-home-circle',
	'bx:bxs-home-heart',
	'bytesize:home',
	'dashicons:admin-home',
	'el:home',
	'el:home-alt',
	'el:iphone-home',
	'entypo:home',
	'fa-solid:home',
	'fe:home',
	'feather:home',
	'flat-color-icons:home',
	'foundation:home',
	'ic:baseline-add-to-home-screen',
	'ic:baseline-home',
	'ic:baseline-home-work',
	'ic:outline-add-to-home-screen',
	'ic:outline-home',
	'ic:outline-home-work',
	'ic:round-add-to-home-screen',
	'ic:round-home',
	'ic:round-home-work',
	'ic:sharp-add-to-home-screen',
	'ic:sharp-home',
	'ic:sharp-home-work',
	'ic:twotone-add-to-home-screen',
	'ic:twotone-home',
	'ic:twotone-home-work',
	// ...
]);
```

See [custom-view.md](custom-view.md).

## Actions for all views

### parent

Block type: none. Parent views list is not in blocks, ([see blocks.md](blocks.md#parent-views)).

```js
// Navigate to parent view (1 level up)
router.action('parent', 1);

// Navigate to parent's parent view (2 levels up)
router.action('parent', 2);
```

### search

Block type: none. Global search is not in blocks, ([see blocks.md](blocks.md#search-form)).

```js
// Search for "home"
router.action('search', 'home');
```

The router will automatically figure out if search action needs to create child view or if it needs to navigate to parent view before searching, so this action can be used in all views.
