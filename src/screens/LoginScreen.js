import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Pressable, Dimensions, TouchableOpacity, Modal, Alert } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { formatCPF, formatPhone } from '../utils/masks';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onNavigate, screenParams }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [tableCapacity, setTableCapacity] = useState(null);
  const [isTableModalVisible, setIsTableModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const { isKioskMode = false, kioskFunctions = {} } = screenParams || {};

  // Mock de mesas disponíveis
  const availableTables = [
    { id: 1, number: 1, capacity: 4, status: 'disponivel' },
    { id: 2, number: 2, capacity: 6, status: 'disponivel' },
    { id: 3, number: 3, capacity: 4, status: 'ocupada' },
    { id: 4, number: 4, capacity: 8, status: 'disponivel' },
    { id: 5, number: 5, capacity: 6, status: 'disponivel' },
    { id: 6, number: 6, capacity: 4, status: 'ocupada' },
    { id: 7, number: 7, capacity: 8, status: 'disponivel' },
    { id: 8, number: 8, capacity: 4, status: 'disponivel' }
  ];

  const handlePhoneChange = (text) => {
    setPhone(formatPhone(text));
  };

  const handleCpfChange = (text) => {
    setCpf(formatCPF(text));
  };

  const handleAccess = () => {
    if (!name || !email || !phone || !cpf || !tableCapacity) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    // Abrir modal de seleção de mesa
    setIsTableModalVisible(true);
  };

  const handleSelectTable = (table) => {
    if (table.status === 'ocupada') {
      Alert.alert('Mesa Ocupada', 'Esta mesa já está ocupada. Escolha outra mesa.');
      return;
    }
    setSelectedTable(table);
  };

  const handleCloseModal = () => {
    setIsTableModalVisible(false);
    setSelectedTable(null);
  };

  const handleConfirmTable = () => {
    if (!selectedTable) {
      Alert.alert('Atenção', 'Por favor, selecione uma mesa.');
      return;
    }
    
    // Fechar modal de seleção e abrir modal de confirmação
    setIsTableModalVisible(false);
    setIsConfirmModalVisible(true);
  };

  const handleAddProducts = () => {
    setIsConfirmModalVisible(false);
    onNavigate('Products', {
      user: {
        name,
        email,
        phone,
        cpf,
        tableCapacity,
        mesa: selectedTable.number
      }
    });
  };

  const handleCloseConfirm = () => {
    setIsConfirmModalVisible(false);
    setSelectedTable(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Home', { isKioskMode, kioskFunctions })} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Abrir Mesa</Text>
        <View style={styles.backButtonContainer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          placeholderTextColor={colors.muted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          placeholder="(XX) XXXXX-XXXX"
          placeholderTextColor={colors.muted}
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="XXX.XXX.XXX-XX"
          placeholderTextColor={colors.muted}
          value={cpf}
          onChangeText={handleCpfChange}
          keyboardType="numeric"
          maxLength={14}
        />

        <Text style={styles.label}>Capacidade da Mesa</Text>
        <View style={styles.capacityContainer}>
          {[4, 6, 8].map(capacity => (
            <Pressable
              key={capacity}
              style={[
                styles.capacityButton,
                tableCapacity === capacity && styles.capacityButtonActive
              ]}
              onPress={() => setTableCapacity(capacity)}
            >
              <Text
                style={[
                  styles.capacityText,
                  tableCapacity === capacity && styles.capacityTextActive
                ]}
              >
                {capacity}
              </Text>
            </Pressable>
          ))}
        </View>

          <PrimaryButton
            title="Acessar"
            onPress={handleAccess}
            style={styles.button}
          />
        </View>
      </ScrollView>

      {/* Modal de Seleção de Mesa */}
      <Modal
        visible={isTableModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecione uma Mesa</Text>
            <Text style={styles.modalSubtitle}>Escolha uma mesa disponível</Text>

            <ScrollView style={styles.tablesGrid} contentContainerStyle={styles.tablesGridContent}>
              {availableTables.map((table) => (
                <Pressable
                  key={table.id}
                  style={[
                    styles.tableCard,
                    table.status === 'ocupada' && styles.tableCardOccupied,
                    selectedTable?.id === table.id && styles.tableCardSelected
                  ]}
                  onPress={() => handleSelectTable(table)}
                >
                  <Text style={[
                    styles.tableNumber,
                    table.status === 'ocupada' && styles.tableNumberOccupied,
                    selectedTable?.id === table.id && styles.tableNumberSelected
                  ]}>
                    Mesa {table.number}
                  </Text>
                  <Text style={[
                    styles.tableCapacity,
                    table.status === 'ocupada' && styles.tableCapacityOccupied
                  ]}>
                    {table.capacity} pessoas
                  </Text>
                  <View style={[
                    styles.tableStatus,
                    table.status === 'disponivel' ? styles.tableStatusAvailable : styles.tableStatusOccupied
                  ]}>
                    <Text style={styles.tableStatusText}>
                      {table.status === 'disponivel' ? '✓ Disponível' : '✕ Ocupada'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={handleCloseModal}>
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirmTable}>
                <Text style={styles.modalButtonTextPrimary}>Confirmar Mesa</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        visible={isConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseConfirm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmIcon}>✓</Text>
              <Text style={styles.confirmTitle}>Mesa Confirmada</Text>
            </View>

            <View style={styles.confirmContent}>
              <View style={styles.confirmSection}>
                <Text style={styles.confirmSectionTitle}>Informações da Mesa</Text>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Mesa:</Text>
                  <Text style={styles.confirmValue}>{selectedTable?.number}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Capacidade:</Text>
                  <Text style={styles.confirmValue}>{selectedTable?.capacity} pessoas</Text>
                </View>
              </View>

              <View style={styles.confirmDivider} />

              <View style={styles.confirmSection}>
                <Text style={styles.confirmSectionTitle}>Dados do Cliente</Text>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Nome:</Text>
                  <Text style={styles.confirmValue}>{name}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Email:</Text>
                  <Text style={styles.confirmValue}>{email}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Telefone:</Text>
                  <Text style={styles.confirmValue}>{phone}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>CPF:</Text>
                  <Text style={styles.confirmValue}>{cpf}</Text>
                </View>
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Pessoas:</Text>
                  <Text style={styles.confirmValue}>{tableCapacity}</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={handleCloseConfirm}>
                <Text style={styles.modalButtonTextSecondary}>Fechar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleAddProducts}>
                <Text style={styles.modalButtonTextPrimary}>Adicionar Produtos</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row'
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1
  },
  formContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    fontSize: 14,
    paddingVertical: 10,
    marginBottom: 16,
    outlineColor: colors.accent
  },
  button: {
    marginTop: 24,
    marginBottom: 32
  },
  capacityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 0
  },
  capacityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  capacityButtonActive: {
    backgroundColor: colors.primary
  },
  capacityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary
  },
  capacityTextActive: {
    color: '#FFFFFF'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 20,
    textAlign: 'center'
  },
  tablesGrid: {
    maxHeight: 400,
    marginBottom: 20
  },
  tablesGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  tableCard: {
    width: width > 768 ? '23%' : '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: 12
  },
  tableCardOccupied: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.6
  },
  tableCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(246, 134, 71, 0.1)'
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  tableNumberOccupied: {
    color: colors.muted
  },
  tableNumberSelected: {
    color: colors.primary
  },
  tableCapacity: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 8
  },
  tableCapacityOccupied: {
    color: '#999'
  },
  tableStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4
  },
  tableStatusAvailable: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22C55E'
  },
  tableStatusOccupied: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444'
  },
  tableStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.border
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary
  },
  modalButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text
  },
  modalButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  confirmModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500
  },
  confirmHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  confirmIcon: {
    fontSize: 48,
    color: '#22C55E',
    marginBottom: 8
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text
  },
  confirmContent: {
    marginBottom: 20
  },
  confirmSection: {
    marginBottom: 16
  },
  confirmSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  confirmLabel: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600'
  },
  confirmValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600'
  },
  confirmDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16
  }
});
