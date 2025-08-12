// Reexport the native module. On web, it will be resolved to ExpoRTEModule.web.ts
// and on native platforms to ExpoRTEModule.ts
import { EventSubscription } from 'expo-modules-core';
import ExpoRTEModule from './ExpoRTEModule';
import { ChangeEventPayload, FormatType } from './ExpoRTE.types';

export { default as ExpoRTEView } from './ExpoRTEView';
export { default as ExpoRTE } from './ExpoRTEView';
export { default as RichTextEditor } from './RichTextEditor';
export * from  './ExpoRTE.types';

// Event listener function following Expo pattern
export function addChangeListener(listener: (event: ChangeEventPayload) => void): EventSubscription {
  return ExpoRTEModule.addListener('onChange', listener);
}

// Module functions
export function setContent(content: string): Promise<void> {
  return ExpoRTEModule.setContent(content);
}

export function getContent(): Promise<string> {
  return ExpoRTEModule.getContent();
}

export function format(type: FormatType, value?: any): Promise<void> {
  return ExpoRTEModule.format(type, value);
}

export function insertImage(uri: string, width?: number, height?: number): Promise<void> {
  return ExpoRTEModule.insertImage(uri, width, height);
}

export function undo(): Promise<void> {
  return ExpoRTEModule.undo();
}

export function redo(): Promise<void> {
  return ExpoRTEModule.redo();
}

export { default } from './ExpoRTEModule';
