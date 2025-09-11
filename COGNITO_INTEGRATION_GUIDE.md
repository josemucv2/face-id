# Guía de Integración con AWS Cognito

## Datos Disponibles en el Frontend

### 1. Información del Dispositivo
Los console.logs te mostrarán:
```javascript
{
  platform: "ios" | "android",
  version: "número de versión",
  screenWidth: number,
  screenHeight: number,
  timestamp: "ISO string"
}
```

### 2. Datos Biométricos
```javascript
{
  available: boolean,
  biometryType: "TouchID" | "FaceID" | "Biometrics" | null,
  timestamp: "ISO string"
}
```

### 3. **Tokens Criptográficos REALES del Dispositivo** ⭐
```javascript
{
  biometricToken: "token_criptográfico_real_generado_por_el_dispositivo",
  publicKey: "clave_pública_del_dispositivo_para_verificación",
  payload: "cognito_auth"
}
```

### 4. Datos de Sesión (después de autenticación exitosa)
```javascript
{
  authenticationTimestamp: "ISO string",
  biometricTypeUsed: "TouchID" | "FaceID" | "Biometrics",
  deviceInfo: {
    platform: "ios" | "android",
    version: "número de versión"
  },
  cryptographicData: {
    biometricToken: "token_real_del_dispositivo",
    publicKey: "clave_pública_para_verificación"
  }
}
```

## 🔐 **Tokens Criptográficos del Dispositivo**

### **¿Qué son?**
- **Tokens REALES** generados por el hardware del dispositivo
- **Firmados criptográficamente** usando las claves biométricas
- **Únicos por dispositivo** y sesión
- **Verificables** usando la clave pública del dispositivo

### **¿Cómo se generan?**
```javascript
// En el dispositivo (React Native)
const biometricToken = await BiometricService.generateBiometricToken('cognito_auth');
const publicKey = await BiometricService.getPublicKey();
```

### **¿Por qué son importantes para Cognito?**
1. **Autenticación fuerte**: El token prueba que el usuario pasó la verificación biométrica
2. **No falsificable**: Solo puede ser generado por el dispositivo autorizado
3. **Verificable**: Tu backend puede verificar el token usando la clave pública
4. **Único por sesión**: Cada autenticación genera un token diferente

## Flujo de Integración con Cognito

### Opción 1: Lambda Function como Intermediario

1. **Frontend → Lambda Function**
   ```javascript
   // Enviar a tu Lambda function
   const authData = {
     deviceInfo: {
       platform: Platform.OS,
       version: Platform.Version,
       screenWidth: Dimensions.get('screen').width,
       screenHeight: Dimensions.get('screen').height,
       deviceId: `device_${Platform.OS}_${Date.now()}`
     },
     biometricInfo: {
       available: biometricInfo.available,
       biometryType: biometricInfo.biometryType,
       authenticationTimestamp: new Date().toISOString()
     },
     cryptographicData: {
       biometricToken: biometricToken, // ⭐ TOKEN REAL DEL DISPOSITIVO
       publicKey: publicKey, // ⭐ CLAVE PÚBLICA PARA VERIFICACIÓN
       payload: 'cognito_auth'
     },
     userId: "user_id_from_your_app" // Si ya tienes un usuario
   };
   ```

