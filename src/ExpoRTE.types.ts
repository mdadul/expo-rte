import type { StyleProp, ViewStyle } from 'react-native';

export type FormatType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'bullet' | 'numbered' | 'link' | 'undo' | 'redo' | 'foreground' | 'background';

export type ChangeEventPayload = {
  content: string;
};

export type ExpoRTEModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ExpoRTEViewProps = {
  content?: string;
  onChange?: (event: { nativeEvent: ChangeEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
  editable?: boolean;
};

export interface ExpoRTEModule {
  setContent(content: string): Promise<void>;
  getContent(): Promise<string>;
  format(type: FormatType, value?: any): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
}
