import { UI } from './ui';

// Create instance
const main = new UI({
	container: document.body,
	callback: (event, payload) => {
		console.log('Callback:', event, payload);
	},
});
