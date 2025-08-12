import * as React from 'react';

import { ExpoRTEViewProps } from './ExpoRTE.types';

export default function ExpoRTEView(props: ExpoRTEViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
