# Examples

Collection of practical examples for using expo-rte in your applications.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Toolbar](#custom-toolbar)
- [Responsive Design](#responsive-design)
- [Event Handling](#event-handling)
- [Content Management](#content-management)
- [Styling](#styling)
- [Integration Examples](#integration-examples)

## Basic Usage

### Simple Editor

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextEditor } from 'expo-rte';

export default function SimpleEditor() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        placeholder="Start typing your document..."
        style={{ height: 300 }}
      />
    </View>
  );
}
```

### Editor with Initial Content

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextEditor } from 'expo-rte';

const initialContent = `
  <h1>Welcome to My Document</h1>
  <p>This is a <strong>rich text editor</strong> with <em>formatting</em> capabilities.</p>
  <ul>
    <li>Bullet point one</li>
    <li>Bullet point two</li>
  </ul>
`;

export default function EditorWithContent() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        content={initialContent}
        placeholder="Continue editing..."
        style={{ height: 400 }}
      />
    </View>
  );
}
```

## Custom Toolbar

### Minimal Toolbar

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextEditor, ToolbarConfig } from 'expo-rte';

const minimalConfig: ToolbarConfig = {
  buttons: [
    { type: 'bold', icon: 'B', label: 'Bold' },
    { type: 'italic', icon: 'I', label: 'Italic' },
    { type: 'undo', icon: '↶', label: 'Undo' },
    { type: 'redo', icon: '↷', label: 'Redo' },
  ],
  showLabels: true,
  density: 'comfortable',
};

export default function MinimalEditor() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        toolbarConfig={minimalConfig}
        placeholder="Simple editing experience..."
        style={{ height: 300 }}
      />
    </View>
  );
}
```

### Professional Toolbar with Icons

```tsx
import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RichTextEditor, ToolbarConfig, ToolbarButton } from 'expo-rte';

const professionalButtons: ToolbarButton[] = [
  {
    type: 'bold',
    icon: <MaterialIcons name="format-bold" size={20} color="#333" />,
    label: 'Bold',
    group: 'format'
  },
  {
    type: 'italic',
    icon: <MaterialIcons name="format-italic" size={20} color="#333" />,
    label: 'Italic',
    group: 'format'
  },
  {
    type: 'underline',
    icon: <MaterialIcons name="format-underlined" size={20} color="#333" />,
    label: 'Underline',
    group: 'format'
  },
  {
    type: 'bullet',
    icon: <MaterialIcons name="format-list-bulleted" size={20} color="#333" />,
    label: 'Bullet List',
    group: 'list'
  },
  {
    type: 'numbered',
    icon: <MaterialIcons name="format-list-numbered" size={20} color="#333" />,
    label: 'Numbered List',
    group: 'list'
  },
  {
    type: 'link',
    icon: <MaterialIcons name="link" size={20} color="#333" />,
    label: 'Link',
    value: 'https://example.com',
    group: 'insert'
  },
];

const professionalConfig: ToolbarConfig = {
  buttons: professionalButtons,
  groupButtons: true,
  scrollable: true,
  density: 'comfortable',
  buttonStyle: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  buttonTextStyle: {
    fontSize: 12,
    color: '#495057',
  },
};

export default function ProfessionalEditor() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        toolbarConfig={professionalConfig}
        placeholder="Professional editing experience..."
        style={{ height: 400 }}
      />
    </View>
  );
}
```

### Completely Custom Toolbar

```tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

