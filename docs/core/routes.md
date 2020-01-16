# Routes in Iconify Icon Finder

Every request and response has a route associated with it. The route is a simple object of type `PartialRoute` describing the current view.

For example, this route represents collections list:

```json
{
	"type": "collections"
}
```

Each route can have parameters object, which is optional for icon sets list but is required for other route types.

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

In this example route represents searching collection "mdi" for icons that contain "arrow" and are part of the "Account / User" category:

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

Each route can have a parent route. For example, this is what route looks like if you browsed collections list, then searched for "home", then from search results selected "ant-design" collection to show only icons that belong to that collection:

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

## Types

There are 4 types of routes. Almost all of them have required parameters:

-   `collections`: Shows list of collections. No required parameters.
-   `collection`: Shows one collection. Required parameter: "prefix" that matches icon set prefix.
-   `search`: Shows search results. Required parameter: "keyword" that contains a phrase to search for. Search is case insensitive.
-   `custom`: Shows custom icons list (more about custom views below). Required parameter: "customType".

### Collections

Collections list route is represented by type `CollectionsRoute` and has the following optional parameters:

-   `filter`: string. Used for searching collections list. The default value is an empty string "".
-   `category`: string | null. Used to show icon sets only from one category. The default value is null.

### Collection

Collection route is represented by type `CollectionRoute` and has one required parameter:

-   `prefix`: string. Icon set prefix.

and following optional parameters:

-   `filter`: string. Keyword to filter icons. The default value is an empty string "".
-   `page`: number. Current page number. The default value is 0.
-   `tag`: string | null. Tag filter. If not null, only icons that include tag will be shown. Value could be an empty string to show icons that do not have any tag. The default value is null.
-   `themePrefix`: string | null. Theme prefix. Value is a theme name, not an actual prefix. See "Prefixes and Suffixes" section below. The default value is null.
-   `themeSuffix`: string | null. Same as above, but for the suffix.

### Search

Search results route is represented by type `SearchRoute` and has one required parameter:

-   `search`: string. Search keyword. Value is case insensitive and cannot be empty.

and following optional parameters:

-   `page`: number. Current page number. The default value is 0.
-   `mode`: boolean. True if more results are available. The default value is true, unless page > 1.

By default, Icon Finder will retrieve only first 2 pages of results from API. This is done to reduce the load on API because often visitors don't look further than the first page. Additional results can be retrieved by changing the current page to 2 (or higher).

### Custom

Custom icons list route is represented by type `CustomRoute` and has one required parameter:

-   `customType`: string. Custom page type. Value is used to tell the difference between various custom icon lists. For example, value for recent icons list can be "recent", value for bookmarked icons can be "bookmarks".

and the following optional parameters:

-   `filter`: string. Keyword to filter icons. The default value is an empty string "".
-   `page`: number. Current page number. The default value is 0.

For more information about a custom view, see [custom-view.md](custom-view.md)

## Prefixes and suffixes

Collection route can have theme prefix and/or suffix.

Theme prefixes and suffixes have 2 components:

-   prefix (or suffix): Which is an actual value, that is part of icon name, such as "baseline-" or "-outline".
-   title, such as "Baseline" or "Outline". The title is the pretty version of the prefix/suffix.

In all filters in all routes, the title is used as a value, not prefix/suffix. So for example, if in an icon set there is a prefix with value "round-" and the title "Round", the route would have "Round" as prefix:

```json
{
	"type": "collection",
	"params": {
		"prefix": "ic",
		"themePrefix": "Round"
	}
}
```
