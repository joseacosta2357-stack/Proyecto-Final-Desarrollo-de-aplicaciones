import React, { useState, useCallback } from 'react';
import { StyleSheet, Pressable, ScrollView, useColorScheme, Modal, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [stats, setStats] = useState({
    materias: 0,
    alumnos: 0,
    tareas: 0,
    ultimoAviso: 'Sin avisos',
  });
  const [materiasList, setMateriasList] = useState<any[]>([]);
  const [horarioVisible, setHorarioVisible] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState<any | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadStats = async () => {
        try {
          const [materiasStr, alumnosStr, tareasStr, avisosStr] = await Promise.all([
            AsyncStorage.getItem('@materias_data'),
            AsyncStorage.getItem('@alumnos_data'),
            AsyncStorage.getItem('@tareas_data'),
            AsyncStorage.getItem('@avisos_data')
          ]);

          const materiasArr = materiasStr ? JSON.parse(materiasStr) : [];
          const materiasCount = materiasArr.length;
          const alumnosCount = alumnosStr ? JSON.parse(alumnosStr).length : 0;
          setMateriasList(materiasArr);
          
          let tareasCount = 0;
          if (tareasStr) {
            const parsedTareas = JSON.parse(tareasStr);
            tareasCount = parsedTareas.filter((t: any) => t.estado === 'pendiente').length;
          }
          
          let ultimoAviso = 'Sin avisos';
          if (avisosStr) {
            const avisosArr = JSON.parse(avisosStr);
            if (avisosArr.length > 0) {
              // Get the most recent one by timestamp
              const sorted = avisosArr.sort((a: any, b: any) => b.timestamp - a.timestamp);
              ultimoAviso = sorted[0].titulo;
            }
          }

          setStats({
            materias: materiasCount,
            alumnos: alumnosCount,
            tareas: tareasCount,
            ultimoAviso
          });
        } catch (error) {
          console.error('Error loading stats:', error);
        }
      };

      loadStats();
    }, [])
  );

  const cards = [
    {
      title: 'Materias Activas',
      value: stats.materias.toString(),
      icon: 'book',
      href: '/materias',
      color: '#3498db',
    },
    {
      title: 'Total de Alumnos',
      value: stats.alumnos.toString(),
      icon: 'users',
      href: '/alumnos',
      color: '#2ecc71',
    },
    {
      title: 'Tareas Pendientes',
      value: stats.tareas.toString(),
      icon: 'tasks',
      href: '/tareas',
      color: '#e74c3c',
    },
    {
      title: 'Último Aviso',
      value: stats.ultimoAviso,
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
                <Text style={[styles.cardValue, { color: card.color }]} numberOfLines={1}>{card.value}</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color={isDark ? '#555' : '#ccc'} />
            </Pressable>
          </Link>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.scheduleButton, { backgroundColor: isDark ? '#2c3e50' : '#eaf2f8' }]} 
        onPress={() => setHorarioVisible(true)}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#3498db20', marginRight: 16 }]}>
          <FontAwesome name="calendar" size={24} color="#3498db" />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: isDark ? '#aaa' : '#888' }]}>Horario de Clases</Text>
          <Text style={[styles.cardValue, { color: '#3498db', fontSize: 18 }]}>Ver vista semanal</Text>
        </View>
        <FontAwesome name="chevron-right" size={16} color={isDark ? '#555' : '#ccc'} />
      </TouchableOpacity>

      {/* Horario Modal */}
      <Modal visible={horarioVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setHorarioVisible(false); setSelectedMateria(null); }}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#121212' : '#f8f9fa' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>Horario Semanal</Text>
            <TouchableOpacity onPress={() => { setHorarioVisible(false); setSelectedMateria(null); }} style={styles.closeBtn}>
              <FontAwesome name="times" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scheduleScroll}>
              {DAYS.map(day => {
                const daySubjects = materiasList.filter(m => parseDaysFromHorario(m.horario).includes(day)).sort((a, b) => {
                  const timeA = extractTime(a.horario);
                  const timeB = extractTime(b.horario);
                  return timeA.localeCompare(timeB);
                });

                return (
                  <View key={day} style={styles.dayColumn}>
                    <View style={[styles.dayHeaderBox, { backgroundColor: isDark ? '#1e1e1e' : '#e0e0e0' }]}>
                      <Text style={[styles.dayHeaderText, { color: isDark ? '#fff' : '#000' }]}>{day}</Text>
                    </View>
                    {daySubjects.length === 0 ? (
                      <View style={[styles.emptySlot, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                        <Text style={[styles.emptySlotText, { color: isDark ? '#555' : '#ccc' }]}>Libre</Text>
                      </View>
                    ) : (
                      daySubjects.map(m => (
                        <TouchableOpacity 
                          key={m.id} 
                          style={[styles.subjectBlock, { backgroundColor: isDark ? '#1e1e1e' : '#fff', borderLeftColor: m.color }]} 
                          onPress={() => setSelectedMateria(m)}
                        >
                          <Text style={[styles.subjectBlockTime, { color: isDark ? '#aaa' : '#888' }]}>
                            <FontAwesome name="clock-o" size={12} /> {extractTime(m.horario)}
                          </Text>
                          <Text style={[styles.subjectBlockName, { color: isDark ? '#fff' : '#000' }]} numberOfLines={2}>{m.nombre}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </ScrollView>
        </View>
      </Modal>

      {/* Detalle Materia Modal */}
      <Modal visible={!!selectedMateria} animationType="fade" transparent={true} onRequestClose={() => setSelectedMateria(null)}>
        <View style={styles.detailModalOverlay}>
          <View style={[styles.detailModalContent, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            {selectedMateria && (
              <>
                <View style={[styles.detailHeader, { backgroundColor: selectedMateria.color }]}>
                  <Text style={styles.detailTitle}>{selectedMateria.nombre}</Text>
                  <TouchableOpacity onPress={() => setSelectedMateria(null)} style={styles.closeDetailBtn}>
                    <FontAwesome name="times" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.detailBody, { backgroundColor: 'transparent' }]}>
                  <View style={[styles.detailRow, { backgroundColor: 'transparent' }]}>
                    <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                      <FontAwesome name="user" size={18} color={selectedMateria.color} />
                    </View>
                    <View style={[styles.detailTextContainer, { backgroundColor: 'transparent' }]}>
                      <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#555' }]}>Profesor</Text>
                      <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000' }]}>{selectedMateria.profesor || 'No asignado'}</Text>
                    </View>
                  </View>
                  <View style={[styles.detailRow, { backgroundColor: 'transparent' }]}>
                    <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                      <FontAwesome name="clock-o" size={18} color={selectedMateria.color} />
                    </View>
                    <View style={[styles.detailTextContainer, { backgroundColor: 'transparent' }]}>
                      <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#555' }]}>Horario Completo</Text>
                      <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000' }]}>{selectedMateria.horario || 'No asignado'}</Text>
                    </View>
                  </View>
                  {selectedMateria.descripcion ? (
                    <View style={[styles.detailDescriptionBox, { backgroundColor: isDark ? '#2c2c2c' : '#f8f9fa' }]}>
                      <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#555', marginBottom: 8 }]}>Descripción</Text>
                      <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000', lineHeight: 22 }]}>{selectedMateria.descripcion}</Text>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// Helpers for Schedule
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const parseDaysFromHorario = (horario: string) => {
  const days: string[] = [];
  if (!horario) return days;
  const lower = horario.toLowerCase();
  if (lower.includes('lun')) days.push('Lunes');
  if (lower.includes('mar')) days.push('Martes');
  if (lower.includes('mié') || lower.includes('mie')) days.push('Miércoles');
  if (lower.includes('jue')) days.push('Jueves');
  if (lower.includes('vie')) days.push('Viernes');
  
  // If it says "lunes a viernes"
  if (lower.includes('lunes a viernes') || lower.includes('lun a vie')) {
    return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  }
  
  return days;
};

const extractTime = (horario: string) => {
  if (!horario) return '';
  const match = horario.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : 'Sin hora';
};

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
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
  },
  scheduleScroll: {
    padding: 16,
  },
  dayColumn: {
    width: 140,
    marginRight: 16,
  },
  dayHeaderBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  subjectBlock: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  subjectBlockTime: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  subjectBlockName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySlot: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 14,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  detailModalContent: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  closeDetailBtn: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBody: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
  },
  detailDescriptionBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
});
