/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Webpack fallbacks for Node.js built-ins that the Shelby Protocol SDK
   * and Aptos SDK reference in browser bundles.
   *
   * Without these, Next.js throws "Module not found: Can't resolve 'fs'"
   * (and similar) at compile time, which then causes runtime undefined
   * values that Petra's inpage.js crashes on.
   */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Node.js built-ins — not available in the browser
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        // 'stream' and 'buffer' are needed by some Shelby/Aptos internals
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
        // crypto is polyfilled by webpack already in most setups, but be explicit
        crypto: require.resolve("crypto-browserify"),
      };

      // Make Buffer available globally (required by Shelby SDK in the browser)
      const webpack = require("webpack");
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
          process: "process/browser",
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;