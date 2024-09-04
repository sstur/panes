import typescript from '@rollup/plugin-typescript';
import cleanup from 'rollup-plugin-cleanup';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    strict: false,
    esModule: false,
  },
  external: ['blessed', 'blessed-xterm'],
  plugins: [
    typescript({
      module: 'esnext',
      outDir: 'dist',
    }),
    cleanup({
      extensions: ['js', 'ts'],
    }),
  ],
};
