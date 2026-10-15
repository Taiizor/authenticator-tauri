// Injected at build time from package.json (see vite.config.ts).
// CI patches package.json to the bundle version before building,
// so dev builds report e.g. "1.0.0+60" and stable builds "1.0.0".
export const APP_VERSION: string = __APP_VERSION__;
