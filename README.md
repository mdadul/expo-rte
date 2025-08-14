# Expo Rich Text Editor (expo-rte)

<div align="center">

![Expo RTE](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/npm/v/expo-rte.svg)
![Downloads](https://img.shields.io/npm/dm/expo-rte.svg)

**A cross-platform rich text editor for React Native and Expo applications**


[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [API](#api) • [Examples](#examples) • [Contributing](#contributing)

</div>

---
<img width="1536" height="1024" alt="expo-rte" src="https://github.com/user-attachments/assets/8379cc54-8111-49cb-a9cf-1551c8e8acea" />

## ✨ Features
- 🛠️ **Highly Customizable** - Adaptive toolbar with multiple density options
- ⚡ **Performance Optimized** - Smooth animations and efficient rendering
- 🌍 **Cross-Platform** - Works seamlessly on iOS and Android
- ♿ **Accessible** - WCAG compliant with proper ARIA labels
- 🎯 **Multiple Toolbar Styles** - Basic, custom styled, and responsive adaptive toolbars
- 🔄 **Format Toggle** - Smart formatting state management
- 📝 **Rich Formatting** - Bold, italic, underline, strikethrough, lists, links, and more

## 🚀 Installation

```bash
# npm
npm install expo-rte

# yarn
yarn add expo-rte

# pnpm
pnpm add expo-rte
```

### Development Build

For Expo development builds or bare React Native apps, you'll need to rebuild your app after installing:

```bash
# For Expo development builds
npx expo run:ios
npx expo run:android

# For bare React Native
npx react-native run-ios
npx react-native run-android
```

> **Note**: This library requires a development build and will not work with Expo Go.

## 📱 Quick Start

### Basic Usage

```tsx
import React, { useRef } from 'react';
import { View } from 'react-native';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

export default function App() {
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleContentChange = ({ nativeEvent }) => {
    console.log('Content:', nativeEvent.content);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        ref={editorRef}
        content="<p>Start typing...</p>"
        placeholder="Enter your text here..."
        onChange={handleContentChange}
        style={{ height: 300 }}
      />
    </View>
  );
}
```

### Advanced Usage with Custom Toolbar

```tsx
import React, { useRef } from 'react';
import { View } from 'react-native';
import { RichTextEditor, RichTextEditorRef, ToolbarConfig } from 'expo-rte';

const customToolbarConfig: ToolbarConfig = {
  adaptive: true,
  groupButtons: true,
  density: 'comfortable',
  scrollable: true,
  showLabels: true,
  buttons: [
    { type: 'bold', icon: 'B', label: 'Bold', group: 'format' },
    { type: 'italic', icon: 'I', label: 'Italic', group: 'format' },
    { type: 'underline', icon: 'U', label: 'Underline', group: 'format' },
    { type: 'bullet', icon: '•', label: 'Bullet List', group: 'list' },
    { type: 'numbered', icon: '1.', label: 'Numbered List', group: 'list' },
    { type: 'link', icon: '🔗', label: 'Link', value: 'https://example.com', group: 'insert' },
    { type: 'undo', icon: '↶', label: 'Undo', group: 'action' },
    { type: 'redo', icon: '↷', label: 'Redo', group: 'action' },
  ],
};

export default function AdvancedEditor() {
  const editorRef = useRef<RichTextEditorRef>(null);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        ref={editorRef}
        content="<p><strong>Rich</strong> <em>text</em> editor with <u>custom</u> toolbar!</p>"
        toolbarConfig={customToolbarConfig}
        style={{ height: 400 }}
      />
    </View>
  );
}
```

## 📚 API Reference

### RichTextEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `""` | Initial HTML content |
| `placeholder` | `string` | `""` | Placeholder text |
| `editable` | `boolean` | `true` | Whether the editor is editable |
| `showToolbar` | `boolean` | `true` | Whether to show the toolbar |
| `toolbarConfig` | `ToolbarConfig` | `undefined` | Custom toolbar configuration |
| `customToolbar` | `ReactNode` | `undefined` | Completely custom toolbar component |
| `style` | `ViewStyle` | `undefined` | Container style |
| `onChange` | `function` | `undefined` | Content change callback |

### RichTextEditorRef Methods

```tsx
interface RichTextEditorRef {
  setContent: (content: string) => Promise<void>;
  getContent: () => Promise<string>;
  format: (type: FormatType, value?: any) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}
```

### ToolbarConfig

```tsx
interface ToolbarConfig {
  buttons?: ToolbarButton[];           // Custom button array
  style?: ViewStyle;                   // Toolbar container styling
  buttonStyle?: ViewStyle;             // Individual button styling
  buttonTextStyle?: TextStyle;         // Button text styling
  scrollable?: boolean;                // Enable horizontal scrolling
  showLabels?: boolean;                // Show button labels
  groupButtons?: boolean;              // Group buttons by category
  adaptive?: boolean;                  // Auto-adapt to screen size
  compactMode?: boolean;               // Use compact layout
  maxButtons?: number;                 // Max buttons for adaptive mode
  density?: 'comfortable' | 'compact' | 'dense'; // Button density
}
```

### ToolbarButton

```tsx
interface ToolbarButton {
  type: FormatType;                    // Button action type
  icon: string | ReactNode;            // Button icon (text or component)
  label?: string;                      // Optional label text
  value?: any;                         // Optional value (e.g., for links)
  group?: 'format' | 'list' | 'action' | 'insert'; // Button grouping
}
```

### Format Types

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

## 🎨 Toolbar Customization

### Responsive Toolbar

```tsx
const responsiveConfig: ToolbarConfig = {
  adaptive: true,
  density: 'comfortable',
  scrollable: true,
  groupButtons: true,
  maxButtons: 8,
  buttons: [
    { type: 'bold', icon: 'B', label: 'Bold', group: 'format' },
    { type: 'italic', icon: 'I', label: 'Italic', group: 'format' },
    { type: 'underline', icon: 'U', label: 'Underline', group: 'format' },
    { type: 'bullet', icon: '•', label: 'Bullets', group: 'list' },
    { type: 'numbered', icon: '1.', label: 'Numbers', group: 'list' },
    { type: 'undo', icon: '↶', label: 'Undo', group: 'action' },
    { type: 'redo', icon: '↷', label: 'Redo', group: 'action' },
  ],
};
```

### Custom Styled Toolbar

```tsx
const customConfig: ToolbarConfig = {
  buttons: [
    { type: 'bold', icon: '𝐁', label: 'Bold' },
    { type: 'italic', icon: '𝐼', label: 'Italic' },
    { type: 'link', icon: '🔗', label: 'Link', value: 'https://example.com' },
  ],
  buttonStyle: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  buttonTextStyle: {
    color: '#ffffff',
    fontWeight: '600',
  },
  showLabels: true,
  density: 'comfortable',
};
```

### 📚 Documentation Examples

For comprehensive examples and real-world usage patterns, see our [Examples Documentation](docs/EXAMPLES.md):

- **[Basic Usage](docs/EXAMPLES.md#basic-usage)** - Simple editor setup and content handling
- **[Custom Toolbar](docs/EXAMPLES.md#custom-toolbar)** - Minimal, professional, and completely custom toolbars
- **[Responsive Design](docs/EXAMPLES.md#responsive-design)** - Adaptive toolbars and device-specific configurations
- **[Event Handling](docs/EXAMPLES.md#event-handling)** - Content tracking, global listeners, and real-time updates
- **[Content Management](docs/EXAMPLES.md#content-management)** - Save/load functionality and content templates
- **[Styling](docs/EXAMPLES.md#styling)** - Dark themes and custom brand colors
- **[Integration Examples](docs/EXAMPLES.md#integration-examples)** - Form integration and modal editors

### Quick Example

```tsx
import React, { useRef } from 'react';
import { View } from 'react-native';
import { RichTextEditor, RichTextEditorRef, ToolbarConfig } from 'expo-rte';

const customConfig: ToolbarConfig = {
  adaptive: true,
  density: 'comfortable',
  buttons: [
    { type: 'bold', icon: 'B', label: 'Bold' },
    { type: 'italic', icon: 'I', label: 'Italic' },
    { type: 'undo', icon: '↶', label: 'Undo' },
  ],
};

export default function MyEditor() {
  const editorRef = useRef<RichTextEditorRef>(null);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        ref={editorRef}
        toolbarConfig={customConfig}
        placeholder="Start writing..."
        style={{ height: 300 }}
      />
    </View>
  );
}
```

## 📱 Responsive Design

The editor automatically adapts to different screen sizes:

- **📱 Small screens** (<400px): Compact buttons, essential formatting only
- **💻 Regular screens** (400-768px): Standard button sizes, full toolbar
- **📊 Tablets** (768px+): Larger touch targets, more spacing

### Manual Responsive Configuration

```tsx
const responsiveConfig: ToolbarConfig = {
  adaptive: true,
  density: 'comfortable', // 'comfortable' | 'compact' | 'dense'
  maxButtons: 6, // Limit buttons on small screens
  scrollable: true, // Enable scrolling when needed
};
```

## 🔧 Advanced Features

### Content Import/Export

```tsx
// Set rich content
await editorRef.current?.setContent(`
  <h1>My Document</h1>
  <p>This is <strong>bold</strong> and <em>italic</em> text.</p>
  <ul>
    <li>Bullet point 1</li>
    <li>Bullet point 2</li>
  </ul>
`);

// Get HTML content
const htmlContent = await editorRef.current?.getContent();
```

### Undo/Redo

```tsx
// Programmatic undo/redo
await editorRef.current?.undo();
await editorRef.current?.redo();
```

## 🛠️ Customization

### Custom Button Icons

```tsx
import { MaterialIcons } from '@expo/vector-icons';

const customButtons: ToolbarButton[] = [
  {
    type: 'bold',
    icon: <MaterialIcons name="format-bold" size={20} color="#333" />,
    label: 'Bold'
  },
  // ... more buttons with custom icons
];
```

### Styling

```tsx
const customStyle = {
  container: {
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  toolbar: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  }
};

<RichTextEditor
  style={customStyle.container}
  toolbarConfig={{
    style: customStyle.toolbar,
    buttonStyle: customStyle.button,
    buttonTextStyle: customStyle.buttonText,
  }}
/>
```

## 🐛 Troubleshooting

### Common Issues

1. **Editor not appearing**: Ensure you're using a development build, not Expo Go
2. **Formatting not working**: Check that the toolbar is enabled and buttons are configured
3. **Content not updating**: Verify the `onChange` callback is properly connected
4. **Performance issues**: Consider using `adaptive: true` for better performance on lower-end devices

### Debug Mode

```tsx
// Enable debug logging
<RichTextEditor
  onChange={({ nativeEvent }) => {
    console.log('Content changed:', nativeEvent.content);
  }}
/>
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/mdadul/expo-rte.git
cd expo-rte

# Install dependencies
npm install

# Run the example app
cd example
npm install
npx expo run:ios # or npx expo run:android
```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Credits

Created by [Emdadul Islam](https://github.com/mdadul)


<div align="center">

**[⬆ Back to top](#expo-rich-text-editor-expo-rte)**

Made with ❤️ by [Emdadul Islam](https://github.com/mdadul)

</div>
