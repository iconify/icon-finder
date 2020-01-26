# Iconify Icon Finder: Phrases

Icon Finder UI is designed to be easy to customise. That includes the possibility of translation.

By default, Icon Finder UI uses English phrases. Phrases are written in TypeScript and are located in `packages/ui/src/phrases/en.ts`.

## Creating a language pack

To create language pack, go to `packages/ui/src/phrases/` and copy `en.ts`. Filename must end with `.ts`.

Edit text in a new file.

## Changing language pack

To change the default language pack, open `packages/ui/build.config.js` and change the value of property `language`:

```js
module.exports = {
	// ...

	// Language
	language: 'en',

	// Extra languages to include, array of strings
	extraLanguages: [],
};
```

Code above shows only part of the configuration. You need to find `language` property. Change its value to the name of your language pack file, without `.ts` extension.

After changing the language pack, run `npm build` to build UI.

See [build.md](build.md) to understand build process.
