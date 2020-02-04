# Iconify Icon Finder Configuration

This directory contains configuration files.

All files are in JSON format.

Each file modifies some part of UI configuration.

## Options

Available options:

-   `language`: string. Language pack to use. For list of available files, see "../packages/ui/src/phrases". Value is the filename without ".ts" extension.
-   `custom-view`: boolean. If the value is "false", compiled bundle will not include support for custom views, slightly reducing bundle size.
-   `option`: object. Options object. Contains only options that you want to override. It includes both Icon Finder Core options and Icon Finder UI options.
-   `iconify`: object. Iconify configuration changes.

## License

Iconify Icon Finder is dual-licensed under Apache 2.0 and GPL 2.0 license. You may select, at your option, one of the above-listed licenses.

`SPDX-License-Identifier: Apache-2.0 OR GPL-2.0`

© 2020 Vjacheslav Trushkin
