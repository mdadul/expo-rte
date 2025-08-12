import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { RichTextEditor, RichTextEditorRef } from 'expo-rte';

const TestFormatting = () => {
  const rteRef = useRef<RichTextEditorRef>(null);

  const testFormats = [
    { name: 'Bold', type: 'bold' as const },
    { name: 'Italic', type: 'italic' as const },
    { name: 'Underline', type: 'underline' as const },
    { name: 'Strikethrough', type: 'strikethrough' as const },
    { name: 'Bullet', type: 'bullet' as const },
    { name: 'Numbered', type: 'numbered' as const },
    { name: 'Link', type: 'link' as const, value: 'https://expo.dev' },
  ];

  const handleFormat = async (type: any, value?: any) => {
    try {
      console.log(`Attempting to apply format: ${type}${value ? ` with value: ${value}` : ''}`);
      await rteRef.current?.format(type, value);
      console.log(`✅ Successfully applied format: ${type}`);
      
      // Get content after formatting to verify
      setTimeout(async () => {
        try {
          const content = await rteRef.current?.getContent();
          console.log(`Content after ${type} formatting:`, content);
        } catch (e) {
          console.error('Error getting content:', e);
        }
      }, 100);
    } catch (error) {
      console.error(`❌ Error applying format ${type}:`, error);
    }
  };

  const handleSetTestContent = async () => {
    const testContent = `
      <p>This is a <strong>bold</strong> text sample.</p>
      <p>This is an <em>italic</em> text sample.</p>
      <p>This is an <u>underlined</u> text sample.</p>
      <p>This is a <s>strikethrough</s> text sample.</p>
      <p>This is a <a href="https://expo.dev">link</a> sample.</p>
    `;
    try {
      await rteRef.current?.setContent(testContent);
      console.log('Set test content successfully');
    } catch (error) {
      console.error('Error setting test content:', error);
    }
  };

  const handleGetContent = async () => {
    try {
      const content = await rteRef.current?.getContent();
      console.log('Current content:', content);
    } catch (error) {
      console.error('Error getting content:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Formatting Test</Text>
      
      <RichTextEditor
        ref={rteRef}
        content="<p>Select text and test formatting buttons below...</p>"
        placeholder="Type something to test formatting"
        style={styles.editor}
        showToolbar={true}
      />

      <View style={styles.buttonGrid}>
        {testFormats.map((format) => (
          <TouchableOpacity
            key={format.name}
            style={styles.testButton}
            onPress={() => handleFormat(format.type, format.value)}
          >
            <Text style={styles.buttonText}>{format.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSetTestContent}>
          <Text style={styles.buttonText}>Set Test Content</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleGetContent}>
          <Text style={styles.buttonText}>Log Content</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instructions}>
        Instructions:
        {'\n'}1. Select text in the editor above
        {'\n'}2. Tap a formatting button to apply formatting
        {'\n'}3. Toggle formatting by selecting the same text and tapping the button again
        {'\n'}4. Test bullet and numbered lists by placing cursor on a line
        {'\n'}5. Use "Set Test Content" to load pre-formatted HTML
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  editor: {
    height: 200,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructions: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TestFormatting;
