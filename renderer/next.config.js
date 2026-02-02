// /** @type {import('next').NextConfig} */
// module.exports = {
//   output: 'export',
//   distDir: process.env.NODE_ENV === 'production' ? '../app' : '.next',
//   trailingSlash: true,
//   images: {
//     unoptimized: true,
//   },
//   webpack: (config) => {
//     return config
//   },
// }
// ...existing code...
const webpack = require("webpack");
const path = require("path");

module.exports = {
  output: "export",
  distDir: process.env.NODE_ENV === "production" ? "../app" : ".next",
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve?.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        path: false,
        os: false,
      };

      // Ignore modules that depend on Node builtins on the client
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^atomically$/ }));

      // Alias electron to an empty module so `import electron from "electron"` in renderer won't break the client build
      config.resolve.alias = {
        ...(config.resolve?.alias || {}),
        electron: path.resolve(__dirname, "lib", "electron-empty.js"),
      };
    }
    return config;
  },
};