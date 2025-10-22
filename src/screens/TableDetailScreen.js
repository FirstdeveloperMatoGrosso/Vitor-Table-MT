import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import colors from '../theme/colors';

export default function TableDetailScreen({ table, onNavigate }) {
  const handleBack = () => {
    onNavigate('OpenTables');
  };

  const totalProdutos = table.produtos.reduce((sum, p) => sum + (p.preco * p.quantidade), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Detalhes da Mesa {table.mesa}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{table.cliente}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{table.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{table.telefone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>CPF:</Text>
            <Text style={styles.value}>{table.cpf}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Pessoas:</Text>
            <Text style={styles.value}>{table.pessoas}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horários</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Chegada:</Text>
            <Text style={styles.value}>{table.chegada}</Text>
          </View>
          {table.saida && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Saída:</Text>
              <Text style={styles.value}>{table.saida}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, table.status === 'fechada' && styles.statusClosed]}>
              {table.status === 'fechada' ? 'Fechada' : 'Aberta'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos Vendidos</Text>
          {table.produtos.map((produto, idx) => (
            <View key={idx} style={styles.produtoRow}>
              <View style={styles.produtoInfo}>
                <Text style={styles.produtoNome}>{produto.nome}</Text>
                <Text style={styles.produtoQtd}>{produto.quantidade}x</Text>
              </View>
              <Text style={styles.produtoPreco}>R$ {(produto.preco * produto.quantidade).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {totalProdutos.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Garçons</Text>
          <View style={styles.garconList}>
            {table.garcons.map((garcon, idx) => (
              <View key={idx} style={styles.garconBadge}>
                <Text style={styles.garconText}>{garcon}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    color: colors.text,
    flex: 1,
    textAlign: 'center'
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: 16
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  value: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '500'
  },
  statusClosed: {
    color: '#DC2626',
    fontWeight: '700'
  },
  produtoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  produtoInfo: {
    flex: 1
  },
  produtoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  produtoQtd: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4
  },
  produtoPreco: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.primary
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary
  },
  garconList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  garconBadge: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  garconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  }
});