const CustomToolbar = () => {
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleFormat = (type: string) => {
    editorRef.current?.format(type as any);
  };

  return (
    <View style={styles.customToolbar}>
      <TouchableOpacity 
        style={styles.customButton}
        onPress={() => handleFormat('bold')}
      >
        <Text style={styles.customButtonText}>𝐁</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.customButton}
        onPress={() => handleFormat('italic')}
      >
        <Text style={[styles.customButtonText, { fontStyle: 'italic' }]}>𝐼</Text>
      </TouchableOpacity>
      
      <View style={styles.separator} />
      
      <TouchableOpacity 
        style={styles.customButton}
        onPress={() => handleFormat('undo')}
      >
        <Text style={styles.customButtonText}>⟲</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function CustomToolbarEditor() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        customToolbar={<CustomToolbar />}
        placeholder="Editor with custom toolbar..."
        style={{ height: 300 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  customToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    padding: 15,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  customButton: {
    backgroundColor: '#34495e',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  customButtonText: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: '#7f8c8d',
    marginHorizontal: 8,
  },
});
```

## Responsive Design

### Adaptive Toolbar

```tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import { RichTextEditor, ToolbarConfig } from 'expo-rte';

const { width } = Dimensions.get('window');

const adaptiveConfig: ToolbarConfig = {
  adaptive: true,
  maxButtons: width < 400 ? 6 : width < 768 ? 8 : 12,
  density: width < 400 ? 'compact' : 'comfortable',
  scrollable: true,
  groupButtons: width >= 768,
  showLabels: width >= 768,
  buttons: [
    { type: 'bold', icon: 'B', label: 'Bold', group: 'format' },
    { type: 'italic', icon: 'I', label: 'Italic', group: 'format' },
    { type: 'underline', icon: 'U', label: 'Underline', group: 'format' },
    { type: 'strikethrough', icon: 'S', label: 'Strike', group: 'format' },
    { type: 'bullet', icon: '•', label: 'Bullets', group: 'list' },
    { type: 'numbered', icon: '1.', label: 'Numbers', group: 'list' },
    { type: 'link', icon: '🔗', label: 'Link', group: 'insert' },
    { type: 'undo', icon: '↶', label: 'Undo', group: 'action' },
    { type: 'redo', icon: '↷', label: 'Redo', group: 'action' },
  ],
};

export default function ResponsiveEditor() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        toolbarConfig={adaptiveConfig}
        placeholder="Responsive editor that adapts to screen size..."
        style={{ height: 350 }}
      />
    </View>
  );
}
```

### Device-Specific Configuration

```tsx
import React from 'react';
import { View, Platform } from 'react-native';
import { RichTextEditor, ToolbarConfig } from 'expo-rte';

const getDeviceConfig = (): ToolbarConfig => {
  if (Platform.isPad || Platform.isTV) {
    // Tablet configuration
    return {
      density: 'comfortable',
      showLabels: true,
      groupButtons: true,
      maxButtons: 12,
    };
  } else {
    // Phone configuration
    return {
      density: 'compact',
      adaptive: true,
      scrollable: true,
      maxButtons: 6,
    };
  }
};

export default function DeviceSpecificEditor() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        toolbarConfig={getDeviceConfig()}
        placeholder="Optimized for your device..."
        style={{ height: 300 }}
      />
    </View>
  );
}
```

## Event Handling

### Content Change Tracking

```tsx
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { RichTextEditor } from 'expo-rte';

export default function ContentTracker() {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const handleContentChange = ({ nativeEvent }) => {
    setContent(nativeEvent.content);
    
    // Calculate word count
    const text = nativeEvent.content.replace(/<[^>]*>/g, ''); // Strip HTML
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        onChange={handleContentChange}
        placeholder="Start typing to see live stats..."
        style={{ height: 300 }}
      />
      
      <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>
          Word Count: {wordCount}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 5 }}>
          Characters: {content.length}
        </Text>
      </View>
      
      <ScrollView style={{ marginTop: 10, maxHeight: 100 }}>
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>
          {content}
        </Text>
      </ScrollView>
    </View>
  );
}
```

### Global Event Listener

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { RichTextEditor, addChangeListener } from 'expo-rte';

export default function GlobalEventExample() {
  const [globalContent, setGlobalContent] = useState('');

  useEffect(() => {
    const subscription = addChangeListener(({ content }) => {
      setGlobalContent(content);
      console.log('Global content change detected');
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
        Editor 1
      </Text>
      <RichTextEditor
        placeholder="Type here..."
        style={{ height: 150, marginBottom: 20 }}
      />
      
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
        Editor 2
      </Text>
      <RichTextEditor
        placeholder="Type here too..."
        style={{ height: 150, marginBottom: 20 }}
      />
      
      <Text style={{ fontSize: 14, color: '#666' }}>
        Last global change: {globalContent.substring(0, 50)}...
      </Text>
    </View>
  );
}
```

