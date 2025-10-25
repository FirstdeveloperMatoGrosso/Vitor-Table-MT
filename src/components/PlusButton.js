import React from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import colors from '../theme/colors';

export default function PlusButton({ onPress, disabled }) {
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.button, 
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed
      ]}
      disabled={disabled}
      android_ripple={{ color: 'transparent' }}
      focusable={Platform.OS !== 'web'}
      onFocus={event => {
        if (Platform.OS === 'web') {
          event.preventDefault();
          event.target.blur();
        }
      }}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    outlineStyle: 'none',
    WebkitTapHighlightColor: 'transparent',
    overflow: 'hidden'
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.5
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
    backgroundColor: colors.primary
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600'
  },
  textDisabled: {
    color: '#999999'
  }
});
