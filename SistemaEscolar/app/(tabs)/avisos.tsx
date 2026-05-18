import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme, Modal, TextInput, Alert, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CategoriaAviso = 'general' | 'urgente' | 'informativo';

export interface Aviso {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
  categoria: CategoriaAviso;
  timestamp: number;
}

const STORAGE_KEY = '@avisos_data';

const DEFAULT_AVISOS: Aviso[] = [
  { id: '1', titulo: 'Reunión de Padres de Familia', fecha: 'Hoy, 10:00 AM', contenido: 'Se les recuerda la reunión bimestral obligatoria en el auditorio principal.', categoria: 'urgente', timestamp: Date.now() },
  { id: '2', titulo: 'Nuevo Menú en Cafetería', fecha: 'Ayer', contenido: 'Hemos actualizado las opciones de comida saludable para los alumnos.', categoria: 'informativo', timestamp: Date.now() - 86400000 },
];

export default function AvisosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleModalVisible, setDetalleModalVisible] = useState(false);
  const [avisoActual, setAvisoActual] = useState<Partial<Aviso>>({ categoria: 'general' });
  const [avisoDetalle, setAvisoDetalle] = useState<Aviso | null>(null);

  useEffect(() => {
    loadAvisos();
  }, []);

  const loadAvisos = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAvisos(JSON.parse(stored));
      } else {
        setAvisos(DEFAULT_AVISOS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AVISOS));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveAvisos = async (newAvisos: Aviso[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAvisos));
      setAvisos(newAvisos);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    if (!avisoActual.titulo || !avisoActual.contenido) {
      Alert.alert('Error', 'El título y contenido son obligatorios.');
      return;
    }

    let updatedAvisos;
    if (avisoActual.id) {
      updatedAvisos = avisos.map(a => a.id === avisoActual.id ? { ...a, ...avisoActual } as Aviso : a);
    } else {
      const newAviso: Aviso = {
        id: Date.now().toString(),
        titulo: avisoActual.titulo,
        contenido: avisoActual.contenido,
        fecha: avisoActual.fecha || new Date().toLocaleDateString(),
        categoria: avisoActual.categoria || 'general',
        timestamp: Date.now(),
      };
      updatedAvisos = [...avisos, newAviso];
    }
    
    saveAvisos(updatedAvisos);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar Aviso', '¿Seguro que deseas eliminar este aviso?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        const updated = avisos.filter(a => a.id !== id);
        saveAvisos(updated);
        setDetalleModalVisible(false);
      }}
    ]);
  };

  const getTipoEstilo = (tipo: string) => {
    switch (tipo) {
      case 'urgente': return { color: '#e74c3c', icon: 'exclamation-triangle' };
      case 'informativo': return { color: '#3498db', icon: 'info-circle' };
      default: return { color: '#2ecc71', icon: 'bullhorn' }; // general
    }
  };

  const avisosOrdenados = [...avisos].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      <ScrollView style={styles.container}>
        <View style={styles.listContainer}>
          {avisosOrdenados.length === 0 ? (
            <Text style={{ textAlign: 'center', color: isDark ? '#888' : '#aaa', marginTop: 40 }}>No hay avisos publicados.</Text>
          ) : (
            avisosOrdenados.map((item) => {
              const estilo = getTipoEstilo(item.categoria);

              return (
                <Pressable 
                  key={item.id} 
                  onPress={() => { setAvisoDetalle(item); setDetalleModalVisible(true); }}
                  style={({ pressed }) => [
                    styles.card,
                    isDark ? styles.cardDark : styles.cardLight,
                    { borderLeftColor: estilo.color },
                    pressed && styles.cardPressed
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                      <FontAwesome name={estilo.icon as any} size={16} color={estilo.color} style={styles.headerIcon} />
                      <Text style={[styles.titleText, { color: isDark ? '#f0f0f0' : '#222' }]} numberOfLines={1}>{item.titulo}</Text>
                    </View>
                    <Text style={[styles.dateText, { color: isDark ? '#aaa' : '#666' }]}>{item.fecha}</Text>
                  </View>

                  <Text style={[styles.contentText, { color: isDark ? '#ddd' : '#666' }]} numberOfLines={2}>{item.contenido}</Text>

                  <View style={styles.footer}>
                    <Text style={styles.readMoreText}>Leer aviso completo</Text>
                    <FontAwesome name="arrow-right" size={12} color="#3498db" />
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable style={styles.fab} onPress={() => { setAvisoActual({ categoria: 'general' }); setModalVisible(true); }}>
        <FontAwesome name="plus" size={20} color="#fff" />
      </Pressable>

      {/* Create/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <RNView style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
              {avisoActual.id ? 'Editar Aviso' : 'Nuevo Aviso'}
            </Text>
            
            <ScrollView style={{ width: '100%' }}>
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
                placeholder="Título"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={avisoActual.titulo}
                onChangeText={(t) => setAvisoActual({...avisoActual, titulo: t})}
              />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
                placeholder="Fecha (ej. Hoy, 10:00 AM)"
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={avisoActual.fecha}
                onChangeText={(t) => setAvisoActual({...avisoActual, fecha: t})}
              />
              <TextInput
                style={[styles.input, styles.textArea, { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#444' : '#ccc' }]}
                placeholder="Contenido del aviso..."
                placeholderTextColor={isDark ? '#888' : '#aaa'}
                value={avisoActual.contenido}
                onChangeText={(t) => setAvisoActual({...avisoActual, contenido: t})}
                multiline
              />

              <Text style={[{ marginTop: 10, marginBottom: 5, color: isDark ? '#ccc' : '#444' }]}>Categoría:</Text>
              <View style={styles.statusButtonsRow}>
                {['general', 'informativo', 'urgente'].map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.statusBtn,
                      avisoActual.categoria === cat && { backgroundColor: getTipoEstilo(cat).color, borderColor: getTipoEstilo(cat).color }
                    ]}
                    onPress={() => setAvisoActual({...avisoActual, categoria: cat as CategoriaAviso})}
                  >
                    <Text style={[styles.statusBtnText, avisoActual.categoria === cat && { color: '#fff' }]}>
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                <Text style={styles.btnText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </RNView>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={detalleModalVisible} animationType="fade" transparent={true}>
        <RNView style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            {avisoDetalle && (
              <>
                <View style={styles.detailHeader}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <FontAwesome name={getTipoEstilo(avisoDetalle.categoria).icon as any} size={20} color={getTipoEstilo(avisoDetalle.categoria).color} style={{ marginRight: 8, marginTop: 4 }} />
                    <Text style={[styles.detailTitle, { color: isDark ? '#fff' : '#000' }]} numberOfLines={3}>{avisoDetalle.titulo}</Text>
                  </View>
                  <Pressable onPress={() => setDetalleModalVisible(false)} style={{ padding: 4 }}>
                    <FontAwesome name="times" size={24} color={isDark ? '#aaa' : '#555'} />
                  </Pressable>
                </View>

                <ScrollView style={{ width: '100%', marginVertical: 10 }}>
                  <Text style={[styles.detailDate, { color: isDark ? '#aaa' : '#888' }]}>{avisoDetalle.fecha}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={[styles.badge, { backgroundColor: getTipoEstilo(avisoDetalle.categoria).color }]}>
                      <Text style={styles.badgeText}>{avisoDetalle.categoria.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.detailContent, { color: isDark ? '#ddd' : '#444' }]}>{avisoDetalle.contenido}</Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  <Pressable style={[styles.btn, styles.btnDelete]} onPress={() => handleDelete(avisoDetalle.id)}>
                    <FontAwesome name="trash" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.btnText}>Eliminar</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.btnEdit]} onPress={() => {
                    setAvisoActual(avisoDetalle);
                    setDetalleModalVisible(false);
                    setModalVisible(true);
                  }}>
                    <FontAwesome name="pencil" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.btnText}>Editar</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </RNView>
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
    height: 100,
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
  detailDate: {
    fontSize: 14,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
  },
});