## Content Management

### Save and Load Content

```tsx
import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

export default function ContentPersistence() {
  const editorRef = useRef<RichTextEditorRef>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveContent = async () => {
    try {
      setIsSaving(true);
      const content = await editorRef.current?.getContent();
      if (content) {
        await AsyncStorage.setItem('editor_content', content);
        Alert.alert('Success', 'Content saved successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const loadContent = async () => {
    try {
      const savedContent = await AsyncStorage.getItem('editor_content');
      if (savedContent) {
        await editorRef.current?.setContent(savedContent);
        Alert.alert('Success', 'Content loaded successfully!');
      } else {
        Alert.alert('Info', 'No saved content found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load content');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        ref={editorRef}
        placeholder="Create your document..."
        style={{ height: 300, marginBottom: 20 }}
      />
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 15,
            borderRadius: 8,
            flex: 1,
            marginRight: 10,
          }}
          onPress={saveContent}
          disabled={isSaving}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#28a745',
            padding: 15,
            borderRadius: 8,
            flex: 1,
            marginLeft: 10,
          }}
          onPress={loadContent}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            Load
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### Content Templates

```tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

const templates = {
  meeting: `
    <h1>Meeting Notes</h1>
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Attendees:</strong></p>
    <ul>
      <li>Participant 1</li>
      <li>Participant 2</li>
    </ul>
    <h2>Agenda</h2>
    <ol>
      <li>Topic 1</li>
      <li>Topic 2</li>
    </ol>
    <h2>Action Items</h2>
    <ul>
      <li>Action item 1</li>
      <li>Action item 2</li>
    </ul>
  `,
  article: `
    <h1>Article Title</h1>
    <p><em>By Author Name - ${new Date().toLocaleDateString()}</em></p>
    <h2>Introduction</h2>
    <p>Start your article here...</p>
    <h2>Main Content</h2>
    <p>Continue with your main points...</p>
    <h2>Conclusion</h2>
    <p>Wrap up your thoughts...</p>
  `,
  letter: `
    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p>Dear [Recipient],</p>
    <p>I hope this letter finds you well...</p>
    <p>Best regards,<br/>
    [Your name]</p>
  `,
};

export default function TemplateEditor() {
  const editorRef = useRef<RichTextEditorRef>(null);

  const loadTemplate = (template: string) => {
    editorRef.current?.setContent(template);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <ScrollView 
        horizontal 
        style={{ marginBottom: 20 }}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 6, marginRight: 10 }}
          onPress={() => loadTemplate(templates.meeting)}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Meeting Notes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ backgroundColor: '#28a745', padding: 10, borderRadius: 6, marginRight: 10 }}
          onPress={() => loadTemplate(templates.article)}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Article</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ backgroundColor: '#17a2b8', padding: 10, borderRadius: 6 }}
          onPress={() => loadTemplate(templates.letter)}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Letter</Text>
        </TouchableOpacity>
      </ScrollView>
      
      <RichTextEditor
        ref={editorRef}
        placeholder="Select a template above or start writing..."
        style={{ height: 400 }}
      />
    </View>
  );
}
```

## Styling

### Dark Theme

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextEditor, ToolbarConfig } from 'expo-rte';

const darkThemeConfig: ToolbarConfig = {
  style: {
    backgroundColor: '#2c3e50',
    borderBottomColor: '#34495e',
  },
  buttonStyle: {
    backgroundColor: '#34495e',
    borderColor: '#4a5f7a',
  },
  buttonTextStyle: {
    color: '#ecf0f1',
  },
  density: 'comfortable',
  showLabels: true,
};

export default function DarkThemeEditor() {
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a', padding: 20 }}>
      <RichTextEditor
        toolbarConfig={darkThemeConfig}
        placeholder="Dark theme editor..."
        style={{
          height: 300,
          backgroundColor: '#2c3e50',
          borderRadius: 12,
        }}
      />
    </View>
  );
}
```

