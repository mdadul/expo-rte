// Reexport the native module. On web, it will be resolved to ExpoRTEModule.web.ts
// and on native platforms to ExpoRTEModule.ts
export { default } from './ExpoRTEModule';
export { default as ExpoRTEView } from './ExpoRTEView';
export { default as ExpoRTE } from './ExpoRTEView';
export { default as RichTextEditor } from './RichTextEditor';
export * from  './ExpoRTE.types';
