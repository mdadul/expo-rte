import { NativeModule, requireNativeModule } from 'expo';

import { ExpoRTEModuleEvents } from './ExpoRTE.types';

declare class ExpoRTEModule extends NativeModule<ExpoRTEModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoRTEModule>('ExpoRTE');
