# Types in Iconify Icon Finder Core

Iconify Icon Finder Core is written in TypeScript. This has several major advantages:

-   You can easily look up properties for objects, parameters for callbacks.
-   When using a library written in TypeScript, editors such as VSCode will give you hints and autofill properties, making it much easier to use that library.
-   Easier to avoid bugs. While core does have unit tests, TypeScript provides an additional layer of code checking, reducing the chance of bugs.

## Icon

Each icon is represented by the `Icon` type.

Required properties:

-   `prefix`: string. Icon prefix.
-   `name`: string. Icon name.

Other properties that represent icon metadata and are used only when displaying the collection:

-   `tags`: string[]. List of tags. In many icon sets tags (or categories) are used to categorise icons.
-   `aliases`: string[]. List of aliases. Some icons have several names, for example, "home" and "house".
-   `chars`: string[]. List of characters. This is used when an icon is imported from icon font or has metadata for exporting an icon set to a font. An icon can have multiple characters, so this attribute is an array. Values are hexadecimal strings, such as "f000".
-   `themePrefix`: string. Theme prefix.
-   `themeSuffix`: string. Theme suffix. Prefix and suffix are used in some icon sets to create variations of the same icon, such as "-solid" and "-outline". Value contains the title of prefix/suffix used to display prefix/suffix filter, such as "Outline".

To validate and compare icons, following functions are available:

-   `validateIcon(icon: Icon | null): boolean` - returns true if icon is valid, false if invalid.
-   `compareIcons(icon1: Icon | null, icon2: Icon : null): boolean` - returns true if both icons are valid and identical. This function does not take into account meta data.

To convert icon from/to string, follwing functions are available:

-   `iconToString(icon: Icon): string` - return string representation of icon, such as "fa-solid:home".
-   `stringToIcon(icon: string): Icon | null` - returns Icon object, null if it fails to convert.

## Route

Route is represented by several types:

-   `CollectionsRoute` - collections list route (browsing all icon sets).
-   `CollectionRoute` - collection view route (browsing one icon set).
-   `SearchRoute` - search results.
-   `CustomRoute` - custom icons list.

There are generic types that represent any route:

-   `Route` - any route mentioned above.
-   `PartialRoute` - Route with all parameters being optional.

When rendering UI, Icon Finder Core provides data as `PartialRoute`, so route parameters include only properties that are different from default and include parent route only if the parent route exists.

For more information about routes, see [routes.md](routes.md).

## CollectionInfo

This type is used to show information about an icon set.

This type extends type `IconifyInfo` from [@iconify/types](https://github.com/iconify/types) package.

In addition to `IconifyInfo` attributes, `CollectionInfo` has following attributes:

-   `prefix`: string. Value is an icon set prefix.
-   `index`: number. Optional index. If in UI the icon sets list uses colour rotation, icon set's index should be used to set UI colour.

## RouterEvent

RouterEvent object contains data needed to update UI. It is used in event "render" and APICore callback.

See [render.md](render.md)
