import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import PlusButton from './PlusButton';
import colors from '../theme/colors';

export default function ProductItem({ item, onAdd, isGridMode }) {
  const isOutOfStock = item.stock === 0;
  
  // Usar layout de grade para ambos os modos
  return (
    <View style={[styles.gridContainer, isOutOfStock && styles.containerOutOfStock]}>
      <View style={styles.gridImageContainer}>
        <Text style={styles.gridImage}>{item.image}</Text>
      </View>
      <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.gridDescription} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.gridPrice}>R$ {item.price.toFixed(2).replace('.', ',')}</Text>
      <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeEmpty]}>
        <Text style={[styles.stockText, isOutOfStock && styles.stockTextEmpty]}>
          {isOutOfStock ? 'Esgotado' : `Est: ${item.stock}`}
        </Text>
      </View>
      <View style={styles.gridButtonContainer}>
        <PlusButton onPress={() => onAdd(item)} disabled={isOutOfStock} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF'
  },
  containerOutOfStock: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5'
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  image: {
    fontSize: 32
  },
  info: {
    flex: 1,
    marginRight: 12
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  description: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  price: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700'
  },
  stockBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22C55E',
    marginBottom: 4
  },
  stockBadgeEmpty: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444'
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E'
  },
  stockTextEmpty: {
    color: '#EF4444'
  },
  gridContainer: {
    flex: 1,
    margin: 6,
    maxWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 120
  },
  gridImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  gridImage: {
    fontSize: 20
  },
  gridName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center'
  },
  gridDescription: {
    fontSize: 10,
    color: colors.muted,
    marginBottom: 8,
    textAlign: 'center',
    height: 30
  },
  gridPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 2
  },
  gridButtonContainer: {
    marginTop: 2
  }
});
