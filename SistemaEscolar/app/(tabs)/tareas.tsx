import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme, Modal, TextInput, Alert, View, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export type EstadoTarea = 'pendiente' | 'en revisión' | 'entregada';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  materia: string;
  fecha: string;
  estado: EstadoTarea;
}

const STORAGE_KEY = '@tareas_data';

const DEFAULT_TAREAS: Tarea[] = [
  { id: '1', titulo: 'Ejercicios de Álgebra', descripcion: 'Resolver página 45 a 47', materia: 'Matemáticas', fecha: 'Mañana, 23:59', estado: 'pendiente' },
  { id: '2', titulo: 'Ensayo sobre Revolución Industrial', descripcion: 'Mínimo 3 cuartillas', materia: 'Historia', fecha: 'Viernes, 10:00', estado: 'pendiente' },
  { id: '3', titulo: 'Reporte de Laboratorio', descripcion: 'Incluir fotos de la práctica', materia: 'Ciencias', fecha: 'Hoy, 18:00', estado: 'entregada' },
];

export default function TareasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarea | 'todos'>('todos');
  const [filtroMateria, setFiltroMateria] = useState<string>('todas');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleModalVisible, setDetalleModalVisible] = useState(false);
  
  const [tareaActual, setTareaActual] = useState<Partial<Tarea>>({});
  const [tareaDetalle, setTareaDetalle] = useState<Tarea | null>(null);
  const [materiasGlobales, setMateriasGlobales] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadTareas();
      loadMaterias();
    }, [])
  );

  const loadMaterias = async () => {
    try {
      const stored = await AsyncStorage.getItem('@materias_data');
      if (stored) {
        const mats = JSON.parse(stored);
        setMateriasGlobales(mats.map((m: any) => m.nombre));
      }
    } catch(e) {}
  };

  const loadTareas = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTareas(JSON.parse(stored));
      } else {
        setTareas(DEFAULT_TAREAS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TAREAS));
      }
    } catch (error) {
      console.error('Error loading tareas:', error);
    }
  };

  const saveTareas = async (nuevasTareas: Tarea[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasTareas));
      setTareas(nuevasTareas);
    } catch (error) {
      console.error('Error saving tareas:', error);
    }
  };

  const handleSaveTarea = () => {
    if (!tareaActual.titulo || !tareaActual.materia) {
      Alert.alert('Error', 'El título y la materia son obligatorios.');
      return;
    }
    
    let nuevasTareas;
    if (tareaActual.id) {
      nuevasTareas = tareas.map(t => t.id === tareaActual.id ? { ...t, ...tareaActual } as Tarea : t);
    } else {
      const nuevaTarea: Tarea = {
        id: Date.now().toString(),
        titulo: tareaActual.titulo || '',
        descripcion: tareaActual.descripcion || '',
        materia: tareaActual.materia || '',
        fecha: tareaActual.fecha || '',
        estado: tareaActual.estado || 'pendiente',
      };
      nuevasTareas = [...tareas, nuevaTarea];
    }
    saveTareas(nuevasTareas);
    setModalVisible(false);
    setTareaActual({});
  };

  const handleDelete = (id: string) => {
    const doDelete = () => {
      const nuevasTareas = tareas.filter(t => t.id !== id);
      saveTareas(nuevasTareas);
      setDetalleModalVisible(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
        doDelete();
      }
    } else {
      Alert.alert('Eliminar Tarea', '¿Estás seguro de eliminar esta tarea?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete }
      ]);
    }
  };

  const handleStatusChange = (id: string, nuevoEstado: EstadoTarea) => {
    const nuevasTareas = tareas.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t);
    saveTareas(nuevasTareas);
    if (tareaDetalle && tareaDetalle.id === id) {
      setTareaDetalle({ ...tareaDetalle, estado: nuevoEstado });
    }
  };

  const materiasUnicas = ['todas', ...Array.from(new Set([...materiasGlobales, ...tareas.map(t => t.materia)]))];

  const tareasFiltradas = tareas.filter(t => {
    const pasaEstado = filtroEstado === 'todos' || t.estado === filtroEstado;
    const pasaMateria = filtroMateria === 'todas' || t.materia === filtroMateria;
    return pasaEstado && pasaMateria;
  });

  const getStatusColor = (estado: string) => {
    if (estado === 'entregada') return '#2ecc71';
    if (estado === 'en revisión') return '#f39c12';
    return '#e74c3c'; // pendiente
  };
  
  const getStatusIcon = (estado: string) => {
    if (estado === 'entregada') return 'check-circle';
    if (estado === 'en revisión') return 'clock-o';
    return 'exclamation-circle';
  };

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['todos', 'pendiente', 'en revisión', 'entregada'].map(estado => (
            <Pressable 
              key={`est-${estado}`}
              style={[
                styles.filterChip, 
                { backgroundColor: isDark ? '#333' : '#ddd' },
                filtroEstado === estado && { backgroundColor: '#3498db' }
              ]}
              onPress={() => setFiltroEstado(estado as any)}
            >
              <Text style={[
                styles.filterText,
                { color: isDark ? '#ccc' : '#444' },
                filtroEstado === estado && { color: '#fff' }
              ]}>{estado.toUpperCase()}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {materiasUnicas.map(materia => (
            <Pressable 
              key={`mat-${materia}`}
              style={[
                styles.filterChip, 
                { backgroundColor: isDark ? '#333' : '#ddd' },
                filtroMateria === materia && { backgroundColor: '#9b59b6' }
              ]}
              onPress={() => setFiltroMateria(materia)}
            >
              <Text style={[
                styles.filterText,
                { color: isDark ? '#ccc' : '#444' },
                filtroMateria === materia && { color: '#fff' }
              ]}>{materia.toUpperCase()}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.listArea}>
        <View style={styles.listContainer}>
          {tareasFiltradas.length === 0 ? (
            <Text style={[styles.emptyText, { color: isDark ? '#888' : '#aaa' }]}>No hay tareas que coincidan con los filtros.</Text>
          ) : (
            tareasFiltradas.map((item) => {
              const statusColor = getStatusColor(item.estado);
              const statusIcon = getStatusIcon(item.estado);

              return (
                <Pressable 
                  key={item.id} 
                  style={({ pressed }) => [
                    styles.card,
                    isDark ? styles.cardDark : styles.cardLight,
                    pressed && styles.cardPressed
                  ]}
                  onPress={() => { setTareaDetalle(item); setDetalleModalVisible(true); }}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                      <Text style={[styles.materiaText, { color: isDark ? '#aaa' : '#666' }]}>{item.materia}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <FontAwesome name={statusIcon as any} size={14} color={statusColor} style={styles.statusIcon} />
                      <Text style={[styles.statusText, { color: statusColor }]}>
                        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.titleText, { color: isDark ? '#f0f0f0' : '#222' }]}>{item.titulo}</Text>

                  <View style={styles.footer}>
                    <FontAwesome name="calendar" size={14} color={isDark ? '#aaa' : '#888'} style={styles.calendarIcon} />
                    <Text style={[styles.dateText, { color: isDark ? '#aaa' : '#666' }]}>Entrega: {item.fecha}</Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable 
        style={styles.fab} 
        onPress={() => {
          setTareaActual({ estado: 'pendiente' });
          setModalVisible(true);
        }}
      >
        <FontAwesome name="plus" size={20} color="#fff" />
      </Pressable>

      {/* Modal Crear/Editar Tarea */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
              {tareaActual.id ? 'Editar Tarea' : 'Nueva Tarea'}
            </Text>
            
            <ScrollView style={{ width: '100%' }}>
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
                placeholder="Título"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={tareaActual.titulo}
                onChangeText={(t) => setTareaActual({...tareaActual, titulo: t})}
              />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
                placeholder="Materia"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={tareaActual.materia}
                onChangeText={(t) => setTareaActual({...tareaActual, materia: t})}
              />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
                placeholder="Fecha Límite (ej. Hoy, 18:00)"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={tareaActual.fecha}
                onChangeText={(t) => setTareaActual({...tareaActual, fecha: t})}
              />
              <TextInput
                style={[styles.input, styles.textArea, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
                placeholder="Descripción"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={tareaActual.descripcion}
                onChangeText={(t) => setTareaActual({...tareaActual, descripcion: t})}
                multiline
                numberOfLines={3}
              />
              
              <Text style={[{ marginTop: 10, marginBottom: 5 }, { color: isDark ? '#ccc' : '#444' }]}>Estado:</Text>
              <View style={styles.statusButtonsRow}>
                {['pendiente', 'en revisión', 'entregada'].map((est) => (
                  <Pressable
                    key={est}
                    style={[
                      styles.statusBtn,
                      tareaActual.estado === est && { backgroundColor: '#3498db', borderColor: '#3498db' }
                    ]}
                    onPress={() => setTareaActual({...tareaActual, estado: est as EstadoTarea})}
                  >
                    <Text style={[styles.statusBtnText, tareaActual.estado === est && { color: '#fff' }]}>
                      {est}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSaveTarea}>
                <Text style={styles.btnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Detalle Tarea */}
      <Modal visible={detalleModalVisible} animationType="fade" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            {tareaDetalle && (
              <>
                <View style={styles.detailHeader}>
                  <Text style={[styles.detailTitle, { color: isDark ? '#fff' : '#000' }]}>{tareaDetalle.titulo}</Text>
                  <Pressable onPress={() => setDetalleModalVisible(false)}>
                    <FontAwesome name="times" size={24} color={isDark ? '#aaa' : '#555'} />
                  </Pressable>
                </View>
                
                <ScrollView style={{ width: '100%', marginVertical: 10 }}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#666' }]}>Materia:</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000' }]}>{tareaDetalle.materia}</Text>
                  
                  <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#666' }]}>Fecha Límite:</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000' }]}>{tareaDetalle.fecha}</Text>
                  
                  <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#666' }]}>Estado Actual:</Text>
                  <View style={styles.statusButtonsRow}>
                    {['pendiente', 'en revisión', 'entregada'].map((est) => (
                      <Pressable
                        key={`det-est-${est}`}
                        style={[
                          styles.statusBtn,
                          tareaDetalle.estado === est && { backgroundColor: getStatusColor(est), borderColor: getStatusColor(est) }
                        ]}
                        onPress={() => handleStatusChange(tareaDetalle.id, est as EstadoTarea)}
                      >
                        <Text style={[styles.statusBtnText, tareaDetalle.estado === est && { color: '#fff' }]}>
                          {est}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#666' }]}>Descripción:</Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000', fontStyle: tareaDetalle.descripcion ? 'normal' : 'italic' }]}>
                    {tareaDetalle.descripcion || 'Sin descripción'}
                  </Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  <Pressable 
                    style={[styles.btn, styles.btnDelete]} 
                    onPress={() => handleDelete(tareaDetalle.id)}
                  >
                    <FontAwesome name="trash" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.btnText}>Eliminar</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.btn, styles.btnEdit]} 
                    onPress={() => {
                      setTareaActual(tareaDetalle);
                      setDetalleModalVisible(false);
                      setModalVisible(true);
                    }}
                  >
                    <FontAwesome name="pencil" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.btnText}>Editar</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  filtersContainer: {
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
  filterScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  listArea: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: 'transparent',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
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
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#3498db',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  statusButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  statusBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusBtnText: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: '#95a5a6',
  },
  btnSave: {
    backgroundColor: '#2ecc71',
  },
  btnDelete: {
    backgroundColor: '#e74c3c',
  },
  btnEdit: {
    backgroundColor: '#3498db',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 8,
  },
});
