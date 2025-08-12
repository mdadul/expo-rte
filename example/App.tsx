import React, { useState, useRef, useEffect } from 'react';
import * as ExpoRTE from 'expo-rte';
import { RichTextEditor, RichTextEditorRef, ToolbarConfig, ToolbarButton } from 'expo-rte';
import { Button, SafeAreaView, ScrollView, Text, View, Alert, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import TestFormatting from './TestFormatting';

export default function App() {
  const [content, setContent] = useState('<p>Welcome to the <strong>Rich Text Editor</strong>!</p><p>Try selecting text and using the formatting buttons above.</p>');
  const [lastChange, setLastChange] = useState<string>('No changes yet');
  const [showTest, setShowTest] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'basic' | 'wordpress' | 'samsung' | 'gutenberg'>('basic');
  const rteRef = useRef<RichTextEditorRef>(null);

  // Professional toolbar configurations inspired by modern editors
  const wordPressToolbarConfig: ToolbarConfig = {
    adaptive: true,
    groupButtons: true,
    density: 'comfortable',
    showLabels: false,
    buttons: [
      { type: 'bold', icon: '𝐁', label: 'Bold', group: 'format' },
      { type: 'italic', icon: '𝐼', label: 'Italic', group: 'format' },
      { type: 'underline', icon: 'U', label: 'Underline', group: 'format' },
      { type: 'strikethrough', icon: 'S̶', label: 'Strike', group: 'format' },
      { type: 'bullet', icon: '⁃', label: 'Bullet List', group: 'list' },
      { type: 'numbered', icon: '№', label: 'Numbered List', group: 'list' },
      { type: 'link', icon: '🔗', label: 'Link', value: 'https://expo.dev', group: 'insert' },
      { type: 'undo', icon: '↶', label: 'Undo', group: 'action' },
      { type: 'redo', icon: '↷', label: 'Redo', group: 'action' },
    ],
  };

  const samsungNotesConfig: ToolbarConfig = {
    adaptive: true,
    density: 'compact',
    scrollable: true,
    maxButtons: 8,
    buttons: [
      { type: 'bold', icon: 'B', label: 'Bold', group: 'format' },
      { type: 'italic', icon: 'I', label: 'Italic', group: 'format' },
      { type: 'underline', icon: 'U̲', label: 'Underline', group: 'format' },
      { type: 'bullet', icon: '•', label: 'Bullets', group: 'list' },
      { type: 'numbered', icon: '1.', label: 'Numbers', group: 'list' },
      { type: 'undo', icon: '⟲', label: 'Undo', group: 'action' },
      { type: 'redo', icon: '⟳', label: 'Redo', group: 'action' },
    ],
  };

  const gutenbergConfig: ToolbarConfig = {
    adaptive: true,
    groupButtons: true,
    density: 'comfortable',
    showLabels: false,
    buttons: [
      { type: 'bold', icon: '𝐁', label: 'Bold', group: 'format' },
      { type: 'italic', icon: '𝐼', label: 'Italic', group: 'format' },
      { type: 'link', icon: '🔗', label: 'Link', value: 'https://wordpress.org', group: 'insert' },
      { type: 'bullet', icon: '◦', label: 'Bullet List', group: 'list' },
      { type: 'numbered', icon: '①', label: 'Numbered List', group: 'list' },
      { type: 'undo', icon: '↶', label: 'Undo', group: 'action' },
      { type: 'redo', icon: '↷', label: 'Redo', group: 'action' },
    ],
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
        <View style={styles.headerSection}>
          <TouchableOpacity 
            style={styles.devButton} 
            onPress={() => setShowTest(false)}
          >
            <Text style={styles.devButtonText}>← Back to Main Demo</Text>
          </TouchableOpacity>
        </View>
        <TestFormatting />
      </SafeAreaView>
    );
  }

  const renderDemoSelector = () => (
    <View style={styles.demoSelector}>
      <Text style={styles.demoSelectorTitle}>🎨 Editor Styles</Text>
      <Text style={styles.demoSelectorSubtitle}>Choose an editor style inspired by popular apps</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.demoScrollView}>
        <View style={styles.demoButtons}>
          <TouchableOpacity
            style={[styles.demoCard, currentDemo === 'basic' && styles.demoCardActive]}
            onPress={() => setCurrentDemo('basic')}
          >
            <Text style={styles.demoCardIcon}>📝</Text>
            <Text style={[styles.demoCardTitle, currentDemo === 'basic' && styles.demoCardTitleActive]}>
              Basic
            </Text>
            <Text style={styles.demoCardDesc}>Simple & Clean</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.demoCard, currentDemo === 'wordpress' && styles.demoCardActive]}
            onPress={() => setCurrentDemo('wordpress')}
          >
            <Text style={styles.demoCardIcon}>🌐</Text>
            <Text style={[styles.demoCardTitle, currentDemo === 'wordpress' && styles.demoCardTitleActive]}>
              WordPress
            </Text>
            <Text style={styles.demoCardDesc}>Block Editor Style</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.demoCard, currentDemo === 'samsung' && styles.demoCardActive]}
            onPress={() => setCurrentDemo('samsung')}
          >
            <Text style={styles.demoCardIcon}>📱</Text>
            <Text style={[styles.demoCardTitle, currentDemo === 'samsung' && styles.demoCardTitleActive]}>
              Samsung
            </Text>
            <Text style={styles.demoCardDesc}>Notes App Style</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.demoCard, currentDemo === 'gutenberg' && styles.demoCardActive]}
            onPress={() => setCurrentDemo('gutenberg')}
          >
            <Text style={styles.demoCardIcon}>✍️</Text>
            <Text style={[styles.demoCardTitle, currentDemo === 'gutenberg' && styles.demoCardTitleActive]}>
              Gutenberg
            </Text>
            <Text style={styles.demoCardDesc}>WordPress Editor</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const getToolbarConfig = () => {
    switch (currentDemo) {
      case 'wordpress':
        return wordPressToolbarConfig;
      case 'samsung':
        return samsungNotesConfig;
      case 'gutenberg':
        return gutenbergConfig;
      default:
        return undefined;
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerSection}>
            <Text style={styles.header}>Rich Text Editor</Text>
            <Text style={styles.subtitle}>Professional editor with adaptive toolbars</Text>
            
            <TouchableOpacity 
              style={styles.devButton} 
              onPress={() => setShowTest(true)}
            >
              <Text style={styles.devButtonText}>⚡ Developer Testing</Text>
            </TouchableOpacity>
          </View>

          {renderDemoSelector()}
          
          <View style={styles.editorSection}>
            <View style={styles.editorHeader}>
              <Text style={styles.editorTitle}>
                {currentDemo === 'basic' ? 'Default Editor' :
                 currentDemo === 'wordpress' ? 'WordPress Block Editor Style' :
                 currentDemo === 'samsung' ? 'Samsung Notes Style' :
                 'Gutenberg Editor Style'}
              </Text>
              <Text style={styles.editorFeatures}>
                {currentDemo === 'basic' ? 'Standard formatting options' :
                 currentDemo === 'wordpress' ? 'Adaptive • Grouped • Comfortable density' :
                 currentDemo === 'samsung' ? 'Adaptive • Compact • Scrollable' :
                 'Adaptive • Grouped • Block-style'}
              </Text>
            </View>
            
            <RichTextEditor
              ref={rteRef}
              content={content}
              placeholder={`✨ Start writing with ${currentDemo === 'basic' ? 'basic' : currentDemo} editor style...\n\nSelect text to format it, or use the toolbar above.`}
              onChange={({ nativeEvent }) => {
                console.log('Content changed:', nativeEvent.content);
              }}
              style={styles.editor}
              showToolbar={true}
              toolbarConfig={getToolbarConfig()}
            />
          </View>

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
    backgroundColor: '#f1f3f4',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  
  // Header Section
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8eaed',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  devButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  devButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Demo Selector
  demoSelector: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  demoSelectorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoSelectorSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  demoScrollView: {
    marginHorizontal: -8,
  },
  demoButtons: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  demoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  demoCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  demoCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  demoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  demoCardTitleActive: {
    color: '#3b82f6',
  },
  demoCardDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },

  // Editor Section
  editorSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  editorHeader: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fafbfc',
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  editorFeatures: {
    fontSize: 14,
    color: '#6b7280',
  },
  editor: {
    minHeight: 300,
  },

  // Other components
  group: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  contentPreview: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
});
