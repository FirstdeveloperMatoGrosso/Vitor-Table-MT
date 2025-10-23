import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import colors from '../theme/colors';

export default function PixQRCode({ qrCode, qrCodeUrl, transactionId, amount, onCopy }) {
  const handleCopyQRCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(qrCode);
      Alert.alert('Sucesso', 'Código PIX copiado para a área de transferência!');
      if (onCopy) onCopy();
    }
  };

  return (
    <View style={styles.container}>
      {/* QR Code Visual */}
      <View style={styles.qrCodeBox}>
        {qrCodeUrl ? (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>📱</Text>
            <Text style={styles.qrText}>QR Code PIX</Text>
            <Text style={styles.qrSubtext}>Escaneie para pagar</Text>
          </View>
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrIcon}>⏳</Text>
            <Text style={styles.qrText}>Gerando...</Text>
          </View>
        )}
      </View>

      {/* Informações */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Valor:</Text>
          <Text style={styles.infoValue}>R$ {amount?.toFixed(2)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID:</Text>
          <Text style={styles.infoValueSmall}>{transactionId}</Text>
        </View>
      </View>

      {/* Código PIX Copia e Cola */}
      {qrCode && (
        <View style={styles.copyContainer}>
          <Text style={styles.copyLabel}>Código PIX (Copia e Cola)</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText} numberOfLines={2}>
              {qrCode.substring(0, 50)}...
            </Text>
          </View>
          <Pressable style={styles.copyButton} onPress={handleCopyQRCode}>
            <Text style={styles.copyButtonText}>📋 Copiar Código PIX</Text>
          </Pressable>
        </View>
      )}

      {/* Instruções */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Como pagar:</Text>
        <Text style={styles.instructionsText}>1. Abra o app do seu banco</Text>
        <Text style={styles.instructionsText}>2. Escolha pagar com PIX</Text>
        <Text style={styles.instructionsText}>3. Escaneie o QR Code ou cole o código</Text>
        <Text style={styles.instructionsText}>4. Confirme o pagamento</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  qrCodeBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border
  },
  qrPlaceholder: {
    alignItems: 'center',
    gap: 8
  },
  qrIcon: {
    fontSize: 48
  },
  qrText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  qrSubtext: {
    fontSize: 12,
    color: colors.muted
  },
  infoContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '600'
  },
  infoValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700'
  },
  infoValueSmall: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: 'monospace'
  },
  copyContainer: {
    gap: 8
  },
  copyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text
  },
  codeBox: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  codeText: {
    fontSize: 10,
    color: colors.text,
    fontFamily: 'monospace'
  },
  copyButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  instructions: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    gap: 6
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  instructionsText: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 18
  }
});
