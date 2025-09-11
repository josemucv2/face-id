import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { BiometricService } from '../services/biometricService';
import { BiometricType } from '../types';

interface BiometricButtonProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  promptMessage?: string;
  biometricInfo?: BiometricType;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

export const BiometricButton: React.FC<BiometricButtonProps> = ({
  onSuccess,
  onError,
  promptMessage = 'Autenticación requerida',
  biometricInfo,
  disabled = false,
  loading = false,
  onPress,
}) => {
  const handleBiometricAuth = async () => {
    if (onPress) {
      onPress();
    }
    
    try {
      const success = await BiometricService.authenticate(promptMessage);
      
      if (success) {
        onSuccess();
      } else {
        onError('Autenticación fallida');
      }
    } catch (error) {
      onError('Error durante la autenticación');
    }
  };

  const getButtonText = () => {
    if (loading) return 'Verificando...';
    
    if (!biometricInfo?.available) {
      return 'Biometría no disponible';
    }

    const typeName = biometricInfo.biometryType 
      ? BiometricService.getBiometricTypeName(biometricInfo.biometryType)
      : 'Biometría';
    
    return `Iniciar sesión con ${typeName}`;
  };

  const isDisabled = disabled || loading || !biometricInfo?.available;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={handleBiometricAuth}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {loading && <ActivityIndicator size="small" color="#ffffff" style={styles.loader} />}
        <Text style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}>
          {getButtonText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#8E8E93',
  },
  loader: {
    marginRight: 8,
  },
});
