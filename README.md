# Spike Face ID / Biometría

Una aplicación de prueba (spike) para demostrar la funcionalidad de autenticación biométrica en React Native.

## Características

- ✅ Autenticación con Face ID (iOS)
- ✅ Autenticación con Touch ID (iOS)
- ✅ Autenticación con huella dactilar (Android)
- ✅ Interfaz moderna y responsive
- ✅ Manejo de errores robusto
- ✅ Verificación de disponibilidad de biometría
- ✅ Creación automática de claves biométricas

## Tecnologías utilizadas

- React Native 0.80.2
- TypeScript
- react-native-biometrics
- React Navigation (para futuras expansiones)

## Estructura del proyecto

```
src/
├── components/
│   └── BiometricButton.tsx    # Componente reutilizable para autenticación
├── screens/
│   ├── LoginScreen.tsx        # Pantalla de login con biometría
│   └── HomeScreen.tsx         # Pantalla principal después del login
├── services/
│   └── biometricService.ts    # Servicio para manejar biometría
└── types/
    └── index.ts              # Definiciones de tipos TypeScript
```

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Para iOS, instala los pods:
   ```bash
   cd ios && pod install && cd ..
   ```

## Configuración

### Android

Los permisos necesarios ya están configurados en `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### iOS

Para iOS, asegúrate de tener configurado Face ID o Touch ID en tu dispositivo/simulador.

## Uso

1. Ejecuta la aplicación:
   ```bash
   # Para Android
   npm run android
   
   # Para iOS
   npm run ios
   ```

2. La aplicación verificará automáticamente si la biometría está disponible en tu dispositivo.

3. Si la biometría está disponible, verás un botón para iniciar sesión.

4. Toca el botón y usa tu Face ID, Touch ID o huella dactilar para autenticarte.

5. Una vez autenticado, serás llevado a la pantalla de inicio donde puedes:
   - Probar la autenticación biométrica nuevamente
   - Ver información sobre la aplicación
   - Cerrar sesión

## Funcionalidades

### Verificación de biometría
- Detecta automáticamente el tipo de biometría disponible
- Muestra mensajes apropiados según el dispositivo
- Maneja casos donde la biometría no está disponible

### Autenticación segura
- Usa las APIs nativas de biometría
- Maneja errores de autenticación
- Proporciona feedback visual durante el proceso

### Interfaz de usuario
- Diseño moderno y limpio
- Estados de carga apropiados
- Mensajes de error claros
- Navegación intuitiva

## Consideraciones de seguridad

- La aplicación usa las APIs nativas de biometría del sistema operativo
- Las claves biométricas se crean automáticamente cuando es necesario
- No se almacenan datos sensibles en la aplicación
- Se siguen las mejores prácticas de seguridad de React Native

## Troubleshooting

### La biometría no funciona en el simulador
- Para iOS: Asegúrate de tener configurado Face ID o Touch ID en el simulador
- Para Android: Usa un dispositivo físico o emulador con sensor de huella dactilar

### Errores de permisos
- Verifica que los permisos estén correctamente configurados en el AndroidManifest.xml
- Para iOS, asegúrate de que la aplicación tenga acceso a la biometría

### Errores de compilación
- Limpia el proyecto: `cd android && ./gradlew clean && cd ..`
- Para iOS: `cd ios && pod install && cd ..`

## Próximas mejoras

- [ ] Integración con React Navigation para navegación más compleja
- [ ] Persistencia de estado de autenticación
- [ ] Configuración de biometría
- [ ] Logs de autenticación
- [ ] Tests unitarios y de integración

## Licencia

Este proyecto es para fines educativos y de prueba.
