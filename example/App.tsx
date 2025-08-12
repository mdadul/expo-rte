import React, { useState, useRef } from 'react';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';
import { SafeAreaView, ScrollView, Text, View, StyleSheet, StatusBar, Platform } from 'react-native';



export default function App() {
  const [content, setContent] = useState('<p>Welcome to the <strong>Rich Text Editor</strong>!</p><p>Try selecting text and using the formatting buttons above.</p>');
  const rteRef = useRef<RichTextEditorRef>(null);

  const handleContentChange = ({ nativeEvent }: { nativeEvent: { content: string } }) => {
    setContent(nativeEvent.content);
  };



  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerSection}>
            <Text style={styles.header}>📝 Rich Text Editor</Text>
            <Text style={styles.subtitle}>Professional rich text editing for React Native</Text>
          </View>

          <View style={styles.editorSection}>
            <RichTextEditor
              ref={rteRef}
              content={content}
              placeholder="✨ Start typing your story here...

Try formatting your text:
• Select text and use bold/italic
• Create bullet lists  
• Add links and more!"
              onChange={handleContentChange}
              style={styles.editor}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8eaed',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },

  // Editor Section
  editorSection: {
    marginHorizontal: 16,
    marginTop: 24,
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
  editor: {
    minHeight: 400,
  },
});
