import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoRTEViewProps } from './ExpoRTE.types';

const NativeView: React.ComponentType<ExpoRTEViewProps> =
  requireNativeView('ExpoRTE');

export default function ExpoRTEView(props: ExpoRTEViewProps) {
  return <NativeView {...props} />;
}
