const mocha = require('mocha');
const { expect } = require('chai');
const { merge } = require('../lib/config/merge');
const { config, merge: mergeTheme } = require('../lib/config/theme');

describe('Testing merging theme configs', () => {
	it('Basic theme', () => {
		const item1 = config();
		expect(item1.icons).to.be.eql({
			names: {},
		});

		const item2 = {
			icons: {
				class: '',
				custom: {
					provider: 'icon-finder',
					prefix: 'iconify-new',
					icons: {
						'error-loading': {
							body:
								'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
						},
					},
					width: 16,
					height: 16,
				},
				names: {
					'reset': '@local:line-md:close',
					'search': '@local:line-md:search',
					'down': '@local:line-md:chevron-down',
					'left': '@local:line-md:chevron-left',
					'right': '@local:line-md:chevron-right',
					'parent': '@local:line-md:chevron-left',
					'grid': '@local:line-md:grid-3-solid',
					'list': '@local:line-md:list-3-solid',
					'error-loading': '@icon-finder:iconify-new:error-loading',
					'icon-width': '@local:line-md:double-arrow-horizontal',
					'icon-height': '@local:line-md:double-arrow-vertical',
					'color': '@local:line-md:paint-drop-half-twotone',
					'color-filled': '@local:line-md:paint-drop-filled',
					'rotate0': '@local:line-md:close',
					'rotate1': '@local:line-md:rotate-90',
					'rotate2': '@local:line-md:rotate-180',
					'rotate3': '@local:line-md:rotate-270',
					'h-flip': '@local:line-md:double-arrow-horizontal',
					'v-flip': '@local:line-md:double-arrow-vertical',
					'plus': '@local:line-md:plus',
					'link': '@local:line-md:external-link',
				},
			},
			rotation: 20,
		};
		const merged = merge(item1, item2, mergeTheme);

		// Check merged object
		expect(merged).to.be.eql({
			icons: {
				class: '',
				custom: {
					provider: 'icon-finder',
					prefix: 'iconify-new',
					icons: {
						'error-loading': {
							body:
								'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
						},
					},
					width: 16,
					height: 16,
				},
				names: {
					'reset': '@local:line-md:close',
					'search': '@local:line-md:search',
					'down': '@local:line-md:chevron-down',
					'left': '@local:line-md:chevron-left',
					'right': '@local:line-md:chevron-right',
					'parent': '@local:line-md:chevron-left',
					'grid': '@local:line-md:grid-3-solid',
					'list': '@local:line-md:list-3-solid',
					'error-loading': '@icon-finder:iconify-new:error-loading',
					'icon-width': '@local:line-md:double-arrow-horizontal',
					'icon-height': '@local:line-md:double-arrow-vertical',
					'color': '@local:line-md:paint-drop-half-twotone',
					'color-filled': '@local:line-md:paint-drop-filled',
					'rotate0': '@local:line-md:close',
					'rotate1': '@local:line-md:rotate-90',
					'rotate2': '@local:line-md:rotate-180',
					'rotate3': '@local:line-md:rotate-270',
					'h-flip': '@local:line-md:double-arrow-horizontal',
					'v-flip': '@local:line-md:double-arrow-vertical',
					'plus': '@local:line-md:plus',
					'link': '@local:line-md:external-link',
				},
			},
			rotation: 20,
		});
	});

	it('Nested theme', () => {
		const item1 = config();
		expect(item1.icons).to.be.eql({
			names: {},
		});

		const item2 = {
			icons: {
				class: 'test-class',
				custom: {
					provider: 'icon-finder',
					prefix: 'iconify-new',
					icons: {
						'error-loading': {
							body:
								'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
						},
					},
					width: 16,
					height: 16,
				},
				names: {
					reset: '@local:line-md:close',
					search: '@local:line-md:search',
					down: '@local:line-md:chevron-down',
					left: '@local:line-md:chevron-left',
					right: '@local:line-md:chevron-right',
				},
			},
			rotation: 20,
		};
		const merged1 = merge(item1, item2, mergeTheme);

		// Check merged object
		expect(merged1).to.be.eql({
			icons: {
				// no class + custom class = custom class
				class: 'test-class',
				// simple merge
				custom: {
					provider: 'icon-finder',
					prefix: 'iconify-new',
					icons: {
						'error-loading': {
							body:
								'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
						},
					},
					width: 16,
					height: 16,
				},
				// simple merge
				names: {
					reset: '@local:line-md:close',
					search: '@local:line-md:search',
					down: '@local:line-md:chevron-down',
					left: '@local:line-md:chevron-left',
					right: '@local:line-md:chevron-right',
				},
			},
			// simple merge
			rotation: 20,
		});

		// Another item
		const item3 = {
			icons: {
				class: 'arty-animated',
				custom: {
					provider: 'icon-finder',
					prefix: 'iconify',
					icons: {
						'error-loading': {
							body:
								'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
						},
						'color-filled': {
							body:
								'<rect width="16" height="16" rx="2" fill="currentColor"/>',
						},
						'test': {
							body:
								'<g stroke="currentColor" stroke-linecap="round" stroke-width="16" fill="none" fill-rule="evenodd"><path d="M8 64h112" class="animation-delay-0 animation-duration-6 animate-stroke stroke-length-153"/><path d="M64 8v112" class="animation-delay-6 animation-duration-6 animate-stroke stroke-length-153"/></g>',
							width: 128,
							height: 128,
						},
					},
					width: 16,
					height: 16,
				},
				names: {
					'down': 'arty-animated:16-chevron-down',
					'left': 'arty-animated:16-chevron-left',
					'right': 'arty-animated:16-chevron-right',
					'parent': 'arty-animated:16-chevron-left',
					'grid': 'arty-animated:20-grid-3',
					'list': 'arty-animated:20-list-3',
					'error-loading': '@icon-finder:iconify:error-loading',
				},
			},
		};

		const merged2 = merge(merged1, item3, mergeTheme);

		// Check merged object
		expect(merged2).to.be.eql({
			icons: {
				// both classes should be in result
				class: 'test-class arty-animated',
				// custom icon sets should be in array, new sets first
				custom: [
					{
						provider: 'icon-finder',
						prefix: 'iconify',
						icons: {
							'error-loading': {
								body:
									'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
							},
							'color-filled': {
								body:
									'<rect width="16" height="16" rx="2" fill="currentColor"/>',
							},
							'test': {
								body:
									'<g stroke="currentColor" stroke-linecap="round" stroke-width="16" fill="none" fill-rule="evenodd"><path d="M8 64h112" class="animation-delay-0 animation-duration-6 animate-stroke stroke-length-153"/><path d="M64 8v112" class="animation-delay-6 animation-duration-6 animate-stroke stroke-length-153"/></g>',
								width: 128,
								height: 128,
							},
						},
						width: 16,
						height: 16,
					},
					{
						provider: 'icon-finder',
						prefix: 'iconify-new',
						icons: {
							'error-loading': {
								body:
									'<g clip-path="url(#clip0)"><path d="M9.9.2l-.2 1C12.7 2 15 4.7 15 8c0 3.9-3.1 7-7 7s-7-3.1-7-7c0-3.3 2.3-6 5.3-6.8l-.2-1C2.6 1.1 0 4.3 0 8c0 4.4 3.6 8 8 8s8-3.6 8-8c0-3.7-2.6-6.9-6.1-7.8z" fill="currentColor"/></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs>',
							},
						},
						width: 16,
						height: 16,
					},
				],
				// simple merge: new entries overwrite old entries
				names: {
					'reset': '@local:line-md:close',
					'search': '@local:line-md:search',
					'down': 'arty-animated:16-chevron-down',
					'left': 'arty-animated:16-chevron-left',
					'right': 'arty-animated:16-chevron-right',
					'parent': 'arty-animated:16-chevron-left',
					'grid': 'arty-animated:20-grid-3',
					'list': 'arty-animated:20-list-3',
					'error-loading': '@icon-finder:iconify:error-loading',
				},
			},
			rotation: 20,
		});
	});
});
