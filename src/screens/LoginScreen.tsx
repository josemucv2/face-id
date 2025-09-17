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
import * as jose from "jose";

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

  const generateNonce = async () => {
    try {
      const resp = await fetch("http://localhost:3000/dev/accounts/biometric-nonce");
  
      if (!resp.ok) {
        throw new Error(`Error HTTP ${resp.status}`);
      }
  
      const data = await resp.json(); // 👈 aquí ya parseas el body
  
      console.log("✅ Nonce generado:", data);
  
      return data; // { nonce, expiresAt }
    } catch (error) {
      console.error("❌ Error generando nonce:", error);
      return null;
    }
  };
  

  const handleBiometricSuccess = async () => {
    setIsAuthenticating(true);
    const nonce1 = await generateNonce();

    try {
      const nonce = nonce1.nonce;
  
      // 👇 Clave pública real (SPKI)
      const publicKeyPem = await BiometricService.getPublicKey();
      // 👇 Firma generada con FaceID/TouchID (base64)
      const signature = await BiometricService.generateBiometricToken(nonce);
  
      if (!signature || !publicKeyPem) {
        throw new Error("No se pudo generar firma o clave pública");
      }
  
      const payload = {
        userId: "jmartinez+crypto2@retorna.app",
        deviceId: BiometricService.getDeviceId(),
        nonce,
        signature,
        publicKeyPem,
        refreshToken: "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.xLGH7fIObIQbJ23hXl9i6SeL-tHcTMGfbdkL54w7BLU54dQR1h2uShj6Czwo4sZ-B83TkrJLBUm1aXJu79LXbHORr8-FttJPg15bU7lR0UeslWstXw1alsf3oTGwPPWgVDhY3lnfoOjIE4kL1FBv6odZqOhXYj6QmE1tCRWLqzdvtjp-iRCf87746I6R5vTzylU2yHBYl51BjKtdEO8qIkVfXR1UJ2GnD4Hu4B-9RfFOlVFVt2-YhzRKUAWFmCfsBQ2CzsaK9FqXv32GNujJZU9gUMwP-ZXOKWd5BdziSBaAS6OplfkY-UussDIrjjDkxeQZkpPvvf57FGgq3a9BiQ.JHCJYYM4UwJcYdPB.G-Hz0ba9okUGmbpfbpCOU9jludSPdCLelQ5rmv8_3z0H17xOolHYALsmryiSL3u8BqaXad32DRNZb-ppkynddpn946D3okc8kKLM5YgXcsx__ZTqe8VEhqSOVd0AUOfb0CxumhLSDZAz4NL6Vjv_t623dUMqcFEVOg3Lo2xoAY5EvwHbARQTl175KfZnyb2z0HiIx1j16EVbRUphi7kP0Bn-ocF5LVpmW_fcpmm4cZuC5ClVFM_HihhAYUK55Raaux57LHVpv4lgGo0jcepMMHpfmX1D5r9oe0gGy5nftphddK32gOHBCvbZ94Mr12w_xlXRT9yCTPtqt_kn2IY11zVLTHfv_azROBzPQOgY9hR19GeWQ5uqGYSUkLeSoFXtVwxFLJVRpzbk4t5I1eu0jfe00z2Iv3IR4DvJ12thpoSJtsDldXMjZLmrqV3PTSmWki7O-jKikOK5UraiOmPeQfB28CJxbTUfrtK5QSSNf31GAqPc19eCUSbxYP6ImdosgjyMtTQWLDAeQR5NbnWLSEOCDSgaSm2Nxs9-olbcwPXUFLAPTXmQrPrJHkjYSiGQp7zuEgE5_73eHRcEK5fsPXcjkF9GbCQKt4OwDvC5TEAnlXgxInj76OUvGYgGv9JOidUaCm-EHYF7fiI3jPfWrL-T40pfyTWNRWEFnBUVBqOHO5AIBg275zS0b_StV-0PHEVpe0fa_kQ-bP2hU7LW8qqHrnk4GY72PMiGxqMPDzxAhCFdVckPVdaV4SupDdUi6HqFYLpAuxL1SKCudXp7_c555RWqymqnLeS6uQzFOaK2sfoBkTNpU5KKdKkOyhb1AQLyfRGsm9TXGxkT3mP5vpaMQWqMisbsUFU3FLAjOclgziNQBO3gxDYKSyjecvX77ksOJiUHguT64bCpKFcDLRInfstDaf3wALSJnlNCchHWlAKeTFumkQhE_86eMWN-R1X-OB-znrmKRka4Ov08VMBoJaNHSOfa9Q5-KWjnaN4NVXyMZD-tHUYDomWH7ATgvd646xsrSjxWyFHrdBu-6R1k6sCK-lcLa_AliRBs1XMl2lIhfnA6waJTFOAHfSPT3XNgsEUVcYfgogO9N1JW7mN5f9huv46z2ndVRVh6LARG4KFp4v59Dtkv6uOjkyDPdX0JOZSsOjETgAbjwbZ2wxrhb_C21R7Rw8ZptE11fGodAlHSnB-_qkk83nTsTkSQrE8bdl8IHiTZG3AX9Zz0JW5Ysj3Iz-GRTltCXWpIG--e-7QU7UceTGRbDBGWdWFVaHlv0yQ-FI0F74QfI5mTu1EiboEbVcuXSlie7lWEjb0alJPT0gfSIOo3pQ.3djKj2LRpaVYguOMfHqPcg",
      };
  
      console.log("📤 Enviando payload a Lambda:", payload);
  
      const resp = await fetch("http://localhost:3000/dev/accounts/biometric-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const data = await resp.json();
      console.log("✅ Respuesta de backend:", data);
  
      if (!resp.ok) throw new Error(data?._message || "Error en autenticación biométrica");
  
      setIsAuthenticating(false);
      onLoginSuccess();
    } catch (error) {
      console.error("❌ Error durante login biométrico:", error);
      setIsAuthenticating(false);
      Alert.alert("Error", error instanceof Error ? error.message : "Fallo en autenticación");
    }
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


function formatAsPem(publicKeyBase64: string): string {
  return [
    "-----BEGIN PUBLIC KEY-----",
    publicKeyBase64.match(/.{1,64}/g)?.join("\n") || publicKeyBase64,
    "-----END PUBLIC KEY-----",
  ].join("\n");
}
