import React, { useImperativeHandle, forwardRef, ReactNode, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, ViewStyle, TextStyle, Dimensions, Platform } from 'react-native';
import ExpoRTEView from './ExpoRTEView';
import ExpoRTEModule from './ExpoRTEModule';
import { ExpoRTEViewProps, FormatType } from './ExpoRTE.types';

export interface RichTextEditorRef {
  setContent: (content: string) => Promise<void>;
  getContent: () => Promise<string>;
  format: (type: FormatType, value?: any) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
}

export interface ToolbarButton {
  type: FormatType;
  icon: string | ReactNode;
  label?: string;
  value?: any;
  group?: 'format' | 'list' | 'action' | 'insert';
}

export interface ToolbarConfig {
  buttons?: ToolbarButton[];
  style?: ViewStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  scrollable?: boolean;
  showLabels?: boolean;
  groupButtons?: boolean;
  adaptive?: boolean;
  compactMode?: boolean;
  maxButtons?: number;
  density?: 'comfortable' | 'compact' | 'dense';
}

interface RichTextEditorProps extends ExpoRTEViewProps {
  showToolbar?: boolean;
  toolbarConfig?: ToolbarConfig;
  customToolbar?: ReactNode;
}

// Default toolbar configuration
const defaultToolbarButtons: ToolbarButton[] = [
  { type: 'bold', icon: 'B', label: 'Bold', group: 'format' },
  { type: 'italic', icon: 'I', label: 'Italic', group: 'format' },
  { type: 'underline', icon: 'U', label: 'Underline', group: 'format' },
  { type: 'strikethrough', icon: 'S', label: 'Strike', group: 'format' },
  { type: 'bullet', icon: '•', label: 'Bullet', group: 'list' },
  { type: 'numbered', icon: '1.', label: 'Number', group: 'list' },
  { type: 'undo', icon: '⟲', label: 'Undo', group: 'action' },
  { type: 'redo', icon: '⟳', label: 'Redo', group: 'action' },
];

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ showToolbar = true, toolbarConfig, customToolbar, style, ...props }, ref) => {
    const [screenData, setScreenData] = useState(Dimensions.get('window'));
    const [activeFormats, setActiveFormats] = useState<Set<FormatType>>(new Set());

    useEffect(() => {
      const onChange = (result: { window: any }) => {
        setScreenData(result.window);
      };
      
      const subscription = Dimensions.addEventListener('change', onChange);
      return () => subscription?.remove();
    }, []);

    const isTablet = screenData.width >= 768;
    const isLandscape = screenData.width > screenData.height;
    const isSmallScreen = screenData.width < 400;

    useImperativeHandle(ref, () => ({
      setContent: (content: string) => ExpoRTEModule.setContent(content),
      getContent: () => ExpoRTEModule.getContent(),
      format: (type: FormatType, value?: any) => {
        if (value !== undefined && value !== null) {
          return ExpoRTEModule.format(type, value);
        } else {
          return ExpoRTEModule.formatSimple(type);
        }
      },
      undo: () => ExpoRTEModule.undo(),
      redo: () => ExpoRTEModule.redo(),
    }));

    const handleFormat = (type: FormatType, value?: any) => {
      if (type === 'undo') {
        ExpoRTEModule.undo();
      } else if (type === 'redo') {
        ExpoRTEModule.redo();
      } else if (value !== undefined && value !== null) {
        ExpoRTEModule.format(type, value);
      } else {
        ExpoRTEModule.formatSimple(type);
      }
    };

    const getDensityStyles = () => {
      const density = toolbarConfig?.density || 'comfortable';
      switch (density) {
        case 'compact':
          return {
            buttonPadding: isSmallScreen ? 6 : 8,
            buttonMinWidth: isSmallScreen ? 28 : 32,
            fontSize: isSmallScreen ? 14 : 15,
            spacing: 4,
          };
        case 'dense':
          return {
            buttonPadding: isSmallScreen ? 4 : 6,
            buttonMinWidth: isSmallScreen ? 24 : 28,
            fontSize: isSmallScreen ? 12 : 14,
            spacing: 2,
          };
        default: // comfortable
          return {
            buttonPadding: isSmallScreen ? 8 : 12,
            buttonMinWidth: isSmallScreen ? 36 : 44,
            fontSize: isSmallScreen ? 16 : 18,
            spacing: isSmallScreen ? 4 : 6,
          };
      }
    };

    const renderButton = (button: ToolbarButton, index: number) => {
      const densityStyles = getDensityStyles();
      const isActive = activeFormats.has(button.type);
      
      const buttonStyles = [
        styles.toolbarButton,
        {
          paddingHorizontal: densityStyles.buttonPadding,
          paddingVertical: densityStyles.buttonPadding,
          minWidth: densityStyles.buttonMinWidth,
          marginRight: densityStyles.spacing,
        },
        isActive && styles.toolbarButtonActive,
        toolbarConfig?.buttonStyle,
        isActive && toolbarConfig?.buttonStyle && {
          backgroundColor: '#007AFF',
          borderColor: '#0056CC',
        },
      ];

      const textStyles = [
        styles.toolbarButtonText,
        {
          fontSize: densityStyles.fontSize,
        },
        // Apply special styles for certain button types
        button.type === 'italic' && { fontStyle: 'italic' as const },
        button.type === 'underline' && { textDecorationLine: 'underline' as const },
        button.type === 'strikethrough' && { textDecorationLine: 'line-through' as const },
        button.type === 'bold' && { fontWeight: 'bold' as const },
        isActive && styles.toolbarButtonTextActive,
        toolbarConfig?.buttonTextStyle,
        isActive && { color: '#FFFFFF' },
      ].filter(Boolean);

      const showLabel = toolbarConfig?.showLabels && button.label && !isSmallScreen;

      return (
        <TouchableOpacity
          key={`${button.type}-${index}`}
          style={buttonStyles}
          onPress={() => {
            handleFormat(button.type, button.value);
            // Toggle active state for visual feedback
            const newActiveFormats = new Set(activeFormats);
            if (isActive) {
              newActiveFormats.delete(button.type);
            } else {
              newActiveFormats.add(button.type);
            }
            setActiveFormats(newActiveFormats);
          }}
          accessibilityLabel={button.label || button.type}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          activeOpacity={0.7}
        >
          {typeof button.icon === 'string' ? (
            <Text style={textStyles}>{button.icon}</Text>
          ) : (
            button.icon
          )}
          {showLabel && (
            <Text style={[styles.toolbarButtonLabel, { fontSize: densityStyles.fontSize - 4 }]}>
              {button.label}
            </Text>
          )}
        </TouchableOpacity>
      );
    };

    const renderToolbarGroup = (buttons: ToolbarButton[], groupName: string) => {
      if (buttons.length === 0) return null;
      
      return (
        <View key={groupName} style={styles.toolbarGroup}>
          {buttons.map(renderButton)}
        </View>
      );
    };

    const renderToolbar = () => {
      if (customToolbar) {
        return customToolbar;
      }

      const buttons = toolbarConfig?.buttons || defaultToolbarButtons;
      
      // Separate container styles from content styles for ScrollView compatibility
      const containerStyle = [
        styles.toolbarContainer,
        toolbarConfig?.style && {
          backgroundColor: toolbarConfig.style.backgroundColor,
          borderBottomWidth: toolbarConfig.style.borderBottomWidth,
          borderBottomColor: toolbarConfig.style.borderBottomColor,
          borderTopLeftRadius: toolbarConfig.style.borderTopLeftRadius,
          borderTopRightRadius: toolbarConfig.style.borderTopRightRadius,
        }
      ];
      
      const contentStyle = [
        styles.toolbarContent,
        toolbarConfig?.style && {
          flexDirection: toolbarConfig.style.flexDirection,
          alignItems: toolbarConfig.style.alignItems,
          paddingHorizontal: toolbarConfig.style.paddingHorizontal,
          paddingVertical: toolbarConfig.style.paddingVertical,
        }
      ];

      if (toolbarConfig?.groupButtons) {
        const groupedButtons = buttons.reduce((groups, button, index) => {
          const group = button.group || 'default';
          if (!groups[group]) groups[group] = [];
          groups[group].push({ ...button, originalIndex: index });
          return groups;
        }, {} as Record<string, (ToolbarButton & { originalIndex: number })[]>);

        const content = Object.entries(groupedButtons).map(([groupName, groupButtons]) =>
          renderToolbarGroup(groupButtons, groupName)
        );

        return toolbarConfig?.scrollable ? (
          <View style={containerStyle}>
            <ScrollView 
              horizontal 
              contentContainerStyle={contentStyle}
              showsHorizontalScrollIndicator={false}
            >
              {content}
            </ScrollView>
          </View>
        ) : (
          <View style={[containerStyle, contentStyle]}>
            {content}
          </View>
        );
      }

      const content = buttons.map(renderButton);

      return toolbarConfig?.scrollable ? (
        <View style={containerStyle}>
          <ScrollView 
            horizontal 
            contentContainerStyle={contentStyle}
            showsHorizontalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        </View>
      ) : (
        <View style={[containerStyle, contentStyle]}>
          {content}
        </View>
      );
    };

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
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolbarContainer: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  toolbarContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    paddingRight: 12,
  },
  toolbarGroup: {
    flexDirection: 'row',
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  toolbarButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toolbarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  toolbarButtonLabel: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
    textAlign: 'center',
  },
  editor: {
    flex: 1,
    minHeight: 200,
  },
});

export default RichTextEditor;