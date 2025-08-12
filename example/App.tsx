import React, { useState, useRef } from 'react';
import { useEvent } from 'expo';
import ExpoRTE, { RichTextEditor, RichTextEditorRef } from 'expo-rte';
import { Button, SafeAreaView, ScrollView, Text, View, Alert } from 'react-native';

export default function App() {
  const [content, setContent] = useState('<p>Welcome to the <strong>Rich Text Editor</strong>!</p><p>Try selecting text and using the formatting buttons above.</p>');
  const rteRef = useRef<RichTextEditorRef>(null);
  
  const onChangePayload = useEvent(ExpoRTE, 'onChange');

  const handleSetContent = async () => {
    await rteRef.current?.setContent('<p>This is <em>newly set</em> content with <strong>formatting</strong>!</p>');
  };

  const handleGetContent = async () => {
    const currentContent = await rteRef.current?.getContent();
    Alert.alert('Current Content', currentContent || 'No content');
  };

  const handleInsertImage = async () => {
    await rteRef.current?.insertImage('https://via.placeholder.com/150', 150, 100);
  };

  const handleAddLink = async () => {
    await rteRef.current?.format('link', 'https://expo.dev');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Expo Rich Text Editor</Text>
        
        <Group name="Rich Text Editor">
          <RichTextEditor
            ref={rteRef}
            content={content}
            placeholder="Start typing your rich text here..."
            onChange={({ nativeEvent }) => {
              console.log('Content changed:', nativeEvent.content);
            }}
            style={styles.editor}
            showToolbar={true}
          />
        </Group>

        <Group name="Actions">
          <View style={styles.buttonRow}>
            <Button title="Set Sample Content" onPress={handleSetContent} />
            <Button title="Get Content" onPress={handleGetContent} />
          </View>
          <View style={styles.buttonRow}>
            <Button title="Insert Image" onPress={handleInsertImage} />
            <Button title="Add Link" onPress={handleAddLink} />
          </View>
        </Group>
        
        <Group name="Events">
          <Text>Last content change:</Text>
          <Text style={styles.eventText}>{onChangePayload?.content || 'No changes yet'}</Text>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    color: '#333',
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold' as const,
    color: '#444',
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  editor: {
    height: 300,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginBottom: 10,
  },
  eventText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 4,
    marginTop: 8,
    fontFamily: 'monospace',
  },
};
