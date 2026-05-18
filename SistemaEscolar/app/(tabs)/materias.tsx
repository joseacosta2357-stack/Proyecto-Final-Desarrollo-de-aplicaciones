import React from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MATERIAS_DATA = [
  { id: '1', nombre: 'Matemáticas Avanzadas', profesor: 'Dr. Roberto Gómez', horario: 'Lun, Mie 10:00-11:30', color: '#3498db' },
  { id: '2', nombre: 'Historia Universal', profesor: 'Mtra. Elena Suárez', horario: 'Mar, Jue 08:00-09:30', color: '#9b59b6' },
  { id: '3', nombre: 'Ciencias Naturales', profesor: 'Ing. Carlos Medina', horario: 'Vie 10:00-13:00', color: '#2ecc71' },
  { id: '4', nombre: 'Literatura Contemporánea', profesor: 'Lic. Ana Martínez', horario: 'Lun, Mie 12:00-13:30', color: '#e67e22' },
  { id: '5', nombre: 'Educación Física', profesor: 'Prof. Juan Pérez', horario: 'Mar, Jue 11:00-12:00', color: '#e74c3c' },
];

export default function MateriasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.listContainer}>
        {MATERIAS_DATA.map((item) => (
          <Pressable key={item.id} style={({ pressed }) => [
            styles.card,
            isDark ? styles.cardDark : styles.cardLight,
            pressed && styles.cardPressed
          ]}>
            <View style={[styles.colorBar, { backgroundColor: item.color }]} />
            <View style={styles.cardContent}>
              <Text style={styles.subjectName}>{item.nombre}</Text>
              
              <View style={styles.row}>
                <FontAwesome name="user" size={14} color="#888" style={styles.icon} />
                <Text style={styles.detailText}>{item.profesor}</Text>
              </View>
              
              <View style={styles.row}>
                <FontAwesome name="clock-o" size={14} color="#888" style={styles.icon} />
                <Text style={styles.detailText}>{item.horario}</Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={16} color={isDark ? '#555' : '#ccc'} style={styles.chevron} />
          </Pressable>
        ))}
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
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
  colorBar: {
    width: 6,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    alignSelf: 'center',
    padding: 16,
  },
});
