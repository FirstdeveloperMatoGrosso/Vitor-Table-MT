import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal, Pressable, ScrollView, Platform, TextInput } from 'react-native';
import colors from '../theme/colors';
import { useTableContext } from '../context/TableContext';

const { width } = Dimensions.get('window');

export default function OpenTablesScreen({ onNavigate, screenParams }) {
  const [isGridView, setIsGridView] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isKioskMode = false, kioskFunctions = {} } = screenParams || {};
  const { tables } = useTableContext();

  const orderedTables = useMemo(() => {
    const abertas = tables.filter(table => table.status !== 'fechada');
    const fechadas = tables.filter(table => table.status === 'fechada');
    return [...abertas, ...fechadas];
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return orderedTables;
    
    const query = searchQuery.toLowerCase();
    return orderedTables.filter(table => {
      const searchFields = [
        table.id.toString(),
        table.mesa.toString(),
        table.cliente.toLowerCase(),
        table.cpf.toLowerCase(),
        table.email.toLowerCase(),
        table.telefone.toLowerCase()
      ];
      return searchFields.some(field => field.includes(query));
    });
  }, [orderedTables, searchQuery]);

  const visibleTables = useMemo(() => {
    if (Platform.OS === 'android') {
      return filteredTables.slice(0, 3);
    }
    return filteredTables;
  }, [filteredTables]);

  const gridColumns = useMemo(() => {
    if (!isGridView) return 2;
    if (Platform.OS === 'android' && width < 768) {
      return 2;
    }
    return 4;
  }, [isGridView]);

  const selectedTable = useMemo(() => {
    if (!selectedTableId) return null;
    return tables.find(table => table.id === selectedTableId) || null;
  }, [selectedTableId, tables]);

  const handleBack = () => {
    onNavigate('Home', { isKioskMode, kioskFunctions });
  };

  const handleDetail = (table) => {
    setSelectedTableId(table.id);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTableId(null);
  };

  const handleSellProduct = (table) => {
    onNavigate('SellProduct', { tableId: table.id });
  };

  const renderTable = ({ item }) => (
    <View style={[styles.tableCard, isGridView && styles.tableCardGrid, item.status === 'fechada' && styles.tableCardClosed]}>
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.mesaNumber}>Mesa {item.mesa}</Text>
          <Text style={[styles.status, item.status === 'fechada' && styles.statusClosed]}>
            {item.status === 'fechada' ? 'Saída' : 'Aberta'}
          </Text>
        </View>
        <Text style={styles.tempo}>{item.chegada}</Text>
      </View>
      <Text style={styles.cliente}>{item.cliente}</Text>
      <Text style={styles.emailText}>{item.email}</Text>
      <Text style={styles.info}>{item.telefone}</Text>
      <Text style={styles.info}>CPF: {item.cpf}</Text>
      <Text style={styles.info}>{item.pessoas} pessoa(s)</Text>
      
      {item.produtos.length > 0 && (
        <View style={styles.produtosSection}>
          <Text style={styles.sectionTitle}>Produtos:</Text>
          {item.produtos.map((p, idx) => (
            <Text key={idx} style={styles.produtoItem}>
              - {p.nome} ({p.quantidade}x) R$ {(p.preco * p.quantidade).toFixed(2)}
            </Text>
          ))}
        </View>
      )}
      
      {item.garcons.length > 0 && (
        <View style={styles.garconSection}>
          <Text style={styles.sectionTitle}>Garçons: {item.garcons.join(', ')}</Text>
        </View>
      )}
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.detailButton} onPress={() => handleDetail(item)}>
          <Text style={styles.buttonText}>Detalhe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sellButton} onPress={() => handleSellProduct(item)}>
          <Text style={styles.buttonText}>Vender</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mesas Abertas</Text>
        <TouchableOpacity onPress={() => setIsGridView(!isGridView)}>
          <Text style={styles.viewToggle}>{isGridView ? '☰' : '⊞'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, Mesa, Nome, CPF, Email ou Telefone"
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={visibleTables}
        keyExtractor={item => item.id}
        renderItem={renderTable}
        contentContainerStyle={styles.listContent}
        numColumns={gridColumns}
        key={isGridView ? `grid-${gridColumns}` : 'list'}
        scrollEnabled={true}
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da Mesa {selectedTable?.mesa}</Text>
              <Pressable onPress={closeModal}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              {selectedTable && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Cliente</Text>
                    <Text style={styles.modalText}>{selectedTable.cliente}</Text>
                    <Text style={styles.modalEmailText}>{selectedTable.email}</Text>
                    <Text style={styles.modalText}>{selectedTable.telefone}</Text>
                    <Text style={styles.modalText}>CPF: {selectedTable.cpf}</Text>
                    <Text style={styles.modalText}>{selectedTable.pessoas} pessoa(s)</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Horários</Text>
                    <Text style={styles.modalTimeText}>Chegada: {selectedTable.chegada}</Text>
                    <Text style={styles.modalText}>Status: {selectedTable.status === 'fechada' ? 'Fechada' : 'Aberta'}</Text>
                    {selectedTable.saida && <Text style={styles.modalTimeText}>Saída: {selectedTable.saida}</Text>}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Produtos</Text>
                    {selectedTable.produtos.map((produto, idx) => (
                      <Text key={idx} style={styles.modalText}>
                        {produto.nome} ({produto.quantidade}x) - R$ {(produto.preco * produto.quantidade).toFixed(2)}
                      </Text>
                    ))}
                    <View style={styles.modalTotalRow}>
                      <Text style={styles.modalTotalLabel}>Total:</Text>
                      <Text style={styles.modalTotalValue}>
                        R$ {
                          selectedTable.produtos
                            .reduce((sum, produto) => sum + produto.preco * produto.quantidade, 0)
                            .toFixed(2)
                        }
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Garçons</Text>
                    <Text style={styles.modalText}>{selectedTable.garcons.join(', ')}</Text>
                  </View>
                </>
              )}
            </ScrollView>

            <Pressable style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clearButtonText: {
    fontSize: 18,
    color: colors.muted,
    fontWeight: '600'
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
  viewToggle: {
    fontSize: 20,
    color: colors.accent,
    fontWeight: '600'
  },
  listContent: {
    padding: 16,
    gap: 16,
    columnGap: 12
  },
  tableCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginRight: 12,
    marginBottom: 12,
    flex: 1,
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column'
  },
  tableCardGrid: {
    flex: 1,
    marginRight: 12,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 0,
    borderTopWidth: 4,
    borderTopColor: colors.primary,
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column'
  },
  tableCardClosed: {
    backgroundColor: '#FFE5E5',
    borderLeftColor: '#DC2626'
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  mesaNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  status: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4
  },
  statusClosed: {
    color: '#DC2626'
  },
  tempo: {
    fontSize: 13,
    color: colors.time,
    fontWeight: '700'
  },
  cliente: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  emailText: {
    fontSize: 12,
    color: colors.email,
    marginBottom: 2,
    fontWeight: '500'
  },
  info: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 2
  },
  pessoas: {
    fontSize: 12,
    color: colors.muted
  },
  produtosSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  produtoItem: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 2
  },
  garconSection: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
    width: '100%',
    paddingTop: 10
  },
  detailButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36
  },
  sellButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  modalClose: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: '700'
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16
  },
  modalSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8
  },
  modalText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4
  },
  modalEmailText: {
    fontSize: 13,
    color: colors.email,
    marginBottom: 4,
    fontWeight: '600'
  },
  modalTimeText: {
    fontSize: 13,
    color: colors.time,
    marginBottom: 4,
    fontWeight: '600'
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  modalTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  modalTotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