### Custom Brand Colors

```tsx
import React from 'react';
import { View } from 'react-native';
import { RichTextEditor, ToolbarConfig } from 'expo-rte';

const brandConfig: ToolbarConfig = {
  style: {
    backgroundColor: '#f8f9fa',
    borderBottomColor: '#6c5ce7',
    borderBottomWidth: 2,
  },
  buttonStyle: {
    backgroundColor: '#6c5ce7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  buttonTextStyle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  groupButtons: true,
  density: 'comfortable',
};

export default function BrandedEditor() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <RichTextEditor
        toolbarConfig={brandConfig}
        placeholder="Branded editor experience..."
        style={{
          height: 300,
          borderColor: '#6c5ce7',
          borderWidth: 2,
          borderRadius: 12,
        }}
      />
    </View>
  );
}
```

## Integration Examples

### Form Integration

```tsx
import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

interface FormData {
  title: string;
  content: string;
  author: string;
}

export default function FormWithEditor() {
  const editorRef = useRef<RichTextEditorRef>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    author: '',
  });

  const handleSubmit = async () => {
    try {
      const content = await editorRef.current?.getContent();
      const submissionData = {
        ...formData,
        content: content || '',
      };
      
      // Validate form
      if (!submissionData.title || !submissionData.content || !submissionData.author) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
      
      // Submit form
      console.log('Form submission:', submissionData);
      Alert.alert('Success', 'Article submitted successfully!');
      
      // Reset form
      setFormData({ title: '', content: '', author: '' });
      editorRef.current?.setContent('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit article');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20 }}>
        Create Article
      </Text>
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 15,
          fontSize: 16,
        }}
        placeholder="Article Title"
        value={formData.title}
        onChangeText={(title) => setFormData({ ...formData, title })}
      />
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          borderRadius: 8,
          padding: 12,
          marginBottom: 15,
          fontSize: 16,
        }}
        placeholder="Author Name"
        value={formData.author}
        onChangeText={(author) => setFormData({ ...formData, author })}
      />
      
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
        Content
      </Text>
      <RichTextEditor
        ref={editorRef}
        placeholder="Write your article content here..."
        style={{ height: 250, marginBottom: 20 }}
        onChange={({ nativeEvent }) => {
          setFormData({ ...formData, content: nativeEvent.content });
        }}
      />
      
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={handleSubmit}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Submit Article
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Modal Editor

```tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  Text, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

export default function ModalEditorExample() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [savedContent, setSavedContent] = useState('');
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleSave = async () => {
    const content = await editorRef.current?.getContent();
    setSavedContent(content || '');
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          Open Editor
        </Text>
      </TouchableOpacity>
      
      {savedContent ? (
        <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f8f9fa' }}>
          <Text style={{ fontSize: 14 }}>Saved content preview:</Text>
          <Text style={{ fontSize: 12, marginTop: 5 }}>
            {savedContent.substring(0, 100)}...
          </Text>
        </View>
      ) : null}
      
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" />
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
          }}>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={{ fontSize: 16, color: '#007AFF' }}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={{ fontSize: 18, fontWeight: '600' }}>
              Edit Document
            </Text>
            
            <TouchableOpacity onPress={handleSave}>
              <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: '600' }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
          
          <RichTextEditor
            ref={editorRef}
            content={savedContent}
            placeholder="Start writing your document..."
            style={{ flex: 1, margin: 15 }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
```

These examples demonstrate the flexibility and power of expo-rte. You can combine and modify them to fit your specific use case.
