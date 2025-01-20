const { build } = require('esbuild');
const pkg = require('./package.json')

const external = Object.keys(pkg.dependencies ?? {}).concat(Object.keys(pkg.peerDependencies ?? {}));

const sharedConfig = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  minify: true,
  external,
  sourcemap: 'external',
};

build({
  ...sharedConfig,
  platform: 'node',
  outfile: './dist/cjs/index.js',
});

build({
  ...sharedConfig,
  platform: 'neutral',
  format: 'esm',
  outfile: './dist/esm/index.js',
});
