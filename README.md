# Iconify Icon Finder

Iconify icon finder is a package for searching and browsing icons. It uses Iconify API as a source, providing access to over 50,000 icons.

Icon finder repository has several packages:

## Core

Core is the main package. It does all searching and browsing, returns parsed and cleaned up API response as easy to use objects.

It is a separate package, making it easy to build custom UI around it.

See [docs/core.md](docs/core.md) for details.

## Themes

This package contains themes, which include stylesheets and icons used by UI. It is a separate package to make it easy to change the theme.

## UI

UI is an application built with Svelte that displays search results. It uses all packages that are listed above.

See [docs/ui.md](docs/ui.md) to understand how UI works and how to customise it.

See [docs/phrases.md](docs/phrases.md) if you want to translate UI.

## Build

This is a tool for building custom UI. It allows you to configure UI and make custom builds. You can set behaviour, configure custom sources for phrases, icons and stylesheet.

See [docs/build.md](docs/build.md) to understand how build process works.

# License

Iconify Icon Finder is dual-licensed under Apache 2.0 and GPL 2.0 license. You may select, at your option, one of the above-listed licenses.

`SPDX-License-Identifier: Apache-2.0 OR GPL-2.0`

© 2020 Vjacheslav Trushkin
