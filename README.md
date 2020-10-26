This package has been replaced by updated restructured package! New package uses Svelte with TypeScript, removes unnecessary clutter and makes build process much simpler.

See [master branch of Iconify Icon Finder repository](https://github.com/iconify/icon-finder) for details.

# Iconify Icon Finder

Iconify icon finder is a package for searching and browsing icons. It uses Iconify API as a source, providing access to over 70,000 icons.

Icon finder repository has several packages:

## Core

Core is the main package. It does all searching and browsing, returns parsed and cleaned up API response as easy to use objects.

It is a separate package, making it easy to build custom UI around it.

## Themes

This package contains themes, which include stylesheets and icons used by UI. It is a separate package to make it easy to change the theme.

## Components

Components package contains Svelte components that are used to render UI. It also includes language pack.

## Documentation

See [Icon Finder documentation](https://docs.iconify.design/icon-finder/packages/) for details.

Documentation is designed to help you build custom Icon Finder implementation. It is very technical and requires good knowledge of Node.js

# License

Iconify Icon Finder is dual-licensed under Apache 2.0 and GPL 2.0 license. You may select, at your option, one of the above-listed licenses.

`SPDX-License-Identifier: Apache-2.0 OR GPL-2.0`

© 2020 Iconify OÜ
