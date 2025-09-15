import { ember, extensions } from '@embroider/vite';

import { babel } from '@rollup/plugin-babel';
import { scopedCSS } from 'glimmer-scoped-css/rollup';
import icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

import { theemo } from '@theemo/vite';

export default defineConfig({
  plugins: [
    ember(),
    scopedCSS('src'),
    theemo({
      defaultTheme: 'moana'
    }),
    icons({
      autoInstall: true,
      compiler: 'raw'
    }),
    babel({
      babelHelpers: 'runtime',
      extensions
    })
  ]
});
