import babel from 'rollup-plugin-babel';
import { uglify } from "rollup-plugin-uglify";

const babell = babel({
    exclude: 'node_modules/**',
});

const config = {
    entry: 'lib/index.js',
    dest: 'build/index.min.js',
    format: 'iife',
    sourceMap: 'inline',
    input: 'lib/index.js',
    output: { file: 'index.js', format: 'cjs' },
    plugins: [
        babell,
        uglify()
    ],
  };

export default config;