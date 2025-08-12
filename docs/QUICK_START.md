# Quick Start Guide

Get up and running with expo-rte in 5 minutes!

## Installation

```bash
npm install expo-rte
```

> **Important**: This library requires a development build and will not work with Expo Go.

## Basic Setup

### 1. Import the Component

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextEditor } from 'expo-rte';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        placeholder="Start typing..."
        style={{ height: 300 }}
      />
    </View>
  );
}
```

### 2. Run Development Build

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

That's it! You now have a fully functional rich text editor.

## Essential Features

### Content Management

```tsx
import React, { useRef } from 'react';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

export default function MyEditor() {
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleSave = async () => {
    const content = await editorRef.current?.getContent();
    console.log('Saved content:', content);
  };

  const handleLoad = () => {
    editorRef.current?.setContent('<p><strong>Loaded content</strong></p>');
  };

  return (
    <RichTextEditor
      ref={editorRef}
      placeholder="Your content here..."
      style={{ height: 300 }}
    />
  );
}
```

### Event Handling

```tsx
import React from 'react';
import { RichTextEditor } from 'expo-rte';

export default function EventEditor() {
  const handleChange = ({ nativeEvent }) => {
    console.log('Content changed:', nativeEvent.content);
  };

  return (
    <RichTextEditor
      onChange={handleChange}
      placeholder="Type to see events..."
      style={{ height: 300 }}
    />
  );
}
```

### Custom Toolbar

```tsx
import React from 'react';
import { RichTextEditor, ToolbarConfig } from 'expo-rte';

const toolbarConfig: ToolbarConfig = {
  buttons: [
    { type: 'bold', icon: 'B', label: 'Bold' },
    { type: 'italic', icon: 'I', label: 'Italic' },
    { type: 'undo', icon: '↶', label: 'Undo' },
    { type: 'redo', icon: '↷', label: 'Redo' },
  ],
  showLabels: true,
  density: 'comfortable',
};

export default function CustomEditor() {
  return (
    <RichTextEditor
      toolbarConfig={toolbarConfig}
      placeholder="Custom toolbar editor..."
      style={{ height: 300 }}
    />
  );
}
```

## Pre-built Styles

### WordPress Style

```tsx
const wordPressConfig: ToolbarConfig = {
  adaptive: true,
  groupButtons: true,
  density: 'comfortable',
};

<RichTextEditor toolbarConfig={wordPressConfig} />
```

### Mobile-Optimized

```tsx
const mobileConfig: ToolbarConfig = {
  adaptive: true,
  density: 'compact',
  scrollable: true,
  maxButtons: 6,
};

<RichTextEditor toolbarConfig={mobileConfig} />
```

## Common Use Cases

### Note Taking App

```tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { RichTextEditor } from 'expo-rte';

export default function NotesApp() {
  const [noteTitle, setNoteTitle] = useState('My Note');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        {noteTitle}
      </Text>
      <RichTextEditor
        placeholder="Write your note here..."
        style={{ flex: 1 }}
        toolbarConfig={{ adaptive: true, density: 'compact' }}
      />
    </View>
  );
}
```

### Document Editor

```tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

export default function DocumentEditor() {
  const editorRef = useRef<RichTextEditorRef>(null);

  const formatBold = () => editorRef.current?.format('bold');
  const addLink = () => editorRef.current?.format('link', 'https://example.com');

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity 
          style={{ backgroundColor: '#007AFF', padding: 10, marginRight: 10 }}
          onPress={formatBold}
        >
          <Text style={{ color: 'white' }}>Bold</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ backgroundColor: '#28a745', padding: 10 }}
          onPress={addLink}
        >
          <Text style={{ color: 'white' }}>Add Link</Text>
        </TouchableOpacity>
      </View>
      
      <RichTextEditor
        ref={editorRef}
        placeholder="Write your document..."
        style={{ flex: 1 }}
      />
    </View>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Element type is invalid"**
   - Make sure you're using a development build, not Expo Go
   - Verify installation: `npm list expo-rte`

2. **Toolbar not showing**
   - Check `showToolbar={true}` prop
   - Verify toolbar configuration

3. **Content not updating**
   - Ensure `onChange` handler is connected
   - Check ref usage for programmatic updates

### Getting Help

- 📖 [Full Documentation](../README.md)
- 🔧 [API Reference](./API.md)
- 💡 [Examples](./EXAMPLES.md)
- 🐛 [Report Issues](https://github.com/mdadul/expo-rte/issues)

## Next Steps

1. Explore [advanced examples](./EXAMPLES.md)
2. Read the [complete API reference](./API.md)
3. Check out [styling options](./README.md#styling)
4. Learn about [responsive design](./README.md#responsive-design)

Happy coding! 🚀
