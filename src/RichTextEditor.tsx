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

    const getAdaptiveButtons = (buttons: ToolbarButton[]) => {
      if (!toolbarConfig?.adaptive) return buttons;
      
      const maxButtons = toolbarConfig.maxButtons || (isSmallScreen ? 6 : isTablet ? 12 : 8);
      
      if (buttons.length <= maxButtons) return buttons;
      
      // Prioritize essential buttons for small screens
      const essentialButtons = buttons.filter(btn => 
        ['bold', 'italic', 'underline', 'undo', 'redo'].includes(btn.type)
      );
      
      const remainingSlots = maxButtons - essentialButtons.length;
      const otherButtons = buttons.filter(btn => 
        !['bold', 'italic', 'underline', 'undo', 'redo'].includes(btn.type)
      ).slice(0, remainingSlots);
      
      return [...essentialButtons, ...otherButtons];
    };

    const renderToolbar = () => {
      if (customToolbar) {
        return customToolbar;
      }

      let buttons = toolbarConfig?.buttons || defaultToolbarButtons;
      buttons = getAdaptiveButtons(buttons);
      
      // Responsive container styles
      const containerStyle = [
        styles.toolbarContainer,
        isTablet && styles.toolbarContainerTablet,
        isSmallScreen && styles.toolbarContainerSmall,
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
        isTablet && styles.toolbarContentTablet,
        isSmallScreen && styles.toolbarContentSmall,
        toolbarConfig?.style && {
          flexDirection: toolbarConfig.style.flexDirection,
          alignItems: toolbarConfig.style.alignItems,
          paddingHorizontal: toolbarConfig.style.paddingHorizontal,
          paddingVertical: toolbarConfig.style.paddingVertical,
        }
      ];

      const shouldScroll = toolbarConfig?.scrollable || 
        (toolbarConfig?.adaptive && buttons.length > (isSmallScreen ? 4 : isTablet ? 10 : 6));

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

        return shouldScroll ? (
          <View style={containerStyle}>
            <ScrollView 
              horizontal 
              contentContainerStyle={contentStyle}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={isSmallScreen ? 40 : 50}
              snapToAlignment="start"
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

      return shouldScroll ? (
        <View style={containerStyle}>
          <ScrollView 
            horizontal 
            contentContainerStyle={contentStyle}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={isSmallScreen ? 40 : 50}
            snapToAlignment="start"
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
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  
  // Toolbar Container Styles
  toolbarContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e1e5e9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  toolbarContainerTablet: {
    paddingHorizontal: 8,
  },
  toolbarContainerSmall: {
    paddingHorizontal: 4,
  },
  
  // Toolbar Content Styles
  toolbarContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 56,
  },
  toolbarContentTablet: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 64,
  },
  toolbarContentSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
  },
  
  // Toolbar Group Styles
  toolbarGroup: {
    flexDirection: 'row',
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#e1e5e9',
  },
  
  // Button Styles
  toolbarButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e1e5e9',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  toolbarButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0056CC',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  
  // Button Text Styles
  toolbarButtonText: {
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  toolbarButtonTextActive: {
    color: '#ffffff',
  },
  toolbarButtonLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Editor Styles
  editor: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#ffffff',
  },
});

export default RichTextEditor;