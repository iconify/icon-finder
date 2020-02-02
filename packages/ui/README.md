# Iconify Icon Finder UI

This package renders user interface.

## Development environment

This package does not provide web server. To test UI, you should install web server on your computer.

OSX comes with Apache preinstalled, so if you are developing with OSX, you already have server. All you need to do is setup virtual host or change root directory. There are many tutorials online that will help you.

## Building core

This package requires "core" package to be built. See [../core/README.md](../core/README.md).

## Themes

Theme is integral part of UI. Themes are in separate package "themes" (in parent directory). Themes include not only stylesheet, but also icons and various configuration options that change behavior of user interface.

First you need to compile theme. See [../themes/README.md](../themes/README.md).

## Compiling UI

Compiling UI is very easy.

1. Compile theme (see above).

2. Install dependencies: `npm install`

3. Compile UI: `npm run build`

To test it, open one of html files from directory "demo" in your browser (via web server, not as file://).

## Development mode

Development mode is similar to production mode, but generates bigger files with maps and debug information, making it easier to trace errors.

To compile in development mode, run `npm run dev`.

## Choosing theme

By default, UI is compiled with theme "default". To choose different theme, you need to set it via environment variable `UI_THEME`:

```
UI_THEME=figma npm run build
```

## Configuration files

There are various configuration files that change UI behavior. See [../config/README.md](../config/README.md).

To use configuration file (or multiple configuration files), you need to set environment variable `UI_CONFIG`:

```
UI_CONFIG=no-footer npm run build
```

If you want to apply multiple configuration files, separate them with comma:

```
UI_CONFIG=no-footer,local npm run build
```

## Using both theme and config

You can set both configuration and theme in command line:

```
UI_CONFIG=no-footer UI_THEME=website npm run build
```

## Theme and config for development

Setting UI_THEME and UI_CONFIG environment variables for each `npm run dev` call could be frustrating. Do not worry, you can change default values for development mode.

Copy file `dev.config.json-sample` to `dev.config.json`, open it and change values for theme and config.

Then next time you run `npm run dev`, build script will use your values from `dev.config.json`.

File `dev.config.json` is ignored by `.gitignore`, so it will not be published to repository.

Configuration file does not affect production builds. For production builds you need to set configuration via environment variables.

## Production builds

See [../../docs/build.md](../../docs/build.md)
