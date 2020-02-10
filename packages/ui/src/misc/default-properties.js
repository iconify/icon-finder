// ExtendedIconProperties, contains only defaultValue and emptyValue (if different than defaultValue)
// Included from rollup configuration, so it must be js file
export const defaultProperties = {
	// Special properties - copied as is. Must include emptyValue
	hFlip: {
		defaultValue: false,
		emptyValue: false,
	},
	vFlip: {
		defaultValue: false,
		emptyValue: false,
	},
	// emptyValue is optional
	rotate: {
		defaultValue: 0,
	},
	color: {
		defaultValue: '',
	},
	width: {
		defaultValue: 0,
		emptyValue: '',
	},
	height: {
		defaultValue: 0,
		emptyValue: '',
	},
};
