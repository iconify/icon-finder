# Iconify Icon Finder: Building UI

UI is designed to be easy to customise. You can toggle various modules and change the language pack.

## Compiling UI

First, you need to install and compile dependencies.

### Compiling Core

Go to `packages/core`, run `npm install` to install dependencies and `npm build` to build Core package.

### Compiling UI

Then go to `packages/ui`, run `npm install` to install dependencies.

Now you are ready to build UI. Before building UI you need to choose the theme and maybe customise the configuration.

See [ui.md](ui.md)

After you have configured the theme, to build UI, run `npm run build`.
