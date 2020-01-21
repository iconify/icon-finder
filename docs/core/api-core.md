# APICore class in Iconify Icon Finder

APICore class makes it easy to interact with Iconify Icon Finder Core.

All configuration values, initial route and callbacks are set in the constructor. Then all you need to do is react to the main callback.

```js
const { APICore } = require('@iconify/icon-finder-core');

const core = new APICore({
	// Configuration
	config: {
		display: {
			itemsPerPage: 32,
		},
	},
	// Default route. If default route fails, script will navigate to home page
	defaultRoute: {
		type: 'collections',
	},
	callback: (data, core) => {
		// Main callback where all stuff happens
	},
});
```

## Callback

`callback` is the main function of Iconify Core. It is called whenever something needs to be rendered and includes everything you need to render UI.

See [render.md](render.md) for description and code example.

## Actions

UI should call actions whenever something is clicked.

See [actions.md](actions.md) for details.

## Instance ID

Each APICore instance has a unique id. It makes it possible to pass APICore instance as a string instead of an object to child components.

```jsx
import { APICore, getAPICoreInstance } from '@iconify/icon-finder-core';

// Container component: create core
class Container extends Component {
	constructor() {
		super();

		this.core = new APICore({
			callback: data => {
				// Change state on each render
				this.setState(data);
			},
		});
	}

	render() {
		<ChildComponent {...this.state} core={this.core.id} />;
	}
}

// Child component: use core passed as string
class ChildComponent extends Component {
	constructor(props) {
		super(props);

		this.core = getAPICoreInstance(props.core);
	}
}
```

## Destroying instance

When you no longer need APICore instance, you should destroy it. That will remove all references to instance, allowing JavaScript garbage collector to remove it from memory.

```js
core.destroy();
```
