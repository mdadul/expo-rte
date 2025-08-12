import React, { useState, useRef, useEffect } from 'react';
import * as ExpoRTE from 'expo-rte';
import { RichTextEditor, RichTextEditorRef, ToolbarConfig, ToolbarButton } from 'expo-rte';
import { Button, SafeAreaView, ScrollView, Text, View, Alert, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import TestFormatting from './TestFormatting';

export default function App() {
  const [content, setContent] = useState('<p>Welcome to the <strong>Rich Text Editor</strong>!</p><p>Try selecting text and using the formatting buttons above.</p>');
  const [lastChange, setLastChange] = useState<string>('No changes yet');
  const [showTest, setShowTest] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'basic' | 'custom' | 'grouped'>('basic');
  const rteRef = useRef<RichTextEditorRef>(null);

  // Custom toolbar configurations for demos
  const customToolbarConfig: ToolbarConfig = {
    scrollable: true,
    showLabels: true,
    buttons: [
      { type: 'bold', icon: '𝐁', label: 'Bold', group: 'format' },
      { type: 'italic', icon: '𝐼', label: 'Italic', group: 'format' },
      { type: 'underline', icon: '𝐔', label: 'Under', group: 'format' },
      { type: 'bullet', icon: '●', label: 'List', group: 'list' },
      { type: 'link', icon: '🔗', label: 'Link', value: 'https://expo.dev', group: 'insert' },
      { type: 'undo', icon: '↶', label: 'Undo', group: 'action' },
      { type: 'redo', icon: '↷', label: 'Redo', group: 'action' },
    ],
    buttonStyle: {
      backgroundColor: '#007AFF',
      borderColor: '#0056CC',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    buttonTextStyle: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
  };

  const groupedToolbarConfig: ToolbarConfig = {
    groupButtons: true,
    scrollable: true,
    buttons: [
      { type: 'bold', icon: 'B', group: 'format' },
      { type: 'italic', icon: 'I', group: 'format' },
      { type: 'underline', icon: 'U', group: 'format' },
      { type: 'strikethrough', icon: 'S', group: 'format' },
      { type: 'bullet', icon: '•', group: 'list' },
      { type: 'numbered', icon: '1.', group: 'list' },
      { type: 'undo', icon: '⟲', group: 'action' },
      { type: 'redo', icon: '⟳', group: 'action' },
    ],
    style: {
      backgroundColor: '#f0f8ff',
      borderBottomColor: '#4169e1',
    },
  };
  
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
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => setShowTest(false)}
          >
            <Text style={styles.navButtonText}>← Back to Main Demo</Text>
          </TouchableOpacity>
        </View>
        <TestFormatting />
      </SafeAreaView>
    );
  }

  const renderDemoSelector = () => (
    <View style={styles.demoSelector}>
      <Text style={styles.demoSelectorTitle}>Toolbar Demos</Text>
      <View style={styles.demoButtons}>
        <TouchableOpacity
          style={[styles.demoButton, currentDemo === 'basic' && styles.demoButtonActive]}
          onPress={() => setCurrentDemo('basic')}
        >
          <Text style={[styles.demoButtonText, currentDemo === 'basic' && styles.demoButtonTextActive]}>
            Basic
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.demoButton, currentDemo === 'custom' && styles.demoButtonActive]}
          onPress={() => setCurrentDemo('custom')}
        >
          <Text style={[styles.demoButtonText, currentDemo === 'custom' && styles.demoButtonTextActive]}>
            Custom
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.demoButton, currentDemo === 'grouped' && styles.demoButtonActive]}
          onPress={() => setCurrentDemo('grouped')}
        >
          <Text style={[styles.demoButtonText, currentDemo === 'grouped' && styles.demoButtonTextActive]}>
            Grouped
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getToolbarConfig = () => {
    switch (currentDemo) {
      case 'custom':
        return customToolbarConfig;
      case 'grouped':
        return groupedToolbarConfig;
      default:
        return undefined;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.header}>📝 Rich Text Editor</Text>
          <Text style={styles.subtitle}>Expo module with customizable toolbar</Text>
          
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={styles.navButton} 
              onPress={() => setShowTest(true)}
            >
              <Text style={styles.navButtonText}>🧪 Advanced Testing</Text>
            </TouchableOpacity>
          </View>

          {renderDemoSelector()}
          
          <Group name={`${currentDemo.charAt(0).toUpperCase() + currentDemo.slice(1)} Toolbar Demo`}>
            <RichTextEditor
              ref={rteRef}
              content={content}
              placeholder="Start typing your rich text here... Select text and use the toolbar buttons above to format it."
              onChange={({ nativeEvent }) => {
                console.log('Content changed:', nativeEvent.content);
              }}
              style={styles.editor}
              showToolbar={true}
              toolbarConfig={getToolbarConfig()}
            />
          </Group>

          <Group name="Quick Actions">
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.actionButton} onPress={handleSetContent}>
                <Text style={styles.actionButtonIcon}>📄</Text>
                <Text style={styles.actionButtonText}>Set Sample</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleGetContent}>
                <Text style={styles.actionButtonIcon}>📋</Text>
                <Text style={styles.actionButtonText}>Get Content</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddLink}>
                <Text style={styles.actionButtonIcon}>🔗</Text>
                <Text style={styles.actionButtonText}>Add Link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={testDirectFormat}>
                <Text style={styles.actionButtonIcon}>⚡</Text>
                <Text style={styles.actionButtonText}>Test API</Text>
              </TouchableOpacity>
            </View>
          </Group>
          
          <Group name="Live Content">
            <Text style={styles.contentLabel}>HTML Output:</Text>
            <ScrollView style={styles.contentPreview} horizontal>
              <Text style={styles.contentText}>{lastChange}</Text>
            </ScrollView>
          </Group>
        </ScrollView>
      </SafeAreaView>
    </>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212529',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  navigationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  demoSelector: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  demoButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  demoButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0056CC',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  demoButtonTextActive: {
    color: '#fff',
  },
  group: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 16,
  },
  editor: {
    height: 320,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  contentPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  contentText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});
