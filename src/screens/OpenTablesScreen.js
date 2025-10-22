import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal, Pressable, ScrollView } from 'react-native';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

const MOCK_OPEN_TABLES = [
  {
    id: '1',
    mesa: 5,
    cliente: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    pessoas: 4,
    chegada: '14:30',
    saida: null,
    status: 'aberta',
    produtos: [
      { nome: 'Cerveja Skol', quantidade: 3, preco: 15.00 },
      { nome: 'Refrigerante', quantidade: 2, preco: 8.00 }
    ],
    garcons: ['Carlos', 'Ana']
  },
  {
    id: '2',
    mesa: 12,
    cliente: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 99876-5432',
    cpf: '987.654.321-00',
    pessoas: 6,
    chegada: '13:00',
    saida: '15:20',
    status: 'fechada',
    produtos: [
      { nome: 'Cerveja Heineken', quantidade: 5, preco: 18.00 },
      { nome: 'Chopp', quantidade: 2, preco: 25.00 },
      { nome: 'Refrigerante', quantidade: 3, preco: 8.00 }
    ],
    garcons: ['Pedro', 'Carlos', 'Ana']
  },
  {
    id: '3',
    mesa: 8,
    cliente: 'Pedro Costa',
    email: 'pedro@email.com',
    telefone: '(11) 97654-3210',
    cpf: '456.789.123-00',
    pessoas: 2,
    chegada: '15:00',
    saida: null,
    status: 'aberta',
    produtos: [
      { nome: 'Guarana', quantidade: 1, preco: 5.50 }
    ],
    garcons: ['Ana']
  },
  {
    id: '4',
    mesa: 15,
    cliente: 'Ana Oliveira',
    email: 'ana@email.com',
    telefone: '(11) 96543-2109',
    cpf: '789.123.456-00',
    pessoas: 8,
    chegada: '12:50',
    saida: '14:15',
    status: 'fechada',
    produtos: [
      { nome: 'Cerveja Brahma', quantidade: 8, preco: 14.00 },
      { nome: 'Refrigerante', quantidade: 4, preco: 8.00 }
    ],
    garcons: ['Carlos', 'Pedro']
  },
  {
    id: '5',
    mesa: 3,
    cliente: 'Carlos Mendes',
    email: 'carlos@email.com',
    telefone: '(11) 95432-1098',
    cpf: '321.654.987-00',
    pessoas: 4,
    chegada: '15:45',
    saida: null,
    status: 'aberta',
    produtos: [
      { nome: 'Fanta', quantidade: 2, preco: 5.50 }
    ],
    garcons: ['Pedro']
  }
];

export default function OpenTablesScreen({ onNavigate }) {
  const [isGridView, setIsGridView] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleBack = () => {
    onNavigate('Home');
  };

  const handleDetail = (table) => {
    setSelectedTable(table);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTable(null);
  };

  const handleSellProduct = (table) => {
    onNavigate('SellProduct', { table });
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
      <Text style={styles.info}>{item.email}</Text>
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

      <FlatList
        data={MOCK_OPEN_TABLES}
        keyExtractor={item => item.id}
        renderItem={renderTable}
        contentContainerStyle={styles.listContent}
        numColumns={isGridView ? 4 : 1}
        key={isGridView ? 'grid' : 'list'}
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
                    <Text style={styles.modalText}>{selectedTable.email}</Text>
                    <Text style={styles.modalText}>{selectedTable.telefone}</Text>
                    <Text style={styles.modalText}>CPF: {selectedTable.cpf}</Text>
                    <Text style={styles.modalText}>{selectedTable.pessoas} pessoa(s)</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Horários</Text>
                    <Text style={styles.modalText}>Chegada: {selectedTable.chegada}</Text>
                    <Text style={styles.modalText}>Status: {selectedTable.status === 'fechada' ? 'Fechada' : 'Aberta'}</Text>
                    {selectedTable.saida && <Text style={styles.modalText}>Saída: {selectedTable.saida}</Text>}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Produtos</Text>
                    {selectedTable.produtos.map((produto, idx) => (
                      <Text key={idx} style={styles.modalText}>
                        {produto.nome} ({produto.quantidade}x) - R$ {(produto.preco * produto.quantidade).toFixed(2)}
                      </Text>
                    ))}
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
    marginRight: 0,
    marginBottom: 16,
    minHeight: 380,
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
    minHeight: 380,
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
    fontSize: 12,
    color: colors.muted,
    fontWeight: '500'
  },
  cliente: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
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
