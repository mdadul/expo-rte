import React, { useImperativeHandle, forwardRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ExpoRTEView from './ExpoRTEView';
import ExpoRTEModule from './ExpoRTEModule';
import { ExpoRTEViewProps, FormatType } from './ExpoRTE.types';

export interface RichTextEditorRef {
  setContent: (content: string) => Promise<void>;
  getContent: () => Promise<string>;
  format: (type: FormatType, value?: any) => Promise<void>;
  insertImage: (uri: string, width?: number, height?: number) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

interface RichTextEditorProps extends ExpoRTEViewProps {
  showToolbar?: boolean;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ showToolbar = true, style, ...props }, ref) => {

    useImperativeHandle(ref, () => ({
      setContent: (content: string) => ExpoRTEModule.setContent(content),
      getContent: () => ExpoRTEModule.getContent(),
      format: (type: FormatType, value?: any) => ExpoRTEModule.format(type, value),
      insertImage: (uri: string, width?: number, height?: number) => 
        ExpoRTEModule.insertImage(uri, width, height),
      undo: () => ExpoRTEModule.undo(),
      redo: () => ExpoRTEModule.redo(),
    }));

    const handleFormat = (type: FormatType, value?: any) => {
      ExpoRTEModule.format(type, value);
    };

    const renderToolbar = () => (
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => handleFormat('bold')}
        >
          <Text style={styles.toolbarButtonText}>B</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => handleFormat('italic')}
        >
          <Text style={[styles.toolbarButtonText, { fontStyle: 'italic' }]}>I</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => handleFormat('underline')}
        >
          <Text style={[styles.toolbarButtonText, { textDecorationLine: 'underline' }]}>U</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => handleFormat('strikethrough')}
        >
          <Text style={[styles.toolbarButtonText, { textDecorationLine: 'line-through' }]}>S</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => handleFormat('bullet')}
        >
          <Text style={styles.toolbarButtonText}>•</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => handleFormat('numbered')}
        >
          <Text style={styles.toolbarButtonText}>1.</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => ExpoRTEModule.undo()}
        >
          <Text style={styles.toolbarButtonText}>⟲</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => ExpoRTEModule.redo()}
        >
          <Text style={styles.toolbarButtonText}>⟳</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={[styles.container, style]}>
        {showToolbar && renderToolbar()}
        <ExpoRTEView
          style={styles.editor}
          {...props}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  editor: {
    flex: 1,
  },
});

export default RichTextEditor;