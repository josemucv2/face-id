import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { BiometricButton } from '../components/BiometricButton';
import { BiometricService } from '../services/biometricService';
import { BiometricType } from '../types';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [biometricInfo, setBiometricInfo] = useState<BiometricType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Log información del dispositivo para Cognito
    console.log('🚀 === INICIO DEBUG COGNITO INTEGRATION ===');
    console.log('📱 Información del dispositivo:');
    console.log('   - Platform:', Platform.OS);
    console.log('   - Version:', Platform.Version);
    console.log('   - Screen dimensions:', Dimensions.get('screen'));
    console.log('   - Window dimensions:', Dimensions.get('window'));
    console.log('   - Device ID (REAL):', BiometricService.getDeviceId());
    
    // Log información que podrías enviar a Cognito
    console.log('🔐 Datos para Cognito:');
    console.log('   - Device fingerprint:', {
      platform: Platform.OS,
      version: Platform.Version,
      screenWidth: Dimensions.get('screen').width,
      screenHeight: Dimensions.get('screen').height,
      deviceId: BiometricService.getDeviceId(),
      timestamp: new Date().toISOString()
    });
    
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Verificando disponibilidad de biometría...');
      
      const biometricData = await BiometricService.isBiometricAvailable();
      setBiometricInfo(biometricData);
      
      console.log('✅ Resultado verificación biometría:', biometricData);
      console.log('📊 Datos biométricos para Cognito:');
      console.log('   - Biometría disponible:', biometricData.available);
      console.log('   - Tipo de biometría:', biometricData.biometryType);
      console.log('   - Timestamp verificación:', new Date().toISOString());
      
      // Si la biometría está disponible, verificar si las claves existen
      if (biometricData.available) {
        console.log('🔑 Verificando existencia de claves biométricas...');
        const keysExist = await BiometricService.biometricKeysExist();
        console.log('   - Claves existentes:', keysExist);
        
        if (!keysExist) {
          console.log('🔑 Creando nuevas claves biométricas...');
          const keysCreated = await BiometricService.createKeys();
          console.log('   - Claves creadas exitosamente:', keysCreated);
          
          if (!keysCreated) {
            console.error('❌ Error: No se pudieron crear las claves biométricas');
            Alert.alert(
              'Error',
              'No se pudieron crear las claves biométricas. Algunas funciones pueden no estar disponibles.'
            );
          }
        }
      }
      
      // Log resumen para integración con Cognito
      console.log('📋 RESUMEN PARA COGNITO:');
      console.log('   - Dispositivo compatible:', biometricData.available);
      console.log('   - Método de autenticación:', biometricData.biometryType || 'N/A');
      console.log('   - Claves biométricas configuradas:', biometricData.available);
      console.log('   - Listo para autenticación:', biometricData.available);
      
    } catch (error) {
      console.error('❌ Error checking biometric availability:', error);
      console.log('🚨 Error details para debugging:');
      console.log('   - Error type:', typeof error);
      console.log('   - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      Alert.alert(
        'Error',
        'No se pudo verificar la disponibilidad de biometría.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSuccess = async () => {
    console.log('🎉 Autenticación biométrica exitosa!');
    console.log('🔐 Generando token criptográfico del dispositivo...');
    
    try {
      // Generar token criptográfico REAL del dispositivo
      const biometricToken = await BiometricService.generateBiometricToken('cognito_auth');
      const publicKey = await BiometricService.getPublicKey();
      
      console.log('🔐 Datos de sesión para Cognito:');
      console.log('   - Authentication timestamp:', new Date().toISOString());
      console.log('   - Biometric type used:', biometricInfo?.biometryType);
      console.log('   - Device info:', {
        platform: Platform.OS,
        version: Platform.Version
      });
      console.log('   - Biometric token (REAL):', biometricToken);
      console.log('   - Public key:', publicKey);
      
      // Aquí podrías hacer la llamada a Cognito
      console.log('🌐 INTEGRACIÓN COGNITO - Puntos de integración:');
      console.log('   1. Enviar biometricToken a Lambda');
      console.log('   2. Enviar publicKey para verificación');
      console.log('   3. Obtener tokens de Cognito (ID, Access, Refresh)');
      console.log('   4. Almacenar tokens de forma segura');
      console.log('   5. Configurar sesión de usuario');
      
      // Estructura de datos para enviar a tu Lambda
      const authDataForCognito = {
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
          screenWidth: Dimensions.get('screen').width,
          screenHeight: Dimensions.get('screen').height,
          deviceId: BiometricService.getDeviceId()
        },
        biometricInfo: {
          available: biometricInfo?.available,
          biometryType: biometricInfo?.biometryType,
          authenticationTimestamp: new Date().toISOString()
        },
        cryptographicData: {
          biometricToken: biometricToken,
          publicKey: publicKey,
          payload: 'cognito_auth'
        }
      };
      
      console.log('📤 Datos completos para enviar a Lambda:', authDataForCognito);
      
    } catch (error) {
      console.error('❌ Error generando token criptográfico:', error);
    }
    
    setIsAuthenticating(false);
    onLoginSuccess();
  };

  const handleBiometricError = (error: string) => {
    console.error('❌ Error de autenticación biométrica:', error);
    console.log('🚨 Error details para debugging:');
    console.log('   - Error message:', error);
    console.log('   - Timestamp:', new Date().toISOString());
    console.log('   - Biometric info at error:', biometricInfo);
    
    setIsAuthenticating(false);
    Alert.alert('Error de autenticación', error);
  };

  const handleBiometricPress = () => {
    console.log('👆 Usuario presionó botón biométrico');
    console.log('🔄 Iniciando proceso de autenticación...');
    console.log('📊 Estado actual:');
    console.log('   - Biometric info:', biometricInfo);
    console.log('   - Loading state:', isLoading);
    console.log('   - Authenticating state:', isAuthenticating);
    
    setIsAuthenticating(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verificando biometría...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>
            Inicia sesión usando tu biometría
          </Text>
        </View>

        <View style={styles.biometricSection}>
          {biometricInfo?.available ? (
            <>
              <Text style={styles.biometricInfo}>
                {BiometricService.getBiometricTypeName(biometricInfo.biometryType || '')} disponible
              </Text>
              <BiometricButton
                onSuccess={handleBiometricSuccess}
                onError={handleBiometricError}
                promptMessage="Inicia sesión en la aplicación"
                biometricInfo={biometricInfo}
                loading={isAuthenticating}
                onPress={handleBiometricPress}
              />
            </>
          ) : (
            <View style={styles.noBiometricContainer}>
              <Text style={styles.noBiometricText}>
                La biometría no está disponible en este dispositivo
              </Text>
              <Text style={styles.noBiometricSubtext}>
                Asegúrate de tener configurado Face ID, Touch ID o huella dactilar
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Esta aplicación utiliza biometría para una autenticación segura
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  biometricSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  biometricInfo: {
    fontSize: 14,
    color: '#34C759',
    marginBottom: 16,
    fontWeight: '500',
  },
  noBiometricContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noBiometricText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  noBiometricSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
  },
});