2. **Lambda Function → Cognito**
   ```javascript
   // En tu Lambda function
   const AWS = require('aws-sdk');
   const cognito = new AWS.CognitoIdentityServiceProvider();
   
   exports.handler = async (event) => {
     const { deviceInfo, biometricInfo, cryptographicData, userId } = JSON.parse(event.body);
     
     // ⭐ VERIFICAR EL TOKEN CRIPTOGRÁFICO
     const isTokenValid = await verifyBiometricToken(
       cryptographicData.biometricToken,
       cryptographicData.publicKey,
       cryptographicData.payload
     );
     
     if (!isTokenValid) {
       return {
         statusCode: 401,
         body: JSON.stringify({ error: 'Token biométrico inválido' })
       };
     }
     
     // Opción A: Usar Custom Authentication
     const params = {
       AuthFlow: 'CUSTOM_AUTH',
       ClientId: 'tu_cognito_client_id',
       AuthParameters: {
         'USERNAME': userId,
         'BIOMETRIC_TOKEN': cryptographicData.biometricToken,
         'DEVICE_FINGERPRINT': JSON.stringify(deviceInfo),
         'BIOMETRIC_DATA': JSON.stringify(biometricInfo)
       }
     };
     
     try {
       const result = await cognito.initiateAuth(params).promise();
       return {
         statusCode: 200,
         body: JSON.stringify({
           tokens: result.AuthenticationResult,
           session: result.Session
         })
       };
     } catch (error) {
       console.error('Error en autenticación:', error);
       return {
         statusCode: 400,
         body: JSON.stringify({ error: error.message })
       };
     }
   };
   
   // ⭐ Función para verificar el token biométrico
   async function verifyBiometricToken(token, publicKey, payload) {
     // Aquí implementarías la verificación criptográfica
     // usando la clave pública del dispositivo
     // Esto dependerá del algoritmo usado por react-native-biometrics
     
     // Por ahora, verificamos que el token existe y tiene formato válido
     return token && token.length > 0 && publicKey && publicKey.length > 0;
   }
   ```

### Opción 2: Cognito Direct Integration

1. **Configurar Cognito User Pool con Custom Attributes**
   ```javascript
   // En tu Lambda function de pre-authentication
   exports.preAuthentication = async (event) => {
     const { biometricToken, publicKey, deviceInfo } = event.request.userAttributes;
     
     // ⭐ Verificar token biométrico
     if (!isValidBiometricToken(biometricToken, publicKey)) {
       throw new Error('Token biométrico inválido');
     }
     
     // Validar dispositivo
     if (!isValidDevice(deviceInfo)) {
       throw new Error('Dispositivo no autorizado');
     }
     
     return event;
   };
   ```

## Estructura de Datos Recomendada

### Para el Lambda Function
```javascript
{
  "deviceInfo": {
    "platform": "ios",
    "version": "15.0",
    "screenWidth": 390,
    "screenHeight": 844,
    "deviceId": "device_ios_1234567890"
  },
  "biometricInfo": {
    "available": true,
    "biometryType": "FaceID",
    "authenticationTimestamp": "2024-01-15T10:30:00.000Z"
  },
  "cryptographicData": {
    "biometricToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...", // ⭐ TOKEN REAL
    "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...", // ⭐ CLAVE PÚBLICA
    "payload": "cognito_auth"
  },
  "userContext": {
    "userId": "user_123",
    "appVersion": "1.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Para Cognito Custom Attributes
```javascript
{
  "custom:biometric_token": "token_criptográfico_real",
  "custom:device_public_key": "clave_pública_del_dispositivo",
  "custom:biometric_type": "FaceID",
  "custom:last_biometric_auth": "2024-01-15T10:30:00.000Z",
  "custom:device_id": "device_ios_1234567890"
}
```

## Consideraciones de Seguridad

1. **Validación de Token**: Siempre verificar el token criptográfico en el backend
2. **Clave Pública**: Almacenar la clave pública del dispositivo para verificaciones futuras
3. **Rate Limiting**: Limitar intentos de autenticación por dispositivo
4. **Token Expiration**: Los tokens biométricos pueden tener expiración
5. **Audit Logging**: Registrar todos los intentos de autenticación con tokens
6. **Fallback**: Proporcionar método alternativo de autenticación

## Próximos Pasos

1. Ejecuta la app y revisa los console.logs para ver los tokens reales
2. Identifica qué datos necesitas para tu integración
3. Configura tu Lambda function para recibir y verificar los tokens
4. Implementa la lógica de validación en Cognito
5. Prueba el flujo completo de autenticación con tokens reales
