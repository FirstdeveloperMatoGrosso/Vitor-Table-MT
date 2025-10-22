import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen({ onNavigate }) {
  const handleOpenTable = () => {
    onNavigate('Login');
  };

  const handleOpenTables = () => {
    onNavigate('OpenTables');
  };

  const handleBuyChips = () => {
    onNavigate('BuyChips');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🍽️</Text>
        <Text style={styles.title}>Cloe</Text>
        <Text style={styles.subtitle}>Comanda Eletrônica</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <PrimaryButton
          title="Abrir Mesa"
          onPress={handleOpenTable}
          style={styles.button}
        />
        <PrimaryButton
          title="Mesas Abertas"
          onPress={handleOpenTables}
          style={[styles.button, styles.secondaryButton]}
        />
        <PrimaryButton
          title="Comprar Fichas"
          onPress={handleBuyChips}
          style={[styles.button, styles.tertiaryButton]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerVersion}>v1.0.0</Text>
        <Text style={styles.footerQuote}>As grandes ideias surgem da observacao dos pequenos detalhes.</Text>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Entre em Contato</Text>
          <Text style={styles.contactCompany}>Rodrigo Dev MT</Text>
          <Text style={styles.contactText}>Mato Grosso, Brasil</Text>
          <Text style={styles.contactHighlight}>(66) 99225-8469  ·  (45) 99104-6021</Text>
          <Text style={styles.contactText}>developer@rodrigodevmt.com.br</Text>
          <Text style={styles.contactText}>rodrigodev@yahoo.com</Text>
          <Text style={styles.contactSchedule}>Segunda - Sexta: 8h às 18h</Text>
          <Text style={styles.contactSchedule}>Sábado: 8h às 12h</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20
  },
  logo: {
    fontSize: 80,
    marginBottom: 16
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: '500'
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
    marginBottom: 20
  },
  button: {
    marginBottom: 0
  },
  secondaryButton: {
    backgroundColor: colors.accent
  },
  tertiaryButton: {
    backgroundColor: '#6B7280'
  },
  footer: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.08)'
  },
  footerVersion: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: '600'
  },
  footerQuote: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500'
  },
  contactSection: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 4
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent
  },
  contactCompany: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  contactText: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center'
  },
  contactHighlight: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center'
  },
  contactSchedule: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center'
  }
});
