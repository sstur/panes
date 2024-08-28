import typescript from '@rollup/plugin-typescript';
import cleanup from 'rollup-plugin-cleanup';

export default {
  input: 'src/cli.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    strict: false,
    esModule: false,
  },
  external: ['os', 'blessed', 'blessed-xterm'],
  plugins: [
    typescript({
      module: 'esnext',
    }),
    cleanup({
      extensions: ['js', 'ts'],
    }),
  ],
};
