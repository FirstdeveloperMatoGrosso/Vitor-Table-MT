import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

const CHIP_PACKAGES = [
  { id: '1', amount: 50, price: 50.00, popular: false },
  { id: '2', amount: 100, price: 90.00, popular: true },
  { id: '3', amount: 200, price: 160.00, popular: false },
  { id: '4', amount: 500, price: 350.00, popular: false }
];

export default function BuyChipsScreen({ onNavigate }) {
  const [selectedPackage, setSelectedPackage] = useState(null);

  const handleBack = () => {
    onNavigate('Home');
  };

  const handleBuy = () => {
    if (selectedPackage) {
      alert(`Compra de ${selectedPackage.amount} fichas por R$ ${selectedPackage.price.toFixed(2)}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Comprar Fichas</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Escolha um pacote</Text>

        <View style={styles.packagesContainer}>
          {CHIP_PACKAGES.map(pkg => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                selectedPackage?.id === pkg.id && styles.packageCardActive,
                pkg.popular && styles.packageCardPopular
              ]}
              onPress={() => setSelectedPackage(pkg)}
            >
              {pkg.popular && <Text style={styles.popularBadge}>Popular</Text>}
              <Text style={styles.packageAmount}>{pkg.amount}</Text>
              <Text style={styles.packageLabel}>fichas</Text>
              <Text style={styles.packagePrice}>R$ {pkg.price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedPackage && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>Resumo da compra:</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>{selectedPackage.amount} fichas</Text>
              <Text style={styles.summaryPrice}>R$ {selectedPackage.price.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <PrimaryButton
          title={selectedPackage ? 'Confirmar Compra' : 'Selecione um pacote'}
          onPress={handleBuy}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: '600'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  content: {
    flex: 1,
    padding: 16
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16
  },
  packagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24
  },
  packageCard: {
    width: (width - 48) / 2,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border
  },
  packageCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF5F0'
  },
  packageCardPopular: {
    borderColor: colors.primary
  },
  popularBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8
  },
  packageAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  packageLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary
  },
  summaryContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryText: {
    fontSize: 14,
    color: colors.text
  },
  summaryPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary
  },
  button: {
    marginTop: 'auto'
  }
});
