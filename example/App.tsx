import React, { useState, useRef, useEffect } from 'react';
import * as ExpoRTE from 'expo-rte';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';
import { Button, SafeAreaView, ScrollView, Text, View, Alert, TouchableOpacity } from 'react-native';
import TestFormatting from './TestFormatting';

export default function App() {
  const [content, setContent] = useState('<p>Welcome to the <strong>Rich Text Editor</strong>!</p><p>Try selecting text and using the formatting buttons above.</p>');
  const [lastChange, setLastChange] = useState<string>('No changes yet');
  const [showTest, setShowTest] = useState(false);
  const rteRef = useRef<RichTextEditorRef>(null);
  
  useEffect(() => {
    const subscription = ExpoRTE.addChangeListener(({ content }) => {
      setLastChange(content);
    });

    return () => subscription.remove();
  }, []);

  const handleSetContent = async () => {
    await rteRef.current?.setContent('<p>This is <em>newly set</em> content with <strong>formatting</strong>!</p>');
  };

  const handleGetContent = async () => {
    const currentContent = await rteRef.current?.getContent();
    Alert.alert('Current Content', currentContent || 'No content');
  };

  const handleAddLink = async () => {
    await rteRef.current?.format('link', 'https://expo.dev');
  };

  const testDirectFormat = async () => {
    try {
      console.log('Testing direct format calls...');
      await ExpoRTE.format('bold', null);
      console.log('Direct bold format: SUCCESS');
      await ExpoRTE.format('italic', null);
      console.log('Direct italic format: SUCCESS');
      await ExpoRTE.format('link', 'https://expo.dev');
      console.log('Direct link format: SUCCESS');
    } catch (error) {
      console.error('Direct format test failed:', error);
    }
  };

  if (showTest) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.switchContainer}>
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => setShowTest(false)}
          >
            <Text style={styles.switchButtonText}>← Back to Main Demo</Text>
          </TouchableOpacity>
        </View>
        <TestFormatting />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Expo Rich Text Editor</Text>
        
        <View style={styles.switchContainer}>
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => setShowTest(true)}
          >
            <Text style={styles.switchButtonText}>Go to Formatting Test →</Text>
          </TouchableOpacity>
        </View>
        
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
            <Button title="Add Link" onPress={handleAddLink} />
            <Button title="Test Direct Format" onPress={testDirectFormat} />
          </View>
        </Group>
        
        <Group name="Events">
          <Text>Last content change:</Text>
          <Text style={styles.eventText}>{lastChange}</Text>
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
  switchContainer: {
    padding: 10,
    alignItems: 'center',
  },
  switchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
