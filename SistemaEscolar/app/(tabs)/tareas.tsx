import React from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const TAREAS_DATA = [
  { id: '1', titulo: 'Ejercicios de Álgebra', materia: 'Matemáticas', fecha: 'Mañana, 23:59', estado: 'pendiente' },
  { id: '2', titulo: 'Ensayo sobre Revolución Industrial', materia: 'Historia', fecha: 'Viernes, 10:00', estado: 'pendiente' },
  { id: '3', titulo: 'Reporte de Laboratorio', materia: 'Ciencias', fecha: 'Hoy, 18:00', estado: 'entregada' },
  { id: '4', titulo: 'Lectura Capítulos 1-3', materia: 'Literatura', fecha: 'Lunes, 08:00', estado: 'pendiente' },
  { id: '5', titulo: 'Proyecto de Programación', materia: 'Informática', fecha: 'Ayer, 23:59', estado: 'entregada' },
];

export default function TareasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.listContainer}>
        {TAREAS_DATA.map((item) => {
          const isEntregada = item.estado === 'entregada';
          const statusColor = isEntregada ? '#2ecc71' : '#e74c3c';
          const statusIcon = isEntregada ? 'check-circle' : 'exclamation-circle';

          return (
            <Pressable key={item.id} style={({ pressed }) => [
              styles.card,
              isDark ? styles.cardDark : styles.cardLight,
              pressed && styles.cardPressed
            ]}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                  <Text style={styles.materiaText}>{item.materia}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <FontAwesome name={statusIcon} size={14} color={statusColor} style={styles.statusIcon} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.titleText}>{item.titulo}</Text>

              <View style={styles.footer}>
                <FontAwesome name="calendar" size={14} color="#888" style={styles.calendarIcon} />
                <Text style={styles.dateText}>Entrega: {item.fecha}</Text>
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLight: {
    backgroundColor: '#fff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  materiaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  calendarIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
});
