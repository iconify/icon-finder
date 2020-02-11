# Iconify Icon Finder Configuration

This directory contains configuration files.

All files are in JSON format.

Each file modifies parts of UI configuration.

## Options

Available options:

-   `language`: string. Language pack to use.
-   `custom-view`: boolean. If the value is "false", the compiled bundle will not include support for custom views, slightly reducing bundle size.
-   `options`: object. Options object. It contains only options that you want to override. It includes both Icon Finder Core options and Icon Finder UI options.
-   `iconify`: object. Iconify configuration changes.
-   `footer`: object. Options for Icon Finder footer: footer type, buttons.
-   `customisations`: object. Enables icon customisation, such as changing color, rotating, changing icon dimensions.

### Language

Value is the name of a language pack. The default value is "en".

For list of available files, see "packages/ui/src/phrases". Do not include ".ts" extension.

## Options

This object refers to configurable options.

## License

Iconify Icon Finder is dual-licensed under Apache 2.0 and GPL 2.0 license. You may select, at your option, one of the above-listed licenses.

`SPDX-License-Identifier: Apache-2.0 OR GPL-2.0`

© 2020 Vjacheslav Trushkin
