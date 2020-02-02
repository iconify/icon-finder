# Iconify Icon Finder Core

Iconify Search is a script for browsing icons available on Iconify API.

This module is core. It is designed to work in both node.js and browser. It does not provide UI, UI should be built based on this module.

## Building

To build any theme, first you need to install dependencies: `npm install`.

Then to build all themes, run `npm run build`

To built any specific theme, for example "figma", run `npm run build figma` (replace theme name).

## Automatically re-building

To automatically rebuild files as you save them, run `npm run watch`.

You can add theme name as extra parameter to rebuild only your theme, for example `npm run watch figma`.

## Themes hierarchy

Themes are not standalone. Most themes have parent theme, which might have its own parent theme and so on.

What's the point of theme hierarchy? It allows you to modify themes without maintaining all files. Simply create new theme, set original theme as parent and copy only files that you want to modify.

Because of hierarchy, you should not use external SASS compilers. Use build script instead.

## License

Iconify Icon Finder is dual-licensed under Apache 2.0 and GPL 2.0 license. You may select, at your option, one of the above-listed licenses.

`SPDX-License-Identifier: Apache-2.0 OR GPL-2.0`

© 2020 Vjacheslav Trushkin
