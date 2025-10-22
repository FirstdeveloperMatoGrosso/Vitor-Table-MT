import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Pressable, Dimensions, TouchableOpacity } from 'react-native';
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
  const { isKioskMode = false, kioskFunctions = {} } = screenParams || {};

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
    const mesaNumber = Math.floor(Math.random() * 100) + 1;
    onNavigate('Products', {
      user: {
        name,
        email,
        phone,
        cpf,
        tableCapacity,
        mesa: mesaNumber
      }
    });
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
    borderBottomColor: colors.accent,
    fontSize: 14,
    paddingVertical: 10,
    marginBottom: 16
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
  }
});
