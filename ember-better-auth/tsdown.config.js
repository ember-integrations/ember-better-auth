import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/registry.ts'],
  sourcemap: true,
  clean: true,
  dts: true,
  external: ['@ember/service', '@glimmer/tracking', '@ember/runloop'],
  tsconfig: './tsconfig.build.json'
});
