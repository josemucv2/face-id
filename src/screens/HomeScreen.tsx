import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { BiometricButton } from '../components/BiometricButton';
import { BiometricService } from '../services/biometricService';

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleBiometricSuccess = () => {
    setIsAuthenticating(false);
    Alert.alert(
      'Autenticación exitosa',
      '¡Has sido autenticado exitosamente con biometría!',
      [{ text: 'OK' }]
    );
  };

  const handleBiometricError = (error: string) => {
    setIsAuthenticating(false);
    Alert.alert('Error de autenticación', error);
  };

  const handleBiometricPress = () => {
    setIsAuthenticating(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inicio</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
          <Text style={styles.welcomeSubtitle}>
            Has iniciado sesión exitosamente usando biometría
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Autenticación biométrica</Text>
          <Text style={styles.cardDescription}>
            Prueba la autenticación biométrica nuevamente para verificar que funciona correctamente.
          </Text>

          <BiometricButton
            onSuccess={handleBiometricSuccess}
            onError={handleBiometricError}
            promptMessage="Verificar autenticación biométrica"
            loading={isAuthenticating}
            onPress={handleBiometricPress}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de la aplicación</Text>
          <Text style={styles.cardDescription}>
            Esta es una aplicación de prueba para demostrar la funcionalidad de autenticación biométrica en React Native.
          </Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Características:</Text>
            <Text style={styles.infoValue}>• Face ID / Touch ID / Huella dactilar</Text>
            <Text style={styles.infoValue}>• Autenticación segura</Text>
            <Text style={styles.infoValue}>• Interfaz moderna</Text>
            <Text style={styles.infoValue}>• Manejo de errores</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado de la sesión</Text>
          <View style={styles.statusItem}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Sesión activa</Text>
          </View>
          <Text style={styles.statusDescription}>
            Tu sesión está activa y segura. Puedes usar la autenticación biométrica en cualquier momento.
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoItem: {
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  statusDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});
