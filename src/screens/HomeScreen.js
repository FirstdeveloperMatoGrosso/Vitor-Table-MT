import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { useTableContext } from '../context/TableContext';
import { generatePixQRCode } from '../config/mercadopago';

const { width } = Dimensions.get('window');

export default function HomeScreen({ onNavigate }) {
  const [isConsumptionModalVisible, setConsumptionModalVisible] = useState(false);
  const [searchCpf, setSearchCpf] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [formError, setFormError] = useState('');
  const [isReserveModalVisible, setReserveModalVisible] = useState(false);
  const [reserveName, setReserveName] = useState('');
  const [reserveCpf, setReserveCpf] = useState('');
  const [reserveAddress, setReserveAddress] = useState('');
  const [reservePhone, setReservePhone] = useState('');
  const [reservePeople, setReservePeople] = useState('');
  const [reserveError, setReserveError] = useState('');
  const [reserveFeedback, setReserveFeedback] = useState('');
  const [isSelectTableModalVisible, setSelectTableModalVisible] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [isKioskModalVisible, setKioskModalVisible] = useState(false);
  const [kioskPassword, setKioskPassword] = useState('');
  const [kioskPasswordError, setKioskPasswordError] = useState('');
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [isBuyChipsModalVisible, setIsBuyChipsModalVisible] = useState(false);
  const [selectedChipsPackage, setSelectedChipsPackage] = useState(null);
  const [isPixPaymentModalVisible, setIsPixPaymentModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [chipTicketData, setChipTicketData] = useState(null);
  const [pixQrCode, setPixQrCode] = useState(null);
  const [isLoadingPix, setIsLoadingPix] = useState(false);

  const [kioskFunctions, setKioskFunctions] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        openTable: true,
        openTables: true,
        buyChips: true,
        reserve: true,
        consumption: true
      };
    }
    try {
      const stored = window.localStorage.getItem('kioskFunctions');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Erro ao carregar configurações do totem:', error);
    }
    return {
      openTable: true,
      openTables: true,
      buyChips: true,
      reserve: true,
      consumption: true
    };
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('kioskFunctions', JSON.stringify(kioskFunctions));
      } catch (error) {
        console.warn('Erro ao salvar configurações do totem:', error);
      }
    }
  }, [kioskFunctions]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const wasKioskMode = window.localStorage.getItem('isKioskMode') === 'true';
        if (wasKioskMode) {
          setIsKioskMode(true);
          setKioskModalVisible(false);
        }
      } catch (error) {
        console.warn('Erro ao restaurar modo totem:', error);
      }
    }
  }, []);

  // Gerar PIX automaticamente quando o modal abrir
  useEffect(() => {
    const generatePix = async () => {
      if (isPixPaymentModalVisible && selectedChipsPackage && !pixQrCode && !isLoadingPix) {
        setIsLoadingPix(true);
        try {
          const pixData = await generatePixQRCode(
            selectedChipsPackage.price,
            `Compra de ${selectedChipsPackage.amount} Saldo - VitorTable MT`
          );
          
          if (pixData && pixData.qrCode) {
            setPixQrCode(pixData.qrCode);
            
            const ticketId = 'CHIP-' + Date.now().toString().slice(-8);
            const securityCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            setChipTicketData({
              id: ticketId,
              amount: selectedChipsPackage.amount,
              price: selectedChipsPackage.price,
              date: new Date().toLocaleDateString('pt-BR'),
              time: new Date().toLocaleTimeString('pt-BR'),
              securityCode: securityCode,
              qrCode: pixData.qrCode,
              transactionId: pixData.transactionId,
              isMock: pixData.isMock
            });
          } else {
            Alert.alert('Erro', 'Não foi possível gerar o QR Code PIX. Verifique suas credenciais do Mercado Pago.');
          }
        } catch (error) {
          console.error('Erro ao gerar PIX:', error);
          Alert.alert('Erro', 'Erro ao gerar QR Code PIX');
        } finally {
          setIsLoadingPix(false);
        }
      }
    };

    generatePix();
  }, [isPixPaymentModalVisible, selectedChipsPackage]);

  const { tables } = useTableContext();

  const selectedTable = useMemo(() => {
    if (!selectedTableId) return null;
    return tables.find(table => table.id === selectedTableId) || null;
  }, [selectedTableId, tables]);

  const availableTables = useMemo(
    () => tables.filter((table) => table.status === 'fechada'),
    [tables]
  );

  const handleOpenTable = () => {
    onNavigate('Login', { isKioskMode, kioskFunctions });
  };

  const handleOpenTables = () => {
    onNavigate('OpenTables', { isKioskMode, kioskFunctions });
  };

  const handleBuyChips = () => {
    setIsBuyChipsModalVisible(true);
    setSelectedChipsPackage(null);
  };

  const handleOpenReserveModal = () => {
    setReserveModalVisible(true);
    setReserveFeedback('');
    setReserveError('');
  };

  const resetReserveForm = () => {
    setReserveName('');
    setReserveCpf('');
    setReserveAddress('');
    setReservePhone('');
    setReservePeople('');
    setReserveError('');
    setSelectedTableId(null);
  };

  const handleCloseReserveModal = () => {
    setReserveModalVisible(false);
    resetReserveForm();
    setReserveFeedback('');
  };

  const handleConfirmReserve = () => {
    if (!reserveName || !reserveCpf || !reserveAddress || !reservePhone || !reservePeople) {
      setReserveError('Preencha todos os campos para reservar.');
      setReserveFeedback('');
      return;
    }

    setReserveError('');
    setReserveFeedback('Dados recebidos! Escolha a mesa para concluir a reserva.');
    setSelectTableModalVisible(true);
  };

  const formatCpf = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const generateReservationText = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');
    const tableName = selectedTable ? `Mesa ${selectedTable.mesa}` : 'Não selecionada';
    
    return `
*RESERVA DE MESA - VITOR TABLE MT*

📅 Data da Reserva: ${date} às ${time}

👤 *Dados do Cliente:*
Nome: ${reserveName}
CPF: ${reserveCpf}
Telefone: ${reservePhone}
Endereço: ${reserveAddress}

🍽️ *Informações da Reserva:*
Mesa: ${tableName}
Quantidade de Pessoas: ${reservePeople}

---
Reserva realizada via VitorTable MT
    `.trim();
  };

  const handlePrintReservation = () => {
    const reservationText = generateReservationText();
    if (typeof window !== 'undefined' && window.print) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<pre style="font-family: monospace; white-space: pre-wrap;">' + reservationText + '</pre>');
      printWindow.document.close();
      printWindow.print();
    } else {
      Alert.alert('Impressão', 'Funcionalidade de impressão não disponível neste dispositivo.');
    }
  };

  const handleSendWhatsApp = () => {
    const reservationText = generateReservationText();
    const phoneNumber = '5566992258469';
    const encodedMessage = encodeURIComponent(reservationText);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank');
    } else {
      Alert.alert('WhatsApp', 'Não foi possível abrir o WhatsApp.');
    }
  };

  const handleOpenConsumptionModal = () => {
    setConsumptionModalVisible(true);
  };

  const resetConsumptionForm = () => {
    setSearchCpf('');
    setSearchName('');
    setSearchId('');
    setFormError('');
  };

  const handleCloseConsumptionModal = () => {
    setConsumptionModalVisible(false);
    resetConsumptionForm();
  };

  const handleConfirmConsumption = () => {
    if (!searchCpf && !searchName && !searchId) {
      setFormError('Informe CPF, nome completo ou ID para continuar.');
      return;
    }

    const filters = {
      cpf: searchCpf.trim(),
      nome: searchName.trim(),
      id: searchId.trim()
    };

    setFormError('');
    setConsumptionModalVisible(false);
    onNavigate('BuyChips', { view: 'usage', filters });
    resetConsumptionForm();
  };

  const generateConsumptionText = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR');
    
    return `
*CONSUMO DE FICHAS - VITOR TABLE MT*

📅 Data da Consulta: ${date} às ${time}

🔍 *Dados da Busca:*
${searchCpf ? `CPF: ${searchCpf}` : ''}
${searchName ? `Nome: ${searchName}` : ''}
${searchId ? `ID: ${searchId}` : ''}

---
Consulta realizada via VitorTable MT
    `.trim();
  };

  const handlePrintConsumption = () => {
    const consumptionText = generateConsumptionText();
    if (typeof window !== 'undefined' && window.print) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<pre style="font-family: monospace; white-space: pre-wrap;">' + consumptionText + '</pre>');
      printWindow.document.close();
      printWindow.print();
    } else {
      Alert.alert('Impressão', 'Funcionalidade de impressão não disponível neste dispositivo.');
    }
  };

  const handleOpenKioskModal = () => {
    setKioskModalVisible(true);
    setKioskPassword('');
    setKioskPasswordError('');
  };

  const handleCloseKioskModal = () => {
    setKioskModalVisible(false);
    setKioskPassword('');
    setKioskPasswordError('');
  };

  const handleKioskPasswordSubmit = () => {
    const correctPassword = '1234';
    if (kioskPassword !== correctPassword) {
      setKioskPasswordError('Senha incorreta. Tente novamente.');
      return;
    }
    setKioskPasswordError('');
    setKioskPassword('');
  };

  const handleExitKioskMode = () => {
    setIsKioskMode(false);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('isKioskMode', 'false');
      } catch (error) {
        console.warn('Erro ao limpar estado do modo totem:', error);
      }
    }
  };

  const toggleKioskFunction = (functionName) => {
    setKioskFunctions(prev => ({
      ...prev,
      [functionName]: !prev[functionName]
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🍽️</Text>
        <Text style={styles.title}>VitorTable MT</Text>
        <Text style={styles.subtitle}>Comanda Eletrônica</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {(!isKioskMode || kioskFunctions.openTable) && (
          <PrimaryButton
            title="Abrir Mesa"
            onPress={handleOpenTable}
            style={styles.button}
          />
        )}
        {(!isKioskMode || kioskFunctions.openTables) && (
          <PrimaryButton
            title="Mesas Abertas"
            onPress={handleOpenTables}
            style={[styles.button, styles.secondaryButton]}
          />
        )}
        {(!isKioskMode || kioskFunctions.buyChips) && (
          <PrimaryButton
            title="Comprar Fichas"
            onPress={handleBuyChips}
            style={[styles.button, styles.tertiaryButton]}
          />
        )}
        {(!isKioskMode || kioskFunctions.reserve || kioskFunctions.consumption) && (
          <View style={styles.inlineButtons}>
            {(!isKioskMode || kioskFunctions.reserve) && (
              <PrimaryButton
                title="Reserva de Mesa"
                onPress={handleOpenReserveModal}
                style={[styles.smallButton, styles.secondaryButton]}
              />
            )}
            {(!isKioskMode || kioskFunctions.consumption) && (
              <PrimaryButton
                title="Ver Consumo"
                onPress={handleOpenConsumptionModal}
                style={[styles.smallButton, styles.tertiaryButton]}
              />
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerVersion}>v1.0.0</Text>
        <Text style={styles.footerQuote}>As grandes ideias surgem da observacao dos pequenos detalhes.</Text>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>📞 Entre em Contato</Text>
          <Pressable onPress={handleOpenKioskModal}>
            <Text style={styles.contactCompany}>🚀 Rodrigo Dev MT</Text>
          </Pressable>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📍</Text>
            <Text style={styles.contactLocation}>Mato Grosso, Brasil</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📱</Text>
            <Text style={styles.contactPhone}>(66) 99225-8469  ·  (45) 99104-6021</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📧</Text>
            <View style={styles.emailContainer}>
              <Text style={styles.contactEmail}>developer@rodrigodevmt.com.br</Text>
              <Text style={styles.contactEmail}>rodrigodev@yahoo.com</Text>
            </View>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>🕒</Text>
            <View style={styles.scheduleContainer}>
              <Text style={styles.contactSchedule}>Segunda - Sexta: 8h às 18h</Text>
              <Text style={styles.contactSchedule}>Sábado: 8h às 12h</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={isConsumptionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseConsumptionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Buscar Consumo de Fichas</Text>
            <Text style={styles.modalSubtitle}>Informe pelo menos um dos campos abaixo</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>CPF</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="000.000.000-00"
                value={searchCpf}
                onChangeText={(text) => setSearchCpf(formatCpf(text))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Nome Completo</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: João Silva"
                value={searchName}
                onChangeText={setSearchName}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>ID da Mesa ou Cliente</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: 123"
                value={searchId}
                onChangeText={setSearchId}
              />
            </View>

            {formError ? <Text style={styles.modalError}>{formError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={handleCloseConsumptionModal}>
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirmConsumption}>
                <Text style={styles.modalButtonTextPrimary}>Buscar</Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.actionButton, styles.actionButtonPrint]}
              onPress={handlePrintConsumption}
            >
              <Text style={styles.actionButtonText}>🖨️ Imprimir Consumo</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isReserveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseReserveModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.reserveContainer]}>
            <Text style={styles.modalTitle}>Reserva de Mesa</Text>
            <Text style={styles.modalSubtitle}>Informe os dados do cliente</Text>

            <View style={styles.reserveContent}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Nome Completo</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Maria Silva"
                  value={reserveName}
                  onChangeText={setReserveName}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>CPF</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="000.000.000-00"
                  value={reserveCpf}
                  onChangeText={(text) => setReserveCpf(formatCpf(text))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Endereço</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Rua, nº, bairro"
                  value={reserveAddress}
                  onChangeText={setReserveAddress}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Telefone</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="(66) 90000-0000"
                  value={reservePhone}
                  onChangeText={(text) => setReservePhone(formatPhone(text))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Quantidade de Pessoas</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: 4"
                  value={reservePeople}
                  onChangeText={setReservePeople}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.availableTablesSection}>
                <Text style={styles.availableTitle}>Mesas disponíveis</Text>
                {availableTables.length > 0 ? (
                  availableTables.map((table) => (
                    <View key={table.id} style={styles.availableTableItem}>
                      <Text style={styles.availableTableName}>Mesa {table.mesa}</Text>
                      <Text style={styles.availableTableInfo}>
                        Capacidade atual: {table.pessoas} pessoa(s)
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.modalInfo}>Nenhuma mesa disponível para reserva no momento.</Text>
                )}
              </View>

              {reserveError ? <Text style={styles.modalError}>{reserveError}</Text> : null}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={handleCloseReserveModal}>
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={handleConfirmReserve}>
                <Text style={styles.modalButtonTextPrimary}>Confirmar Reserva</Text>
              </Pressable>
            </View>
            {reserveFeedback ? <Text style={styles.modalInfo}>{reserveFeedback}</Text> : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSelectTableModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectTableModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.reserveContainer]}>
            <Text style={styles.modalTitle}>Selecionar Mesa</Text>
            <Text style={styles.modalSubtitle}>Escolha uma mesa para concluir a reserva</Text>

            <ScrollView contentContainerStyle={styles.reserveContent}>
              {availableTables.length > 0 ? (
                availableTables.map((table) => (
                  <Pressable
                    key={table.id}
                    style={[
                      styles.tableOption,
                      selectedTableId === table.id && styles.tableOptionSelected
                    ]}
                    onPress={() => setSelectedTableId(table.id)}
                  >
                    <Text style={styles.tableOptionTitle}>Mesa {table.mesa}</Text>
                    <Text style={styles.tableOptionInfo}>Capacidade: {table.pessoas} pessoa(s)</Text>
                    <Text style={styles.tableOptionInfo}>Status atual: {table.status}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.modalInfo}>Nenhuma mesa disponível no momento.</Text>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => {
                setSelectTableModalVisible(false);
                setReserveFeedback('');
              }}>
                <Text style={styles.modalButtonTextSecondary}>Voltar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, !selectedTableId && styles.modalButtonDisabled]}
                onPress={() => {
                  if (!selectedTableId) return;
                  setSelectTableModalVisible(false);
                  setReserveFeedback('Reserva concluída! Mesa selecionada com sucesso.');
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>Confirmar Mesa</Text>
              </Pressable>
            </View>

            <View style={styles.reserveActionButtons}>
              <Pressable
                style={[styles.actionButton, styles.actionButtonPrint]}
                onPress={handlePrintReservation}
              >
                <Text style={styles.actionButtonText}>🖨️ Imprimir</Text>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.actionButtonWhatsApp]}
                onPress={handleSendWhatsApp}
              >
                <Text style={styles.actionButtonText}>💬 WhatsApp</Text>
              </Pressable>
            </View>
            {reserveFeedback && !isReserveModalVisible ? (
              <Text style={styles.modalSuccess}>{reserveFeedback}</Text>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isBuyChipsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBuyChipsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Comprar Saldo</Text>
            <Text style={styles.modalSubtitle}>Selecione um pacote</Text>

            <View style={styles.chipsRow}>
              <Pressable
                style={[styles.chipsPackage, styles.chipsPackageHalf, selectedChipsPackage?.id === '1' && styles.chipsPackageSelected]}
                onPress={() => setSelectedChipsPackage({ id: '1', amount: 50, price: 50.00 })}
              >
                <Text style={styles.chipsPackageText}>50 Saldo</Text>
                <Text style={styles.chipsPackagePrice}>R$ 50,00</Text>
              </Pressable>
              <Pressable
                style={[styles.chipsPackage, styles.chipsPackageHalf, selectedChipsPackage?.id === '2' && styles.chipsPackageSelected]}
                onPress={() => setSelectedChipsPackage({ id: '2', amount: 100, price: 90.00 })}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
                <Text style={styles.chipsPackageText}>100 Saldo</Text>
                <Text style={styles.chipsPackagePrice}>R$ 90,00</Text>
              </Pressable>
            </View>

            <View style={styles.chipsRow}>
              <Pressable
                style={[styles.chipsPackage, styles.chipsPackageHalf, selectedChipsPackage?.id === '3' && styles.chipsPackageSelected]}
                onPress={() => setSelectedChipsPackage({ id: '3', amount: 200, price: 160.00 })}
              >
                <Text style={styles.chipsPackageText}>200 Saldo</Text>
                <Text style={styles.chipsPackagePrice}>R$ 160,00</Text>
              </Pressable>
              <Pressable
                style={[styles.chipsPackage, styles.chipsPackageHalf, selectedChipsPackage?.id === '4' && styles.chipsPackageSelected]}
                onPress={() => setSelectedChipsPackage({ id: '4', amount: 500, price: 350.00 })}
              >
                <Text style={styles.chipsPackageText}>500 Saldo</Text>
                <Text style={styles.chipsPackagePrice}>R$ 350,00</Text>
              </Pressable>
            </View>

            <View style={styles.chipsRow}>
              <Pressable
                style={[styles.chipsPackage, styles.chipsPackageHalf, selectedChipsPackage?.id === '5' && styles.chipsPackageSelected]}
                onPress={() => setSelectedChipsPackage({ id: '5', amount: 1000, price: 650.00 })}
              >
                <Text style={styles.chipsPackageText}>1000 Saldo</Text>
                <Text style={styles.chipsPackagePrice}>R$ 650,00</Text>
              </Pressable>
              <Pressable
                style={[styles.chipsPackage, styles.chipsPackageHalf, selectedChipsPackage?.id === '6' && styles.chipsPackageSelected]}
                onPress={() => setSelectedChipsPackage({ id: '6', amount: 2000, price: 1200.00 })}
              >
                <Text style={styles.chipsPackageText}>2000 Saldo</Text>
                <Text style={styles.chipsPackagePrice}>R$ 1.200,00</Text>
              </Pressable>
            </View>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={() => setIsBuyChipsModalVisible(false)}>
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, !selectedChipsPackage && styles.modalButtonDisabled]}
                onPress={() => {
                  if (selectedChipsPackage) {
                    setIsPixPaymentModalVisible(true);
                  }
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>Comprar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isPixPaymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPixPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pagamento PIX</Text>
            <Text style={styles.modalSubtitle}>Escaneie o QR Code para pagar</Text>

            <View style={styles.pixQrContainer}>
              {isLoadingPix ? (
                <View style={styles.pixQrBox}>
                  <Text style={styles.pixQrIcon}>⏳</Text>
                  <Text style={styles.pixQrText}>Gerando QR Code...</Text>
                  <Text style={styles.pixQrSubtext}>Aguarde um momento</Text>
                </View>
              ) : pixQrCode ? (
                <View style={styles.pixQrBox}>
                  <Text style={styles.pixQrIcon}>✅</Text>
                  <Text style={styles.pixQrText}>QR Code Gerado!</Text>
                  <Text style={styles.pixQrSubtext}>Escaneie para pagar</Text>
                  {chipTicketData?.isMock && (
                    <Text style={styles.pixMockWarning}>⚠️ Modo Teste</Text>
                  )}
                </View>
              ) : (
                <View style={styles.pixQrBox}>
                  <Text style={styles.pixQrIcon}>📱</Text>
                  <Text style={styles.pixQrText}>Preparando...</Text>
                </View>
              )}
            </View>

            {pixQrCode && (
              <View style={styles.pixCodeContainer}>
                <Text style={styles.pixCodeLabel}>Código PIX (Copia e Cola)</Text>
                <View style={styles.pixCodeBox}>
                  <Text style={styles.pixCodeText} numberOfLines={2}>
                    {pixQrCode.substring(0, 60)}...
                  </Text>
                </View>
                <Pressable 
                  style={styles.pixCopyButton}
                  onPress={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(pixQrCode);
                      Alert.alert('Sucesso', 'Código PIX copiado!');
                    }
                  }}
                >
                  <Text style={styles.pixCopyButtonText}>📋 Copiar Código</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.pixInfoContainer}>
              <Text style={styles.pixLabel}>Valor:</Text>
              <Text style={styles.pixValue}>R$ {selectedChipsPackage?.price.toFixed(2)}</Text>
              <Text style={styles.pixLabel}>Saldo:</Text>
              <Text style={styles.pixValue}>{selectedChipsPackage?.amount}</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={() => {
                  setIsPixPaymentModalVisible(false);
                  setPixQrCode(null);
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, (isLoadingPix || !pixQrCode) && styles.modalButtonDisabled]}
                onPress={() => {
                  if (pixQrCode && chipTicketData) {
                    setIsPixPaymentModalVisible(false);
                    setIsBuyChipsModalVisible(false);
                    setIsSuccessModalVisible(true);
                    setPixQrCode(null);
                  }
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {isLoadingPix ? 'Gerando...' : 'Confirmar Pagamento'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.modalTitle}>Compra Realizada!</Text>
            <Text style={styles.modalSubtitle}>Ficha de Crédito Gerada</Text>

            <View style={styles.ticketContainer}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>VITOR TABLE MT</Text>
                <Text style={styles.ticketSubtitle}>Ficha de Crédito</Text>
              </View>

              <View style={styles.ticketContent}>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>ID:</Text>
                  <Text style={styles.ticketValue}>{chipTicketData?.id}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Fichas:</Text>
                  <Text style={styles.ticketValue}>{chipTicketData?.amount}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Valor:</Text>
                  <Text style={styles.ticketValue}>R$ {chipTicketData?.price.toFixed(2)}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Data:</Text>
                  <Text style={styles.ticketValue}>{chipTicketData?.date}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Hora:</Text>
                  <Text style={styles.ticketValue}>{chipTicketData?.time}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Segurança:</Text>
                  <Text style={styles.ticketValue}>{chipTicketData?.securityCode}</Text>
                </View>
              </View>

              <View style={styles.ticketQrContainer}>
                <Text style={styles.ticketQrLabel}>QR Code para Recarga e Consulta</Text>
                <View style={styles.ticketQrBox}>
                  <Text style={styles.ticketQrText}>📱 QR</Text>
                  <Text style={styles.ticketQrUrl}>{chipTicketData?.qrCode}</Text>
                </View>
              </View>

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketFooterText}>Escaneie para consultar saldo e consumo</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  const printContent = `
                    VITOR TABLE MT
                    Ficha de Crédito
                    
                    ID: ${chipTicketData?.id}
                    Fichas: ${chipTicketData?.amount}
                    Valor: R$ ${chipTicketData?.price.toFixed(2)}
                    Data: ${chipTicketData?.date}
                    Hora: ${chipTicketData?.time}
                    Segurança: ${chipTicketData?.securityCode}
                    
                    QR Code: ${chipTicketData?.qrCode}
                    
                    Escaneie para consultar saldo e consumo
                  `;
                  if (typeof window !== 'undefined' && window.print) {
                    const printWindow = window.open('', '', 'height=600,width=400');
                    printWindow.document.write('<pre style="font-family: monospace; white-space: pre-wrap;">' + printContent + '</pre>');
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>🖨️ Imprimir Ficha</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setIsSuccessModalVisible(false);
                  setChipTicketData(null);
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isKioskModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseKioskModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.kioskPasswordContainer]}>
            <Text style={styles.modalTitle}>Modo Totem</Text>
            <View style={styles.kioskStatusContainer}>
              <View style={[styles.kioskStatusBadge, isKioskMode ? styles.kioskStatusActive : styles.kioskStatusInactive]}>
                <Text style={styles.kioskStatusText}>
                  {isKioskMode ? '● ATIVO' : '○ INATIVO'}
                </Text>
              </View>
            </View>
            <Text style={styles.modalSubtitle}>Digite a senha para {isKioskMode ? 'desativar' : 'ativar'}</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Senha</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Digite a senha"
                value={kioskPassword}
                onChangeText={setKioskPassword}
                secureTextEntry
              />
            </View>

            {kioskPasswordError ? <Text style={styles.modalError}>{kioskPasswordError}</Text> : null}

            <ScrollView style={styles.kioskFunctionsScroll} contentContainerStyle={styles.kioskFunctionsContent}>
              <Text style={styles.kioskSectionTitle}>Funções Ativas</Text>

              <Pressable
                style={[styles.kioskFunctionItem, kioskFunctions.openTable && styles.kioskFunctionActive]}
                onPress={() => toggleKioskFunction('openTable')}
              >
                <View style={styles.kioskCheckbox}>
                  {kioskFunctions.openTable && <Text style={styles.kioskCheckmark}>✓</Text>}
                </View>
                <Text style={styles.kioskFunctionText}>Abrir Mesa</Text>
              </Pressable>

              <Pressable
                style={[styles.kioskFunctionItem, kioskFunctions.openTables && styles.kioskFunctionActive]}
                onPress={() => toggleKioskFunction('openTables')}
              >
                <View style={styles.kioskCheckbox}>
                  {kioskFunctions.openTables && <Text style={styles.kioskCheckmark}>✓</Text>}
                </View>
                <Text style={styles.kioskFunctionText}>Mesas Abertas</Text>
              </Pressable>

              <Pressable
                style={[styles.kioskFunctionItem, kioskFunctions.buyChips && styles.kioskFunctionActive]}
                onPress={() => toggleKioskFunction('buyChips')}
              >
                <View style={styles.kioskCheckbox}>
                  {kioskFunctions.buyChips && <Text style={styles.kioskCheckmark}>✓</Text>}
                </View>
                <Text style={styles.kioskFunctionText}>Comprar Fichas</Text>
              </Pressable>

              <Pressable
                style={[styles.kioskFunctionItem, kioskFunctions.reserve && styles.kioskFunctionActive]}
                onPress={() => toggleKioskFunction('reserve')}
              >
                <View style={styles.kioskCheckbox}>
                  {kioskFunctions.reserve && <Text style={styles.kioskCheckmark}>✓</Text>}
                </View>
                <Text style={styles.kioskFunctionText}>Reserva de Mesa</Text>
              </Pressable>

              <Pressable
                style={[styles.kioskFunctionItem, kioskFunctions.consumption && styles.kioskFunctionActive]}
                onPress={() => toggleKioskFunction('consumption')}
              >
                <View style={styles.kioskCheckbox}>
                  {kioskFunctions.consumption && <Text style={styles.kioskCheckmark}>✓</Text>}
                </View>
                <Text style={styles.kioskFunctionText}>Ver Consumo</Text>
              </Pressable>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.modalButtonSecondary]} onPress={handleCloseKioskModal}>
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.modalButtonPrimary]} onPress={() => {
                handleKioskPasswordSubmit();
                if (kioskPassword === '1234') {
                  const newMode = !isKioskMode;
                  setIsKioskMode(newMode);
                  setKioskModalVisible(false);
                  if (typeof window !== 'undefined') {
                    try {
                      window.localStorage.setItem('isKioskMode', newMode ? 'true' : 'false');
                    } catch (error) {
                      console.warn('Erro ao salvar estado do modo totem:', error);
                    }
                  }
                }
              }}>
                <Text style={styles.modalButtonTextPrimary}>{isKioskMode ? 'Desativar' : 'Ativar'} Totem</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 0
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
  inlineButtons: {
    flexDirection: 'row',
    gap: 10
  },
  smallButton: {
    flex: 1,
    paddingVertical: 12
  },
  footer: {
    width: '100%',
    paddingHorizontal: 0,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 'auto',
    backgroundColor: colors.background
  },
  footerVersion: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 20,
    fontWeight: '600'
  },
  footerQuote: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500'
  },
  contactSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 8
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
    width: 20
  },
  contactLocation: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    flex: 1
  },
  contactPhone: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    flex: 1
  },
  emailContainer: {
    flex: 1
  },
  contactEmail: {
    fontSize: 11,
    color: colors.email,
    fontWeight: '500',
    marginBottom: 2
  },
  scheduleContainer: {
    flex: 1
  },
  contactSchedule: {
    fontSize: 11,
    color: colors.time,
    fontWeight: '600',
    marginBottom: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  modalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center'
  },
  modalField: {
    gap: 6
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    backgroundColor: '#FFFFFF'
  },
  modalError: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary
  },
  modalButtonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalButtonDisabled: {
    opacity: 0.5
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  modalButtonTextSecondary: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  modalInfo: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8
  },
  modalSuccess: {
    fontSize: 12,
    color: colors.primary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600'
  },
  reserveContainer: {
    maxHeight: '90vh',
    width: width > 600 ? 500 : '90%'
  },
  reserveContent: {
    gap: 12,
    paddingVertical: 12
  },
  availableTablesSection: {
    marginTop: 12,
    gap: 8,
    maxHeight: 140,
    overflow: 'hidden'
  },
  availableTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  availableTableItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  availableTableName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  availableTableInfo: {
    fontSize: 12,
    color: colors.muted
  },
  tableOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FFFFFF'
  },
  tableOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(246, 134, 71, 0.12)'
  },
  tableOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  tableOptionInfo: {
    fontSize: 12,
    color: colors.muted
  },
  reserveActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1
  },
  actionButtonPrint: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary
  },
  actionButtonWhatsApp: {
    backgroundColor: '#25D366',
    borderColor: '#25D366'
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text
  },
  kioskContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20
  },
  kioskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  kioskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  kioskCloseButton: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '700'
  },
  kioskContent: {
    padding: 20,
    gap: 12
  },
  kioskSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  kioskFunctionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 12
  },
  kioskFunctionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(246, 134, 71, 0.08)'
  },
  kioskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  kioskCheckmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700'
  },
  kioskFunctionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1
  },
  kioskExitButton: {
    backgroundColor: '#EF4444',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  kioskExitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  kioskPasswordContainer: {
    maxHeight: '85%',
    paddingBottom: 16
  },
  kioskStatusContainer: {
    alignItems: 'center',
    marginVertical: 12
  },
  kioskStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center'
  },
  kioskStatusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22C55E'
  },
  kioskStatusInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    borderWidth: 1,
    borderColor: '#6B7280'
  },
  kioskStatusText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  kioskFunctionsScroll: {
    maxHeight: 220,
    marginVertical: 8
  },
  kioskFunctionsContent: {
    gap: 12,
    paddingBottom: 8
  },
  chipsPackage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center'
  },
  chipsPackagePopular: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(246, 134, 71, 0.05)'
  },
  chipsPackageSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(246, 134, 71, 0.15)'
  },
  popularBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  chipsPackageHalf: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  chipsPackageText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4
  },
  chipsPackagePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center'
  },
  pixQrContainer: {
    alignItems: 'center',
    marginVertical: 16
  },
  pixQrBox: {
    width: 180,
    height: 180,
    backgroundColor: colors.background,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border
  },
  pixQrIcon: {
    fontSize: 48,
    marginBottom: 8
  },
  pixQrText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  pixQrSubtext: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4
  },
  pixMockWarning: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '600'
  },
  pixCodeContainer: {
    marginVertical: 12,
    gap: 8
  },
  pixCodeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text
  },
  pixCodeBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  pixCodeText: {
    fontSize: 10,
    color: colors.text,
    fontFamily: 'monospace'
  },
  pixCopyButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  pixCopyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  pixInfoContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginVertical: 12
  },
  pixLabel: {
    fontSize: 12,
    color: colors.muted,
    fontWeight: '600',
    marginTop: 8
  },
  pixValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  successIcon: {
    fontSize: 48,
    color: '#22C55E',
    textAlign: 'center',
    marginBottom: 8
  },
  ticketContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 12,
    marginVertical: 12
  },
  ticketHeader: {
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  ticketSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4
  },
  ticketContent: {
    paddingVertical: 12
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  ticketLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600'
  },
  ticketValue: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700'
  },
  ticketQrContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  ticketQrLabel: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 8
  },
  ticketQrBox: {
    width: 120,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ticketQrText: {
    fontSize: 32,
    color: colors.muted
  },
  ticketQrUrl: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 4,
    fontFamily: 'monospace'
  },
  ticketFooter: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  ticketFooterText: {
    fontSize: 10,
    color: colors.muted,
    fontStyle: 'italic'
  }
});
