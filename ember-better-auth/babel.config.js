export default {
  plugins: [
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: import.meta.resolve('decorator-transforms/runtime-esm')
        }
      }
    ]
  ]
};
