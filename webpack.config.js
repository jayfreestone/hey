module.exports = {
	// watch: true,
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: [/node_modules/],
				loader: 'babel-loader',
			},
		],
	},
	// entry: {
	// 	heyModal: './src/js/heyModal.js',
	// 	demo: './src/js/demo.js',
	// },
	entry: './src/js/heyModal.js',
	output: {
		path: __dirname,
		filename: 'dist/js/heyModal.min.js',
		libraryTarget: 'umd',
		library: 'heyModal',
	},
};
