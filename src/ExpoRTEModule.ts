import { NativeModule, requireNativeModule } from 'expo';

import { ExpoRTEModuleEvents, FormatType } from './ExpoRTE.types';

declare class ExpoRTEModule extends NativeModule<ExpoRTEModuleEvents> {
  setContent(content: string): Promise<void>;
  getContent(): Promise<string>;
  format(type: FormatType, value?: any): Promise<void>;
  insertImage(uri: string, width?: number, height?: number): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoRTEModule>('ExpoRTE');
