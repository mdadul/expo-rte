import { registerWebModule, NativeModule } from 'expo';

import { ExpoRTEModuleEvents } from './ExpoRTE.types';

class ExpoRTEModule extends NativeModule<ExpoRTEModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoRTEModule, 'ExpoRTEModule');
