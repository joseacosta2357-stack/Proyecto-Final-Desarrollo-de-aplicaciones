import React from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme, Image } from 'react-native';
import { Text, View } from '@/components/Themed';

const ALUMNOS_DATA = [
  { id: '1', nombre: 'Andrea Rodríguez', grupo: '3° A', promedio: 9.8, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', nombre: 'Carlos Mendoza', grupo: '3° A', promedio: 8.5, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', nombre: 'Diana López', grupo: '3° B', promedio: 9.1, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', nombre: 'Fernando Castillo', grupo: '3° A', promedio: 7.9, avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', nombre: 'Gabriela Silva', grupo: '3° C', promedio: 9.5, avatar: 'https://i.pravatar.cc/150?u=5' },
  { id: '6', nombre: 'Hugo Sánchez', grupo: '3° B', promedio: 8.2, avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: '7', nombre: 'Isabel Torres', grupo: '3° C', promedio: 8.9, avatar: 'https://i.pravatar.cc/150?u=7' },
];

export default function AlumnosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getPromedioColor = (promedio: number) => {
    if (promedio >= 9.0) return '#2ecc71';
    if (promedio >= 8.0) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <ScrollView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.listContainer}>
        {ALUMNOS_DATA.map((item) => (
          <Pressable key={item.id} style={({ pressed }) => [
            styles.card,
            isDark ? styles.cardDark : styles.cardLight,
            pressed && styles.cardPressed
          ]}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            
            <View style={styles.cardContent}>
              <Text style={[styles.studentName, { color: isDark ? '#f0f0f0' : '#222' }]}>{item.nombre}</Text>
              <Text style={[styles.groupText, { color: isDark ? '#aaa' : '#555' }]}>Grupo: {item.grupo}</Text>
            </View>

            <View style={styles.promedioContainer}>
              <Text style={[styles.promedioLabel, { color: isDark ? '#aaa' : '#555' }]}>Promedio</Text>
              <Text style={[styles.promedioValue, { color: getPromedioColor(item.promedio) }]}>
                {item.promedio.toFixed(1)}
              </Text>
            </View>
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
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupText: {
    fontSize: 14,
    color: '#888',
  },
  promedioContainer: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  promedioLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  promedioValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
