// Reexport the native module. On web, it will be resolved to ExpoRTEModule.web.ts
// and on native platforms to ExpoRTEModule.ts
import { EventSubscription } from 'expo-modules-core';
import ExpoRTEModule from './ExpoRTEModule';
import { ChangeEventPayload, FormatType } from './ExpoRTE.types';

export { default as ExpoRTEView } from './ExpoRTEView';
export { default as ExpoRTE } from './ExpoRTEView';
export { default as RichTextEditor } from './RichTextEditor';
export type { RichTextEditorRef, ToolbarButton, ToolbarConfig } from './RichTextEditor';
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
  if (value !== undefined && value !== null) {
    return ExpoRTEModule.format(type, value);
  } else {
    return ExpoRTEModule.formatSimple(type);
  }
}

// Image functionality removed for stability

export function undo(): Promise<void> {
  return ExpoRTEModule.undo();
}

export function redo(): Promise<void> {
  return ExpoRTEModule.redo();
}

export { default } from './ExpoRTEModule';
