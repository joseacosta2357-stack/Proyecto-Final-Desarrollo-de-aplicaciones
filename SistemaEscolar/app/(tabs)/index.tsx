import React from 'react';
import { StyleSheet, Pressable, ScrollView, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cards = [
    {
      title: 'Materias Activas',
      value: '6',
      icon: 'book',
      href: '/materias',
      color: '#3498db',
    },
    {
      title: 'Total de Alumnos',
      value: '124',
      icon: 'users',
      href: '/alumnos',
      color: '#2ecc71',
    },
    {
      title: 'Tareas Pendientes',
      value: '12',
      icon: 'tasks',
      href: '/tareas',
      color: '#e74c3c',
    },
    {
      title: 'Último Aviso',
      value: 'Reunión de padres',
      icon: 'bell',
      href: '/avisos',
      color: '#f39c12',
    },
  ];

  return (
    <ScrollView style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: isDark ? '#fff' : '#000' }]}>¡Hola, Profesor!</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#aaa' : '#888' }]}>Resumen del día</Text>
      </View>

      <View style={styles.cardsContainer}>
        {cards.map((card, index) => (
          <Link href={card.href as any} asChild key={index}>
            <Pressable style={({ pressed }) => [
              styles.card,
              isDark ? styles.cardDark : styles.cardLight,
              pressed && styles.cardPressed
            ]}>
              <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                <FontAwesome name={card.icon as any} size={24} color={card.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: isDark ? '#aaa' : '#888' }]}>{card.title}</Text>
                <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={isDark ? '#555' : '#ccc'} />
            </Pressable>
          </Link>
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
  header: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  cardsContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
