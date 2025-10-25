import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import PrimaryButton from './PrimaryButton';
import colors from '../theme/colors';

export default function SearchBar({ value, onChangeText, onSubmit }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Pesquisar..."
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
      />
      <PrimaryButton title="Buscar" onPress={onSubmit} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 960,
    gap: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginRight: 16,
    color: colors.text,
    outlineStyle: 'none'
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24
  }
});
