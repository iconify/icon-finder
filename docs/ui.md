# Iconify Icon Finder UI

This file explains how to compile user interface.

## Development environment

This package does not provide a web server. To test UI, you should install a web server on your computer.

OSX comes with Apache preinstalled, so if you are developing with OSX, you already have server. All you need to do is set up a virtual host or change root directory. There are many tutorials online that will help you.

## Building core

This package requires "core" package to be built. See [build.md](build.md).

## Themes

The theme is an integral part of UI. Themes are in separate package "themes" (in the parent directory). Themes include stylesheet, icons and various configuration options that change the behaviour of the user interface.

First you need to compile theme. See [../packages/themes/README.md](../packages/themes/README.md).

## Compiling UI

Compiling UI is very easy.

1. Compile theme (see above).

2. Change the current directory to `packages/ui`.

3. Install dependencies: `npm install`

4. Choose a theme (see below).

5. Compile UI: `npm run build`

To test it, open one of HTML files from directory "demo" in your browser (via web server, not as file://).

## Development mode

Development mode is similar to production mode, but generates bigger files with maps and debug information, making it easier to trace errors.

To compile in development mode, run `npm run dev`.

Development mode also watches files for changes and automatically recompiles UI.

## Choosing the theme

You must choose the theme before compiling UI.

There are two ways of choosing the theme:

### Setting theme with build.config.json

The easiest way to set the default theme is by editing file `build.config.json`. Open that file, change the value of "theme" property.

Then you can run `npm run dev` or `npm run build` without adding any extra parameters.

If you do not have `build.config.json` in UI directory, copy `build.config.json-sample` to `build.config.json`.

### Setting theme with UI_THEME

You can also set the theme by setting an environment variable `UI_THEME` before npm command:

```
UI_THEME=figma npm run build
```

If both `build.config.json` and `UI_THEME` are present, the build process uses the value from `UI_THEME` environment variable.

## Configuration files

Various configuration files can change UI behavior. You can specify things such as footer options, custom API endpoints, custom default page and so on.

See [../config/README.md](../config/README.md).

There are several premade configuration files. You can use multiple files at the same time, they will be merged into one big config file.

By default, only `default` configuration file is used.

There are two ways to set configuration files:

### Setting configuration with build.config.json

The easiest way to set the configuration is by editing file `build.config.json`. Open that file, find "config" object, change the values of "development" and "production" values.

Then you can run `npm run dev` or `npm run build` without adding any extra parameters.

The value set in "development" is used when running `npm run dev`. The value set in "production" is used when running `npm run build`.

If you do not have `build.config.json` in UI directory, copy `build.config.json-sample` to `build.config.json`.

### Setting config with UI_CONFIG

You can also set config by setting an environment variable `UI_CONFIG` before npm command:

```
UI_CONFIG=no-footer npm run build
```

If you want to apply multiple configuration files, separate them with the comma:

```
UI_CONFIG=no-footer,local npm run build
```

## Using the command line

You can set both configuration and theme in the command line:

```
UI_CONFIG=no-footer UI_THEME=website npm run build
```

## Production builds

See [build.md](build.md)
