import React from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const AVISOS_DATA = [
  { id: '1', titulo: 'Reunión de Padres de Familia', fecha: 'Hoy, 10:00 AM', contenido: 'Se les recuerda la reunión bimestral obligatoria en el auditorio principal.', tipo: 'urgente' },
  { id: '2', titulo: 'Suspensión de Labores', fecha: 'Ayer', contenido: 'El próximo lunes no habrá clases debido al día festivo nacional.', tipo: 'info' },
  { id: '3', titulo: 'Feria de Ciencias 2026', fecha: 'Hace 3 días', contenido: 'Inscripciones abiertas para participar en la feria anual. Revisa las bases.', tipo: 'evento' },
  { id: '4', titulo: 'Nuevo Menú en Cafetería', fecha: 'Hace 1 semana', contenido: 'Hemos actualizado las opciones de comida saludable para los alumnos.', tipo: 'info' },
];

export default function AvisosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTipoEstilo = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return { color: '#e74c3c', icon: 'exclamation-triangle' };
      case 'evento': return { color: '#9b59b6', icon: 'calendar' };
      default: return { color: '#3498db', icon: 'info-circle' };
    }
  };

  return (
    <ScrollView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.listContainer}>
        {AVISOS_DATA.map((item) => {
          const estilo = getTipoEstilo(item.tipo);

          return (
            <Pressable key={item.id} style={({ pressed }) => [
              styles.card,
              isDark ? styles.cardDark : styles.cardLight,
              pressed && styles.cardPressed
            ]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <FontAwesome name={estilo.icon as any} size={16} color={estilo.color} style={styles.headerIcon} />
                  <Text style={styles.titleText}>{item.titulo}</Text>
                </View>
                <Text style={styles.dateText}>{item.fecha}</Text>
              </View>

              <Text style={styles.contentText} numberOfLines={2}>{item.contenido}</Text>

              <View style={styles.footer}>
                <Text style={styles.readMoreText}>Leer aviso completo</Text>
                <FontAwesome name="arrow-right" size={12} color="#3498db" />
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  listContainer: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: 'transparent',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
    borderLeftColor: '#2980b9',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  contentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  readMoreText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
    marginRight: 6,
  },
});
