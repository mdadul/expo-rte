# API Reference

Complete API documentation for expo-rte Rich Text Editor.

## Components

### RichTextEditor

The main component that provides a rich text editing interface.

```tsx
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';
```

#### Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `content` | `string` | `""` | No | Initial HTML content of the editor |
| `placeholder` | `string` | `""` | No | Placeholder text shown when editor is empty |
| `editable` | `boolean` | `true` | No | Whether the editor allows text input |
| `showToolbar` | `boolean` | `true` | No | Whether to display the formatting toolbar |
| `toolbarConfig` | `ToolbarConfig` | `undefined` | No | Configuration for customizing the toolbar |
| `customToolbar` | `ReactNode` | `undefined` | No | Completely custom toolbar component |
| `style` | `ViewStyle` | `undefined` | No | Style applied to the editor container |
| `onChange` | `(event: ChangeEvent) => void` | `undefined` | No | Callback fired when content changes |

#### Example

```tsx
<RichTextEditor
  content="<p>Initial content</p>"
  placeholder="Start typing..."
  onChange={({ nativeEvent }) => console.log(nativeEvent.content)}
  style={{ height: 300 }}
/>
```

### ExpoRTEView

Native view component (usually not used directly).

```tsx
import { ExpoRTEView } from 'expo-rte';
```

## Interfaces

### RichTextEditorRef

Reference object for imperative operations on the editor.

```tsx
interface RichTextEditorRef {
  setContent: (content: string) => Promise<void>;
  getContent: () => Promise<string>;
  format: (type: FormatType, value?: any) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}
```

#### Methods

##### setContent(content: string)

Sets the HTML content of the editor.

**Parameters:**
- `content` (string): HTML string to set as editor content

**Returns:** `Promise<void>`

**Example:**
```tsx
await editorRef.current?.setContent('<p><strong>Bold text</strong></p>');
```

##### getContent()

Gets the current HTML content of the editor.

**Returns:** `Promise<string>` - HTML content

**Example:**
```tsx
const content = await editorRef.current?.getContent();
console.log(content); // "<p><strong>Bold text</strong></p>"
```

##### format(type: FormatType, value?: any)

Applies formatting to the selected text or inserts formatted text.

**Parameters:**
- `type` (FormatType): Type of formatting to apply
- `value` (any, optional): Additional value for certain formats (e.g., URL for links)

**Returns:** `Promise<void>`

**Example:**
```tsx
// Apply bold formatting
await editorRef.current?.format('bold');

// Add a link
await editorRef.current?.format('link', 'https://example.com');
```

##### undo()

Undoes the last action.

**Returns:** `Promise<void>`

**Example:**
```tsx
await editorRef.current?.undo();
```

##### redo()

Redoes the last undone action.

**Returns:** `Promise<void>`

**Example:**
```tsx
await editorRef.current?.redo();
```

### ToolbarConfig

Configuration object for customizing the toolbar appearance and behavior.

```tsx
interface ToolbarConfig {
  buttons?: ToolbarButton[];
  style?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  scrollable?: boolean;
  showLabels?: boolean;
  groupButtons?: boolean;
  adaptive?: boolean;
  compactMode?: boolean;
  maxButtons?: number;
  density?: 'comfortable' | 'compact' | 'dense';
}
```

#### Properties

##### buttons

Array of button configurations for the toolbar.

**Type:** `ToolbarButton[]`
**Default:** Default button set

**Example:**
```tsx
buttons: [
  { type: 'bold', icon: 'B', label: 'Bold' },
  { type: 'italic', icon: 'I', label: 'Italic' },
]
```

##### style

Style applied to the toolbar container.

**Type:** `ViewStyle`
**Default:** `undefined`

##### buttonStyle

Style applied to individual toolbar buttons.

**Type:** `ViewStyle`
**Default:** `undefined`

##### buttonTextStyle

Style applied to toolbar button text.

**Type:** `TextStyle`
**Default:** `undefined`

##### scrollable

Whether the toolbar should scroll horizontally when buttons overflow.

**Type:** `boolean`
**Default:** `false`

##### showLabels

Whether to show text labels under toolbar buttons.

**Type:** `boolean`
**Default:** `false`

##### groupButtons

Whether to visually group buttons by category.

**Type:** `boolean`
**Default:** `false`

##### adaptive

Whether the toolbar should automatically adapt to screen size.

