import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: false,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte( {
			emitCss: true
		} ),
		postcss(),

		resolve( {
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith( 'svelte/' )
		} ),
		commonjs(),
		!production && serve(),
		!production && livereload( 'public' ),
		production && terser()
	],
	watch: { clearScreen: false }
};

function serve () {
	let started = false;

	return {
		writeBundle () {
			if ( !started ) {
				started = true;

				require( 'child_process' ).spawn( 'npm', [ 'run', 'start', '--', '--dev' ], {
					stdio: [ 'ignore', 'inherit', 'inherit' ],
					shell: true
				} );
			}
		}
	};
}
