import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';
import { useTableContext } from '../context/TableContext';
import { generatePixQRCode, checkPaymentStatus } from '../config/mercadopago';
import PixQRCode from '../components/PixQRCode';

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
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState(null);
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState(null);
  const [pixExpiration, setPixExpiration] = useState(null);
  const [pixTimeLeft, setPixTimeLeft] = useState(null);
  const [pixExpired, setPixExpired] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoadingPix, setIsLoadingPix] = useState(false);
  const countdownIntervalRef = useRef(null);
  const statusIntervalRef = useRef(null);

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

  const clearPixIntervals = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  };

  const resetPixState = () => {
    setPixQrCode(null);
    setPixQrCodeBase64(null);
    setPixQrCodeUrl(null);
    setPixExpiration(null);
    setPixTimeLeft(null);
    setPixExpired(false);
    setPaymentStatus(null);
    clearPixIntervals();
  };

  const startPixCountdown = (expirationTimestamp) => {
    if (!expirationTimestamp) return;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    const updateTime = () => {
      const diff = expirationTimestamp - Date.now();
      if (diff <= 0) {
        setPixTimeLeft('00:00');
        setPixExpired(true);
        setPaymentStatus((prev) => (prev === 'approved' ? prev : 'expired'));
        clearPixIntervals();
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setPixTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    updateTime();
    countdownIntervalRef.current = setInterval(updateTime, 1000);
  };

  const startPixStatusPolling = (transactionId) => {
    if (!transactionId) return;
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }
    const poll = async () => {
      const statusData = await checkPaymentStatus(transactionId);
      if (!statusData) return;
      setPaymentStatus(statusData.status);
      if (statusData.status === 'approved') {
        clearPixIntervals();
        setChipTicketData((prev) => (prev ? { ...prev, status: statusData.status, approvalDate: statusData.dateApproved } : prev));
        setIsPixPaymentModalVisible(false);
        setIsBuyChipsModalVisible(false);
        setIsSuccessModalVisible(true);
        resetPixState();
      }
      if (statusData.status === 'rejected' || statusData.status === 'cancelled') {
        setPixExpired(true);
        clearPixIntervals();
        setChipTicketData((prev) => (prev ? { ...prev, status: statusData.status } : prev));
      }
    };
    poll();
    statusIntervalRef.current = setInterval(poll, 5000);
  };

  useEffect(() => {
    return () => {
      clearPixIntervals();
    };
  }, []);

  useEffect(() => {
    if (!isPixPaymentModalVisible) {
      clearPixIntervals();
    }
  }, [isPixPaymentModalVisible]);

  // Gerar PIX automaticamente quando o modal abrir
  useEffect(() => {
    const generatePix = async () => {
      if (isPixPaymentModalVisible && selectedChipsPackage && !pixQrCode && !isLoadingPix) {
        await generatePixQrCode(
          selectedChipsPackage.price,
          `Compra de ${selectedChipsPackage.amount} Saldo - VitorTable MT`
        );
      }
    };

    generatePix();
  }, [isPixPaymentModalVisible, selectedChipsPackage]);

  // ... rest of the code ...

  return (
    <View style={styles.container}>
      {/* ... rest of the code ... */}

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
              {/* Coluna da Esquerda - QR Code */}
              <View style={styles.pixQrColumn}>
                {isLoadingPix ? (
                  <View style={styles.pixQrBox}>
                    <Text style={styles.pixQrIcon}>⏳</Text>
                    <Text style={styles.pixQrText}>Gerando QR Code...</Text>
                    <Text style={styles.pixQrSubtext}>Aguarde um momento</Text>
                  </View>
                ) : pixQrCode ? (
                  <View style={styles.pixQrContent}>
                    <PixQRCode
                      qrCode={pixQrCode}
                      qrCodeBase64={pixQrCodeBase64}
                      qrCodeUrl={pixQrCodeUrl}
                      transactionId={chipTicketData?.transactionId}
                      amount={selectedChipsPackage?.price}
                    />
                    {pixTimeLeft && !pixExpired && (
                      <Text style={styles.pixCountdown}>Expira em {pixTimeLeft}</Text>
                    )}
                    {pixExpired && (
                      <Text style={styles.pixExpiredText}>Pagamento expirado. Gere novamente.</Text>
                    )}
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

              {/* Coluna da Direita - Informações e Código PIX */}
              <View style={styles.pixQrColumn}>
                <View style={styles.pixInfoContainer}>
                  <Text style={styles.pixLabel}>Status do Pagamento:</Text>
                  <Text style={[
                    styles.pixStatusText,
                    paymentStatus === 'approved' && { color: '#22C55E' },
                    paymentStatus === 'pending' && { color: '#F59E0B' },
                    paymentStatus === 'rejected' && { color: '#EF4444' }
                  ]}>
                    {paymentStatus === 'approved' && '✅ Pagamento Aprovado'}
                    {paymentStatus === 'pending' && '⏳ Aguardando Pagamento'}
                    {paymentStatus === 'rejected' && '❌ Pagamento Rejeitado'}
                    {!paymentStatus && '--'}
                  </Text>
                  
                  <View style={styles.pixDivider} />
                  
                  <Text style={styles.pixLabel}>Valor:</Text>
                  <Text style={[styles.pixValue, { fontSize: 18, fontWeight: 'bold' }]}>R$ {selectedChipsPackage?.price.toFixed(2)}</Text>
                  
                  <Text style={styles.pixLabel}>Saldo em Fichas:</Text>
                  <Text style={[styles.pixValue, { fontSize: 18, fontWeight: 'bold' }]}>{selectedChipsPackage?.amount}</Text>
                  
                  <View style={styles.pixDivider} />
                  
                  <Text style={styles.pixLabel}>ID da Transação:</Text>
                  <Text style={[styles.pixValue, { fontSize: 12 }]}>{chipTicketData?.transactionId || '--'}</Text>
                  
                  {pixQrCode && (
                    <Pressable 
                      style={[styles.pixCopyButton, { marginTop: 12 }]}
                      onPress={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(pixQrCode);
                          Alert.alert('Sucesso', 'Código PIX copiado para a área de transferência!');
                        }
                      }}
                    >
                      <Text style={styles.pixCopyButtonText}>📋 Copiar Código PIX</Text>
                    </Pressable>
                  )}
                </View>
                
                {/* Visualização da Ficha */}
                {chipTicketData && (
                  <View style={styles.ticketPreviewContainer}>
                    <Text style={styles.previewTitle}>Prévia da Ficha</Text>
                    <View style={styles.ticketPreview}>
                      <Text style={styles.ticketPreviewText}>ID: {chipTicketData.id}</Text>
                      <Text style={styles.ticketPreviewText}>Fichas: {chipTicketData.amount}</Text>
                      <Text style={styles.ticketPreviewText}>Valor: R$ {chipTicketData.price.toFixed(2)}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={() => {
                  setIsPixPaymentModalVisible(false);
                  resetPixState();
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, (isLoadingPix || !pixQrCode || paymentStatus !== 'approved') && styles.modalButtonDisabled]}
                onPress={() => {
                  if (pixQrCode && chipTicketData) {
                    setIsPixPaymentModalVisible(false);
                    setIsBuyChipsModalVisible(false);
                    setIsSuccessModalVisible(true);
                    resetPixState();
                  }
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {paymentStatus === 'approved' ? 'Confirmar Pagamento' : 'Aguardando pagamento'}
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
    maxWidth: 800,  
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 16,
  },
  pixQrColumn: {
    flex: 1,
    minWidth: 300,
    maxWidth: '100%',
    gap: 16,
  },
  pixQrContent: {
    width: '100%',
    alignItems: 'center',
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
