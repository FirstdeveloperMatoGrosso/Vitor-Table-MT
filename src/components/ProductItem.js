import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PlusButton from './PlusButton';
import colors from '../theme/colors';

export default function ProductItem({ item, onAdd }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
      </View>
      <PlusButton onPress={() => onAdd(item)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  price: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600'
  }
});