**Type:** `boolean`
**Default:** `false`

##### compactMode

Whether to use compact layout for the toolbar.

**Type:** `boolean`
**Default:** `false`

##### maxButtons

Maximum number of buttons to show when adaptive mode is enabled.

**Type:** `number`
**Default:** Screen size dependent

##### density

Button density affecting size and spacing.

**Type:** `'comfortable' | 'compact' | 'dense'`
**Default:** `'comfortable'`

### ToolbarButton

Configuration for individual toolbar buttons.

```tsx
interface ToolbarButton {
  type: FormatType;
  icon: string | ReactNode;
  label?: string;
  value?: any;
  group?: 'format' | 'list' | 'action' | 'insert';
}
```

#### Properties

##### type

The formatting action this button performs.

**Type:** `FormatType`
**Required:** Yes

##### icon

The icon displayed on the button (text or React component).

**Type:** `string | ReactNode`
**Required:** Yes

**Example:**
```tsx
// Text icon
icon: 'B'

// React component icon
icon: <MaterialIcons name="format-bold" size={20} />
```

##### label

Optional text label displayed under the icon.

**Type:** `string`
**Default:** `undefined`

##### value

Optional value passed to the format function (e.g., URL for links).

**Type:** `any`
**Default:** `undefined`

##### group

Category for grouping buttons visually.

**Type:** `'format' | 'list' | 'action' | 'insert'`
**Default:** `undefined`

## Types

### FormatType

Available formatting types.

```tsx
type FormatType = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough' 
  | 'bullet' 
  | 'numbered' 
  | 'link' 
  | 'undo' 
  | 'redo';
```

#### Values

- `'bold'` - Bold text formatting
- `'italic'` - Italic text formatting
- `'underline'` - Underlined text formatting
- `'strikethrough'` - Strikethrough text formatting
- `'bullet'` - Bullet list formatting
- `'numbered'` - Numbered list formatting
- `'link'` - Link formatting (requires URL value)
- `'undo'` - Undo last action
- `'redo'` - Redo last undone action

### ChangeEventPayload

Event payload for content change events.

```tsx
type ChangeEventPayload = {
  content: string;
};
```

### ExpoRTEViewProps

Props for the native view component.

```tsx
type ExpoRTEViewProps = {
  content?: string;
  onChange?: (event: { nativeEvent: ChangeEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
  placeholder?: string;
  editable?: boolean;
};
```

## Functions

### addChangeListener

Global event listener for content changes across all editor instances.

```tsx
function addChangeListener(
  listener: (event: ChangeEventPayload) => void
): EventSubscription;
```

**Parameters:**
- `listener` - Function to call when content changes

**Returns:** `EventSubscription` - Subscription object with `remove()` method

**Example:**
```tsx
import { addChangeListener } from 'expo-rte';

useEffect(() => {
  const subscription = addChangeListener(({ content }) => {
    console.log('Global content change:', content);
  });

  return () => subscription.remove();
}, []);
```

### Module Functions

Direct module functions for programmatic control.

#### setContent(content: string)

```tsx
import { setContent } from 'expo-rte';
await setContent('<p>New content</p>');
```

#### getContent()

```tsx
import { getContent } from 'expo-rte';
const content = await getContent();
```

#### format(type: FormatType, value?: any)

```tsx
import { format } from 'expo-rte';
await format('bold');
await format('link', 'https://example.com');
```

#### undo()

```tsx
import { undo } from 'expo-rte';
await undo();
```

#### redo()

```tsx
import { redo } from 'expo-rte';
await redo();
```

## Error Handling

All async methods can throw errors. Wrap them in try-catch blocks:

```tsx
try {
  await editorRef.current?.setContent('<p>Content</p>');
} catch (error) {
  console.error('Failed to set content:', error);
}
```

## Performance Considerations

- Use `adaptive: true` for better performance on lower-end devices
- Limit the number of toolbar buttons for small screens
- Consider using `density: 'compact'` for mobile devices
- Enable `scrollable: true` for toolbars with many buttons

## Platform Differences

### iOS
- Uses UITextView with NSAttributedString
- Native shadow effects
- Smooth scroll indicators

### Android
- Uses EditText with SpannableStringBuilder
- Material Design elevation
- Different font rendering

## Migration Guide

### From v0.x to v1.0

The API is stable from v1.0. No breaking changes expected in patch releases.
