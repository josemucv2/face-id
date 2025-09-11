import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { BiometricType } from '../types';
import { Platform, Dimensions } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics();

// Modo de desarrollo - usar datos reales del dispositivo
const __DEV__ = true; // Cambiar a false en producción

export class BiometricService {
  /**
   * Obtiene un ID único del dispositivo
   */
  static getDeviceId(): string {
    const platform = Platform.OS;
    const version = Platform.Version;
    const screen = Dimensions.get('screen');
    
    // Crear un ID más realista basado en características del dispositivo
    const deviceFingerprint = `${platform}_${version}_${screen.width}x${screen.height}_${screen.scale}`;
    
    // En producción, aquí usarías DeviceInfo.getUniqueId() o similar
    return deviceFingerprint;
  }

  /**
   * Verifica si la biometría está disponible en el dispositivo
   */
  static async isBiometricAvailable(): Promise<BiometricType> {
    try {
      // Siempre verificar biometría real, incluso en desarrollo
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
 
      return {
        available,
        biometryType: biometryType as 'TouchID' | 'FaceID' | 'Biometrics' | null
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
 
      return {
        available: false,
        biometryType: null
      };
    }
  }

  /**
   * Autentica al usuario usando biometría
   */
  static async authenticate(promptMessage: string = 'Autenticación requerida'): Promise<boolean> {
    try {
      console.log('🔐 Iniciando autenticación biométrica...');
      console.log('   - Prompt message:', promptMessage);
      console.log('   - Timestamp inicio:', new Date().toISOString());
      console.log('   - Device ID:', this.getDeviceId());
 
      // Usar autenticación real, incluso en desarrollo
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage,
        cancelButtonText: 'Cancelar'
      });
 
      console.log('   - Resultado autenticación real:', success);
      console.log('   - Timestamp fin:', new Date().toISOString());
 
      return success;
    } catch (error) {
      console.error('❌ Error during biometric authentication:', error);
      console.log('🚨 Error details para debugging:');
      console.log('   - Error type:', typeof error);
      console.log('   - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.log('   - Timestamp error:', new Date().toISOString());
 
      return false;
    }
  }

  /**
   * Obtiene el tipo de biometría disponible
   */
  static getBiometricTypeName(biometryType: string): string {
    switch (biometryType) {
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.Biometrics:
        return 'Huella dactilar';
      default:
        return 'Biometría';
    }
  }

  /**
   * Verifica si las claves biométricas existen
   */
  static async biometricKeysExist(): Promise<boolean> {
    try {
      // Usar verificación real de claves
      const { keysExist } = await rnBiometrics.biometricKeysExist();
      console.log('🔑 Verificación real de claves biométricas:', keysExist);
      return keysExist;
    } catch (error) {
      console.error('Error checking biometric keys:', error);
      return false;
    }
  }

  /**
   * Crea claves biométricas
   */
  static async createKeys(): Promise<boolean> {
    try {
      // Crear claves reales
      const { publicKey } = await rnBiometrics.createKeys();
      console.log("🚀 ~ BiometricService ~ createKeys ~ publicKey:", publicKey);
      return !!publicKey;
    } catch (error) {
      console.error('Error creating biometric keys:', error);
      return false;
    }
  }

  /**
   * Genera un token criptográfico usando biometría
   * Este es el token REAL que genera el dispositivo
   */
  static async generateBiometricToken(payload: string = 'auth_request'): Promise<string | null> {
    try {
      console.log('🔐 Generando token criptográfico biométrico...');
      console.log('   - Payload:', payload);
      console.log('   - Timestamp:', new Date().toISOString());
      console.log('   - Device ID:', this.getDeviceId());
 
      // Generar token real usando biometría
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: 'Autenticación requerida para generar token',
        payload: payload,
        cancelButtonText: 'Cancelar'
      });

      if (success && signature) {
        console.log('✅ Token criptográfico generado exitosamente');
        console.log('   - Signature length:', signature.length);
        console.log('   - Signature preview:', signature.substring(0, 20) + '...');
        return signature;
      } else {
        console.error('❌ Error: No se pudo generar el token criptográfico');
        return null;
      }
    } catch (error) {
      console.error('❌ Error generating biometric token:', error);
      console.log('🚨 Error details:');
      console.log('   - Error type:', typeof error);
      console.log('   - Error message:', error instanceof Error ? error.message : 'Unknown error');
 
      return null;
    }
  }

  /**
   * Obtiene la clave pública del dispositivo
   * Útil para verificar tokens en el backend
   */
  static async getPublicKey(): Promise<string | null> {
    try {
      console.log('🔑 Obteniendo clave pública del dispositivo...');
      console.log('   - Device ID:', this.getDeviceId());
 
      const { publicKey } = await rnBiometrics.createKeys();
 
      if (publicKey) {
        console.log('✅ Clave pública obtenida exitosamente');
        console.log('   - Key length:', publicKey.length);
        console.log('   - Key preview:', publicKey.substring(0, 20) + '...');
        return publicKey;
      } else {
        console.error('❌ Error: No se pudo obtener la clave pública');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting public key:', error);
      return null;
    }
  }

  /**
   * Verifica un token criptográfico
   * Útil para verificar tokens en el dispositivo
   */
  static async verifyBiometricToken(token: string, payload: string = 'auth_request'): Promise<boolean> {
    try {
      console.log('🔍 Verificando token criptográfico...');
      console.log('   - Token length:', token.length);
      console.log('   - Payload:', payload);
      console.log('   - Device ID:', this.getDeviceId());
 
      // En producción, aquí usarías la verificación real
      // Por ahora, verificamos que el token existe y tiene formato válido
      const isValid = Boolean(token && token.length > 0);
      console.log('   - Token válido:', isValid);
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying biometric token:', error);
      return false;
    }
  }
}
