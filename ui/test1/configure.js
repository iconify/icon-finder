const { prepare, build } = require('@iconify/search-configurator');
const params = prepare(__dirname + '/src/components');

// Log theme and config file
console.log(
	`Using config file: ${
		params.params.configFile
			? params.params.configFile
			: 'configurator.json'
	}`
);
console.log(`Using theme: ${params.config.theme}`);

// Check if there is anything to rebuild, run builder
if (!params.requiresRebuild()) {
	return;
}

build(params)
	.then(() => {
		console.log('Dependencies have been confgured and rebuilt.');
	})
	.catch((err) => {
		console.error(err);
	});
