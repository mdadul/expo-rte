// Reexport the native module. On web, it will be resolved to ExpoRTEModule.web.ts
// and on native platforms to ExpoRTEModule.ts
export { default } from './ExpoRTEModule';
export { default as ExpoRTEView } from './ExpoRTEView';
export * from  './ExpoRTE.types';
