import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme, Modal, TextInput, TouchableOpacity, Alert, View, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface Materia {
  id: string;
  nombre: string;
  profesor: string;
  horario: string;
  descripcion: string;
  color: string;
}

export type EstadoAsistencia = 'presente' | 'ausente' | 'tardanza';

export interface RegistroAsistencia {
  alumnoId: string;
  alumnoNombre: string;
  estado: EstadoAsistencia;
}

export interface AsistenciaDia {
  id: string;
  materiaId: string;
  fecha: string;
  registros: RegistroAsistencia[];
}

const STORAGE_KEY = '@materias_data';
const ASISTENCIA_KEY = '@asistencia_data';
const ALUMNOS_KEY = '@alumnos_data';
const COLORS = ['#3498db', '#9b59b6', '#2ecc71', '#e67e22', '#e74c3c', '#1abc9c', '#f1c40f'];

export default function MateriasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [historialAsistencia, setHistorialAsistencia] = useState<AsistenciaDia[]>([]);
  
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);

  // Attendance states
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState<AsistenciaDia | null>(null);
  const [fechaAsistencia, setFechaAsistencia] = useState('');
  const [registrosActuales, setRegistrosActuales] = useState<RegistroAsistencia[]>([]);

  // Form states
  const [nombre, setNombre] = useState('');
  const [profesor, setProfesor] = useState('');
  const [horario, setHorario] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Load data
  useEffect(() => {
    loadMaterias();
  }, []);

  const loadMaterias = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setMaterias(JSON.parse(data));
      }
      
      const alData = await AsyncStorage.getItem(ALUMNOS_KEY);
      if (alData) {
        setAlumnos(JSON.parse(alData));
      }

      const asData = await AsyncStorage.getItem(ASISTENCIA_KEY);
      if (asData) {
        setHistorialAsistencia(JSON.parse(asData));
      }
    } catch (e) {
      console.error('Error loading data', e);
    }
  };

  const saveAsistencia = async (newHistorial: AsistenciaDia[]) => {
    try {
      await AsyncStorage.setItem(ASISTENCIA_KEY, JSON.stringify(newHistorial));
      setHistorialAsistencia(newHistorial);
    } catch (e) {
      console.error('Error saving asistencia', e);
    }
  };

  const saveMaterias = async (newMaterias: Materia[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMaterias));
      setMaterias(newMaterias);
    } catch (e) {
      console.error('Error saving materias', e);
    }
  };

  const openAddForm = () => {
    setSelectedMateria(null);
    setNombre('');
    setProfesor('');
    setHorario('');
    setDescripcion('');
    setFormVisible(true);
  };

  const openEditForm = (materia: Materia) => {
    setSelectedMateria(materia);
    setNombre(materia.nombre);
    setProfesor(materia.profesor);
    setHorario(materia.horario);
    setDescripcion(materia.descripcion || '');
    setDetailVisible(false); // Close detail view when opening edit
    setFormVisible(true);
  };

  const handleSave = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la materia es obligatorio.');
      return;
    }

    const newMateria: Materia = {
      id: selectedMateria ? selectedMateria.id : Date.now().toString(),
      nombre: nombre.trim(),
      profesor: profesor.trim(),
      horario: horario.trim(),
      descripcion: descripcion.trim(),
      color: selectedMateria ? selectedMateria.color : COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    let updatedMaterias;
    if (selectedMateria) {
      updatedMaterias = materias.map(m => m.id === selectedMateria.id ? newMateria : m);
    } else {
      updatedMaterias = [...materias, newMateria];
    }

    saveMaterias(updatedMaterias);
    setFormVisible(false);
  };

  const handleDelete = (id: string) => {
    const doDelete = () => {
      const updatedMaterias = materias.filter(m => m.id !== id);
      saveMaterias(updatedMaterias);
      setDetailVisible(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que deseas eliminar esta materia?')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Materia',
        '¿Estás seguro que deseas eliminar esta materia?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: doDelete
          }
        ]
      );
    }
  };

  const openDetail = (materia: Materia) => {
    setSelectedMateria(materia);
    setDetailVisible(true);
  };

  const openTakeAttendance = (asistenciaEdit?: AsistenciaDia) => {
    if (alumnos.length === 0) {
      Alert.alert('Aviso', 'No hay alumnos registrados para pasar lista.');
      return;
    }

    if (asistenciaEdit) {
      setSelectedAsistencia(asistenciaEdit);
      setFechaAsistencia(asistenciaEdit.fecha);
      setRegistrosActuales([...asistenciaEdit.registros]);
    } else {
      setSelectedAsistencia(null);
      setFechaAsistencia(new Date().toLocaleDateString());
      // Initialize all students as 'presente' by default
      const initialRegistros: RegistroAsistencia[] = alumnos.map(al => ({
        alumnoId: al.id,
        alumnoNombre: al.nombre,
        estado: 'presente'
      }));
      setRegistrosActuales(initialRegistros);
    }
    
    setAttendanceModalVisible(true);
  };

  const updateStudentStatus = (alumnoId: string, nuevoEstado: EstadoAsistencia) => {
    setRegistrosActuales(prev => prev.map(reg => 
      reg.alumnoId === alumnoId ? { ...reg, estado: nuevoEstado } : reg
    ));
  };

  const handleSaveAttendance = () => {
    if (!fechaAsistencia.trim()) {
      Alert.alert('Error', 'La fecha es obligatoria.');
      return;
    }

    const nuevaAsistencia: AsistenciaDia = {
      id: selectedAsistencia ? selectedAsistencia.id : Date.now().toString(),
      materiaId: selectedMateria!.id,
      fecha: fechaAsistencia.trim(),
      registros: registrosActuales,
    };

    let updatedHistorial;
    if (selectedAsistencia) {
      updatedHistorial = historialAsistencia.map(a => a.id === selectedAsistencia.id ? nuevaAsistencia : a);
    } else {
      updatedHistorial = [...historialAsistencia, nuevaAsistencia];
    }

    saveAsistencia(updatedHistorial);
    setAttendanceModalVisible(false);
  };

  // Theming colors
  const bgColor = isDark ? '#121212' : '#f8f9fa';
  const cardBg = isDark ? '#1e1e1e' : '#fff';
  const textColor = isDark ? '#f0f0f0' : '#222';
  const subTextColor = isDark ? '#aaaaaa' : '#555555';
  const inputBg = isDark ? '#2c2c2c' : '#f0f0f0';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView style={styles.container}>
        <View style={styles.listContainer}>
          {materias.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="book" size={48} color={subTextColor} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: subTextColor }]}>No hay materias registradas.</Text>
            </View>
          ) : (
            materias.map((item) => (
              <Pressable key={item.id} onPress={() => openDetail(item)} style={({ pressed }) => [
                styles.card,
                { backgroundColor: cardBg },
                pressed && styles.cardPressed
              ]}>
                <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                <View style={[styles.cardContent, { backgroundColor: cardBg }]}>
                  <Text style={[styles.subjectName, { color: textColor }]}>{item.nombre}</Text>
                  
                  <View style={[styles.row, { backgroundColor: cardBg }]}>
                    <FontAwesome name="user" size={14} color={subTextColor} style={styles.icon} />
                    <Text style={[styles.detailText, { color: subTextColor }]}>{item.profesor || 'Sin profesor asignado'}</Text>
                  </View>
                  
                  <View style={[styles.row, { backgroundColor: cardBg }]}>
                    <FontAwesome name="clock-o" size={14} color={subTextColor} style={styles.icon} />
                    <Text style={[styles.detailText, { color: subTextColor }]}>{item.horario || 'Sin horario establecido'}</Text>
                  </View>
                </View>
                <FontAwesome name="chevron-right" size={16} color={subTextColor} style={styles.chevron} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddForm}>
        <FontAwesome name="plus" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Form Modal (Add / Edit) */}
      <Modal visible={formVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFormVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
          <View style={[styles.modalHeader, { backgroundColor: bgColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {selectedMateria ? 'Editar Materia' : 'Nueva Materia'}
            </Text>
            <TouchableOpacity onPress={() => setFormVisible(false)} style={styles.closeBtn}>
              <FontAwesome name="times" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.label, { color: textColor }]}>Nombre de la materia *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              placeholder="Ej. Matemáticas Avanzadas"
              placeholderTextColor={subTextColor}
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={[styles.label, { color: textColor }]}>Profesor</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              placeholder="Ej. Dr. Roberto Gómez"
              placeholderTextColor={subTextColor}
              value={profesor}
              onChangeText={setProfesor}
            />

            <Text style={[styles.label, { color: textColor }]}>Horario</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              placeholder="Ej. Lun, Mie 10:00-11:30"
              placeholderTextColor={subTextColor}
              value={horario}
              onChangeText={setHorario}
            />

            <Text style={[styles.label, { color: textColor }]}>Descripción o Notas</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: textColor }]}
              placeholder="Añade detalles sobre la materia..."
              placeholderTextColor={subTextColor}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Guardar</Text>
            </TouchableOpacity>
            <View style={{ height: 40, backgroundColor: bgColor }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={detailVisible} animationType="slide" transparent={true} onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.detailModalOverlay}>
          <View style={[styles.detailModalContent, { backgroundColor: cardBg }]}>
            {selectedMateria && (
              <>
                <View style={[styles.detailHeader, { backgroundColor: selectedMateria.color }]}>
                  <Text style={styles.detailTitle}>{selectedMateria.nombre}</Text>
                  <TouchableOpacity onPress={() => setDetailVisible(false)} style={styles.closeDetailBtn}>
                    <FontAwesome name="times" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={[styles.detailBody, { backgroundColor: cardBg }]}>
                  <View style={[styles.detailRow, { backgroundColor: cardBg }]}>
                    <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                      <FontAwesome name="user" size={18} color={selectedMateria.color} />
                    </View>
                    <View style={[styles.detailTextContainer, { backgroundColor: cardBg }]}>
                      <Text style={[styles.detailLabel, { color: subTextColor }]}>Profesor</Text>
                      <Text style={[styles.detailValue, { color: textColor }]}>{selectedMateria.profesor || 'No asignado'}</Text>
                    </View>
                  </View>

                  <View style={[styles.detailRow, { backgroundColor: cardBg }]}>
                    <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
                      <FontAwesome name="clock-o" size={18} color={selectedMateria.color} />
                    </View>
                    <View style={[styles.detailTextContainer, { backgroundColor: cardBg }]}>
                      <Text style={[styles.detailLabel, { color: subTextColor }]}>Horario</Text>
                      <Text style={[styles.detailValue, { color: textColor }]}>{selectedMateria.horario || 'No asignado'}</Text>
                    </View>
                  </View>

                  {selectedMateria.descripcion ? (
                    <View style={[styles.detailDescriptionBox, { backgroundColor: isDark ? '#2c2c2c' : '#f8f9fa' }]}>
                      <Text style={[styles.detailLabel, { color: subTextColor, marginBottom: 8 }]}>Descripción</Text>
                      <Text style={[styles.detailValue, { color: textColor, lineHeight: 22 }]}>{selectedMateria.descripcion}</Text>
                    </View>
                  ) : null}

                  <View style={styles.attendanceHeader}>
                    <Text style={[styles.detailLabel, { color: textColor, fontSize: 16, marginTop: 24 }]}>Historial de Asistencia</Text>
                    <TouchableOpacity style={styles.takeAttendanceBtn} onPress={() => openTakeAttendance()}>
                      <FontAwesome name="check-square-o" size={14} color="#fff" />
                      <Text style={styles.takeAttendanceText}>Pasar Lista</Text>
                    </TouchableOpacity>
                  </View>

                  {(() => {
                    const historialMateria = historialAsistencia.filter(h => h.materiaId === selectedMateria.id).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                    
                    if (historialMateria.length === 0) {
                      return <Text style={[styles.emptyText, { color: subTextColor, marginTop: 12, textAlign: 'left' }]}>No hay registros de asistencia.</Text>;
                    }

                    return historialMateria.map(hist => {
                      const presentes = hist.registros.filter(r => r.estado === 'presente').length;
                      const tardanzas = hist.registros.filter(r => r.estado === 'tardanza').length;
                      
                      return (
                        <TouchableOpacity key={hist.id} style={[styles.attendanceCard, { backgroundColor: isDark ? '#2c2c2c' : '#f8f9fa' }]} onPress={() => openTakeAttendance(hist)}>
                          <View style={styles.attendanceCardLeft}>
                            <FontAwesome name="calendar-check-o" size={16} color={selectedMateria.color} style={{ marginRight: 8 }} />
                            <Text style={[styles.attendanceDate, { color: textColor }]}>{hist.fecha}</Text>
                          </View>
                          <View style={styles.attendanceCardRight}>
                            <Text style={[styles.attendanceStats, { color: subTextColor }]}>
                              <Text style={{ color: '#2ecc71', fontWeight: 'bold' }}>{presentes} P </Text> 
                              {tardanzas > 0 && <Text style={{ color: '#f39c12', fontWeight: 'bold' }}>{tardanzas} T</Text>}
                            </Text>
                            <FontAwesome name="pencil" size={14} color={subTextColor} style={{ marginLeft: 10 }} />
                          </View>
                        </TouchableOpacity>
                      );
                    });
                  })()}
                  
                  <View style={{ height: 30, backgroundColor: cardBg }} />
                </ScrollView>

                <View style={[styles.detailActions, { backgroundColor: cardBg }]}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEditForm(selectedMateria)}>
                    <FontAwesome name="pencil" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(selectedMateria.id)}>
                    <FontAwesome name="trash" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Attendance Modal */}
      <Modal visible={attendanceModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAttendanceModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: bgColor }]}>
          <View style={[styles.modalHeader, { backgroundColor: bgColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {selectedAsistencia ? 'Editar Lista' : 'Pasar Lista'}
            </Text>
            <TouchableOpacity onPress={() => setAttendanceModalVisible(false)} style={styles.closeBtn}>
              <FontAwesome name="times" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.label, { color: textColor }]}>Fecha de la clase *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: isDark ? '#444' : '#ddd' }]}
              placeholder="Ej. 18/05/2026"
              placeholderTextColor={subTextColor}
              value={fechaAsistencia}
              onChangeText={setFechaAsistencia}
            />

            <View style={styles.studentsListHeader}>
              <Text style={[styles.label, { color: textColor, marginBottom: 0 }]}>Alumnos</Text>
              <Text style={[{ color: subTextColor, fontSize: 12 }]}>{registrosActuales.length} en total</Text>
            </View>

            {registrosActuales.map(registro => (
              <View key={registro.alumnoId} style={[styles.studentAttendanceRow, { backgroundColor: cardBg }]}>
                <Text style={[styles.studentAttendanceName, { color: textColor }]} numberOfLines={1}>
                  {registro.alumnoNombre}
                </Text>
                <View style={styles.attendanceButtons}>
                  <TouchableOpacity 
                    style={[styles.attBtn, registro.estado === 'presente' ? styles.attBtnPresente : { backgroundColor: inputBg }]}
                    onPress={() => updateStudentStatus(registro.alumnoId, 'presente')}
                  >
                    <Text style={[styles.attBtnText, registro.estado === 'presente' ? { color: '#fff' } : { color: subTextColor }]}>P</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.attBtn, registro.estado === 'ausente' ? styles.attBtnAusente : { backgroundColor: inputBg }]}
                    onPress={() => updateStudentStatus(registro.alumnoId, 'ausente')}
                  >
                    <Text style={[styles.attBtnText, registro.estado === 'ausente' ? { color: '#fff' } : { color: subTextColor }]}>A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.attBtn, registro.estado === 'tardanza' ? styles.attBtnTardanza : { backgroundColor: inputBg }]}
                    onPress={() => updateStudentStatus(registro.alumnoId, 'tardanza')}
                  >
                    <Text style={[styles.attBtnText, registro.estado === 'tardanza' ? { color: '#fff' } : { color: subTextColor }]}>T</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={[styles.primaryButton, { marginTop: 24 }]} onPress={handleSaveAttendance}>
              <Text style={styles.primaryButtonText}>Guardar Asistencia</Text>
            </TouchableOpacity>
            <View style={{ height: 40, backgroundColor: bgColor }} />
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 80, // Space for FAB
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
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
  },
  icon: {
    width: 20,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
  },
  chevron: {
    alignSelf: 'center',
    padding: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  
  // Modal Form Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // for notch
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
    padding: 20,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    minHeight: 120,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Detail Modal Styles
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  detailHeader: {
    padding: 24,
    paddingTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailTitle: {
    color: '#fff',
    fontSize: 24,
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
  detailActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
  },
  editBtn: {
    backgroundColor: '#3498db',
    marginRight: 12,
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  takeAttendanceBtn: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  takeAttendanceText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  attendanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  attendanceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  attendanceCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceStats: {
    fontSize: 13,
  },
  studentsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 12,
  },
  studentAttendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  studentAttendanceName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  attendanceButtons: {
    flexDirection: 'row',
  },
  attBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  attBtnPresente: {
    backgroundColor: '#2ecc71',
  },
  attBtnAusente: {
    backgroundColor: '#e74c3c',
  },
  attBtnTardanza: {
    backgroundColor: '#f39c12',
  },
  attBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
