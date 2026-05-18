import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, useColorScheme, Image, Modal, TextInput, TouchableOpacity, Alert, View, Platform } from 'react-native';
import { Text } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface Calificacion {
  id: string;
  materia: string;
  nota: number;
  descripcion?: string;
  fecha: string;
}

export interface Alumno {
  id: string;
  nombre: string;
  grupo: string;
  contacto: string;
  avatar: string;
  promedio: number;
  tareasEntregadas: number;
  tareasTotales: number;
  calificaciones?: Calificacion[];
}

const STORAGE_KEY = '@alumnos_data';

export default function AlumnosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [asistenciaGlobal, setAsistenciaGlobal] = useState<any[]>([]);
  
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [contacto, setContacto] = useState('');

  // Grade Form states
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Calificacion | null>(null);
  const [materia, setMateria] = useState('');
  const [nota, setNota] = useState('');
  const [descripcionGrade, setDescripcionGrade] = useState('');

  // Load data
  useEffect(() => {
    loadAlumnos();
  }, []);

  const loadAlumnos = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setAlumnos(JSON.parse(data));
      }

      const matData = await AsyncStorage.getItem('@materias_data');
      if (matData) {
        setMaterias(JSON.parse(matData));
      }

      const asData = await AsyncStorage.getItem('@asistencia_data');
      if (asData) {
        setAsistenciaGlobal(JSON.parse(asData));
      }
    } catch (e) {
      console.error('Error loading data', e);
    }
  };

  const saveAlumnos = async (newAlumnos: Alumno[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAlumnos));
      setAlumnos(newAlumnos);
    } catch (e) {
      console.error('Error saving alumnos', e);
    }
  };

  const generateAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`;
  };

  const getPromedioColor = (promedio: number) => {
    if (promedio === 0) return '#888'; // Sin calificaciones
    if (promedio >= 9.0) return '#2ecc71';
    if (promedio >= 8.0) return '#f39c12';
    return '#e74c3c';
  };

  const calculatePromedio = (calificaciones?: Calificacion[]) => {
    if (!calificaciones || calificaciones.length === 0) return 0;
    const sum = calificaciones.reduce((acc, c) => acc + c.nota, 0);
    return sum / calificaciones.length;
  };

  const openAddForm = () => {
    setSelectedAlumno(null);
    setNombre('');
    setGrupo('');
    setContacto('');
    setFormVisible(true);
  };

  const openEditForm = (alumno: Alumno) => {
    setSelectedAlumno(alumno);
    setNombre(alumno.nombre);
    setGrupo(alumno.grupo);
    setContacto(alumno.contacto || '');
    setDetailVisible(false);
    setFormVisible(true);
  };

  const handleSave = () => {
    if (!nombre.trim() || !grupo.trim()) {
      Alert.alert('Error', 'El nombre y el grupo son obligatorios.');
      return;
    }

    const newAlumno: Alumno = {
      id: selectedAlumno ? selectedAlumno.id : Date.now().toString(),
      nombre: nombre.trim(),
      grupo: grupo.trim(),
      contacto: contacto.trim(),
      avatar: selectedAlumno ? selectedAlumno.avatar : generateAvatar(nombre.trim()),
      promedio: selectedAlumno ? selectedAlumno.promedio : 0, // 0 means no grades yet
      tareasEntregadas: selectedAlumno ? selectedAlumno.tareasEntregadas : 0,
      tareasTotales: selectedAlumno ? selectedAlumno.tareasTotales : 0,
      calificaciones: selectedAlumno ? selectedAlumno.calificaciones : [],
    };

    let updatedAlumnos;
    if (selectedAlumno) {
      updatedAlumnos = alumnos.map(a => a.id === selectedAlumno.id ? newAlumno : a);
    } else {
      updatedAlumnos = [...alumnos, newAlumno];
    }

    saveAlumnos(updatedAlumnos);
    setFormVisible(false);
  };

  const handleDelete = (id: string) => {
    const doDelete = () => {
      const updatedAlumnos = alumnos.filter(a => a.id !== id);
      saveAlumnos(updatedAlumnos);
      setDetailVisible(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro que deseas eliminar este alumno?')) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Eliminar Alumno',
        '¿Estás seguro que deseas eliminar este alumno?',
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

  const openDetail = (alumno: Alumno) => {
    setSelectedAlumno(alumno);
    setDetailVisible(true);
  };

  const openAddGrade = () => {
    setSelectedGrade(null);
    setMateria('');
    setNota('');
    setDescripcionGrade('');
    setGradeModalVisible(true);
  };

  const openEditGrade = (grade: Calificacion) => {
    setSelectedGrade(grade);
    setMateria(grade.materia);
    setNota(grade.nota.toString());
    setDescripcionGrade(grade.descripcion || '');
    setGradeModalVisible(true);
  };

  const handleSaveGrade = () => {
    if (!materia.trim() || !nota.trim()) {
      Alert.alert('Error', 'La materia y la nota son obligatorias.');
      return;
    }
    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      Alert.alert('Error', 'La nota debe ser un número entre 0 y 10.');
      return;
    }

    if (!selectedAlumno) return;

    const newGrade: Calificacion = {
      id: selectedGrade ? selectedGrade.id : Date.now().toString(),
      materia: materia.trim(),
      nota: notaNum,
      descripcion: descripcionGrade.trim(),
      fecha: selectedGrade ? selectedGrade.fecha : new Date().toLocaleDateString(),
    };

    const currentGrades = selectedAlumno.calificaciones || [];
    let updatedGrades;
    if (selectedGrade) {
      updatedGrades = currentGrades.map(g => g.id === selectedGrade.id ? newGrade : g);
    } else {
      updatedGrades = [...currentGrades, newGrade];
    }

    const newPromedio = calculatePromedio(updatedGrades);
    const updatedAlumno = { ...selectedAlumno, calificaciones: updatedGrades, promedio: newPromedio };
    
    setSelectedAlumno(updatedAlumno);
    const updatedAlumnos = alumnos.map(a => a.id === selectedAlumno.id ? updatedAlumno : a);
    saveAlumnos(updatedAlumnos);
    setGradeModalVisible(false);
  };

  const handleDeleteGrade = (id: string) => {
    const doDelete = () => {
      if (!selectedAlumno) return;
      const updatedGrades = (selectedAlumno.calificaciones || []).filter(g => g.id !== id);
      const newPromedio = calculatePromedio(updatedGrades);
      const updatedAlumno = { ...selectedAlumno, calificaciones: updatedGrades, promedio: newPromedio };
      setSelectedAlumno(updatedAlumno);
      const updatedAlumnos = alumnos.map(a => a.id === selectedAlumno.id ? updatedAlumno : a);
      saveAlumnos(updatedAlumnos);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Estás seguro de eliminar esta calificación?')) {
        doDelete();
      }
    } else {
      Alert.alert('Eliminar', '¿Estás seguro de eliminar esta calificación?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete }
      ]);
    }
  };

  // Theming colors
  const bgColor = isDark ? '#121212' : '#f8f9fa';
  const cardBg = isDark ? '#1e1e1e' : '#fff';
  const textColor = isDark ? '#f0f0f0' : '#222';
  const subTextColor = isDark ? '#aaaaaa' : '#555555';
  const inputBg = isDark ? '#2c2c2c' : '#f8f8f8';
  const inputBorderColor = isDark ? '#444' : '#ddd';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView style={styles.container}>
        <View style={styles.listContainer}>
          {alumnos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="users" size={48} color={subTextColor} style={{ marginBottom: 16 }} />
              <Text style={[styles.emptyText, { color: subTextColor }]}>No hay alumnos registrados.</Text>
            </View>
          ) : (
            alumnos.map((item) => (
              <Pressable key={item.id} onPress={() => openDetail(item)} style={({ pressed }) => [
                styles.card,
                { backgroundColor: cardBg },
                pressed && styles.cardPressed
              ]}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                
                <View style={[styles.cardContent, { backgroundColor: cardBg }]}>
                  <Text style={[styles.studentName, { color: textColor }]}>{item.nombre}</Text>
                  <Text style={[styles.groupText, { color: subTextColor }]}>Grupo: {item.grupo}</Text>
                </View>

                <View style={[styles.promedioContainer, { backgroundColor: cardBg }]}>
                  <Text style={[styles.promedioLabel, { color: subTextColor }]}>Promedio</Text>
                  <Text style={[styles.promedioValue, { color: getPromedioColor(item.promedio) }]}>
                    {item.promedio === 0 ? '--' : item.promedio.toFixed(1)}
                  </Text>
                </View>
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
              {selectedAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
            </Text>
            <TouchableOpacity onPress={() => setFormVisible(false)} style={styles.closeBtn}>
              <FontAwesome name="times" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.label, { color: textColor }]}>Nombre Completo *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorderColor }]}
              placeholder="Ej. Juan Pérez López"
              placeholderTextColor={subTextColor}
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={[styles.label, { color: textColor }]}>Grupo / Grado *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorderColor }]}
              placeholder="Ej. 3° A"
              placeholderTextColor={subTextColor}
              value={grupo}
              onChangeText={setGrupo}
            />

            <Text style={[styles.label, { color: textColor }]}>Correo o Contacto</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor: inputBorderColor }]}
              placeholder="Ej. juan.perez@correo.com"
              placeholderTextColor={subTextColor}
              value={contacto}
              onChangeText={setContacto}
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Guardar</Text>
            </TouchableOpacity>
            <View style={{ height: 40, backgroundColor: bgColor }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={detailVisible} animationType="fade" transparent={true} onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.detailModalOverlay}>
          <View style={[styles.detailModalContent, { backgroundColor: cardBg }]}>
            {selectedAlumno && (
              <>
                <View style={[styles.detailHeader, { backgroundColor: cardBg }]}>
                  <TouchableOpacity onPress={() => setDetailVisible(false)} style={[styles.closeDetailBtn, { backgroundColor: isDark ? '#333' : '#eee' }]}>
                    <FontAwesome name="times" size={20} color={textColor} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.profileHeader, { backgroundColor: cardBg }]}>
                  <Image source={{ uri: selectedAlumno.avatar }} style={styles.profileAvatar} />
                  <Text style={[styles.profileName, { color: textColor }]}>{selectedAlumno.nombre}</Text>
                  <Text style={[styles.profileGroup, { color: subTextColor }]}>Grupo {selectedAlumno.grupo}</Text>
                </View>

                <ScrollView style={[styles.detailBody, { backgroundColor: cardBg }]}>
                  
                  <View style={[styles.infoCard, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Información de Contacto</Text>
                    <View style={styles.infoRow}>
                      <FontAwesome name="envelope" size={16} color={subTextColor} style={{ width: 24 }} />
                      <Text style={[styles.infoText, { color: textColor }]}>{selectedAlumno.contacto || 'Sin contacto registrado'}</Text>
                    </View>
                  </View>

                  <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24, marginLeft: 4 }]}>Resumen Académico</Text>
                  
                  <View style={styles.statsContainer}>
                    <View style={[styles.statBox, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
                      <Text style={[styles.statLabel, { color: subTextColor }]}>Promedio General</Text>
                      <Text style={[styles.statValue, { color: getPromedioColor(selectedAlumno.promedio) }]}>
                        {selectedAlumno.promedio === 0 ? '--' : selectedAlumno.promedio.toFixed(1)}
                      </Text>
                    </View>

                    {(() => {
                      let totalClases = 0;
                      let totalAsistencias = 0;

                      asistenciaGlobal.forEach(dia => {
                        const reg = dia.registros.find((r: any) => r.alumnoId === selectedAlumno.id);
                        if (reg) {
                          totalClases++;
                          if (reg.estado === 'presente' || reg.estado === 'tardanza') {
                            totalAsistencias++;
                          }
                        }
                      });

                      const porcentaje = totalClases === 0 ? 0 : (totalAsistencias / totalClases) * 100;
                      const porcentajeColor = porcentaje >= 80 ? '#2ecc71' : porcentaje >= 60 ? '#f39c12' : '#e74c3c';

                      return (
                        <View style={[styles.statBox, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
                          <Text style={[styles.statLabel, { color: subTextColor }]}>Asistencia</Text>
                          <Text style={[styles.statValue, { color: totalClases === 0 ? subTextColor : porcentajeColor }]}>
                            {totalClases === 0 ? '--' : `${Math.round(porcentaje)}%`}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>

                  {/* Asistencia por materia */}
                  {asistenciaGlobal.length > 0 && (() => {
                    const asisPorMateria: Record<string, { total: number, asistidos: number }> = {};
                    
                    asistenciaGlobal.forEach(dia => {
                      const reg = dia.registros.find((r: any) => r.alumnoId === selectedAlumno.id);
                      if (reg) {
                        const materiaObj = materias.find(m => m.id === dia.materiaId);
                        const matNombre = materiaObj ? materiaObj.nombre : 'Materia Desconocida';
                        if (!asisPorMateria[matNombre]) asisPorMateria[matNombre] = { total: 0, asistidos: 0 };
                        
                        asisPorMateria[matNombre].total++;
                        if (reg.estado === 'presente' || reg.estado === 'tardanza') {
                          asisPorMateria[matNombre].asistidos++;
                        }
                      }
                    });

                    const keys = Object.keys(asisPorMateria);
                    if (keys.length === 0) return null;

                    return (
                      <>
                        <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24, marginLeft: 4, marginBottom: 8 }]}>Asistencia por Materia</Text>
                        <View style={[styles.infoCard, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', marginTop: 0 }]}>
                          {keys.map(mat => {
                            const stats = asisPorMateria[mat];
                            const pct = (stats.asistidos / stats.total) * 100;
                            const color = pct >= 80 ? '#2ecc71' : pct >= 60 ? '#f39c12' : '#e74c3c';
                            
                            return (
                              <View key={`asis-${mat}`} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: isDark ? '#444' : '#eee' }}>
                                <Text style={{ color: textColor, flex: 1 }}>{mat}</Text>
                                <Text style={{ color: color, fontWeight: 'bold' }}>{Math.round(pct)}%</Text>
                              </View>
                            );
                          })}
                        </View>
                      </>
                    );
                  })()}

                  <View style={styles.gradesHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: textColor, marginTop: 24, marginLeft: 4, marginBottom: 0 }]}>Calificaciones</Text>
                    <TouchableOpacity style={styles.addGradeBtn} onPress={openAddGrade}>
                      <FontAwesome name="plus" size={14} color="#fff" />
                      <Text style={styles.addGradeBtnText}>Añadir</Text>
                    </TouchableOpacity>
                  </View>

                  {(!selectedAlumno.calificaciones || selectedAlumno.calificaciones.length === 0) ? (
                    <Text style={[styles.emptyGradesText, { color: subTextColor }]}>No hay calificaciones registradas.</Text>
                  ) : (
                    Array.from(new Set(selectedAlumno.calificaciones.map(c => c.materia))).map(materia => {
                      const notasMateria = (selectedAlumno.calificaciones || []).filter(c => c.materia === materia);
                      const promMateria = notasMateria.reduce((acc, c) => acc + c.nota, 0) / notasMateria.length;
                      return (
                        <View key={materia} style={[styles.materiaCard, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}>
                          <View style={styles.materiaHeader}>
                            <Text style={[styles.materiaTitle, { color: textColor }]}>{materia}</Text>
                            <View style={[styles.promedioBadge, { backgroundColor: getPromedioColor(promMateria) }]}>
                              <Text style={styles.promedioBadgeText}>{promMateria.toFixed(1)}</Text>
                            </View>
                          </View>
                          {notasMateria.map(nota => (
                            <View key={nota.id} style={[styles.notaRow, { borderTopColor: isDark ? '#444' : '#ddd' }]}>
                              <View style={styles.notaInfo}>
                                <Text style={[styles.notaText, { color: textColor }]}>
                                  <Text style={{ fontWeight: 'bold' }}>{nota.nota.toFixed(1)}</Text>
                                  {nota.descripcion ? ` - ${nota.descripcion}` : ''}
                                </Text>
                                <Text style={[styles.notaFecha, { color: subTextColor }]}>{nota.fecha}</Text>
                              </View>
                              <View style={styles.notaActions}>
                                <TouchableOpacity onPress={() => openEditGrade(nota)} style={{ padding: 8 }}>
                                  <FontAwesome name="pencil" size={16} color="#3498db" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteGrade(nota.id)} style={{ padding: 8 }}>
                                  <FontAwesome name="trash" size={16} color="#e74c3c" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    })
                  )}

                  <View style={{ height: 40, backgroundColor: cardBg }} />
                </ScrollView>

                <View style={[styles.detailActions, { backgroundColor: cardBg }]}>
                  <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => openEditForm(selectedAlumno)}>
                    <FontAwesome name="pencil" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnText}>Editar Perfil</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(selectedAlumno.id)}>
                    <FontAwesome name="trash" size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Grade Modal (Add / Edit) */}
      <Modal visible={gradeModalVisible} animationType="fade" transparent={true} onRequestClose={() => setGradeModalVisible(false)}>
        <View style={styles.detailModalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={[styles.modalHeader, { backgroundColor: cardBg, padding: 0, paddingBottom: 15, paddingTop: 10, borderBottomWidth: 0 }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {selectedGrade ? 'Editar Calificación' : 'Nueva Calificación'}
              </Text>
              <TouchableOpacity onPress={() => setGradeModalVisible(false)} style={styles.closeBtn}>
                <FontAwesome name="times" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ width: '100%', maxHeight: 400 }}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: subTextColor }]}>Materia *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: isDark ? '#444' : '#ddd' }]}>
                  <FontAwesome name="book" size={16} color={subTextColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.styledInput, { color: textColor }]}
                    placeholder="Ej. Matemáticas"
                    placeholderTextColor={subTextColor}
                    value={materia}
                    onChangeText={setMateria}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: subTextColor }]}>Calificación (0 - 10) *</Text>
                <View style={[styles.gradeInputWrapper, { backgroundColor: isDark ? '#222' : '#f8f9fa', borderColor: isDark ? '#555' : '#ccc' }]}>
                  <TextInput
                    style={[styles.gradeInputText, { color: textColor }]}
                    placeholder="0.0"
                    placeholderTextColor={subTextColor}
                    value={nota}
                    onChangeText={setNota}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: subTextColor }]}>Descripción (Opcional)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: isDark ? '#444' : '#ddd' }]}>
                  <FontAwesome name="pencil" size={16} color={subTextColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.styledInput, { color: textColor }]}
                    placeholder="Ej. Examen parcial"
                    placeholderTextColor={subTextColor}
                    value={descripcionGrade}
                    onChangeText={setDescripcionGrade}
                  />
                </View>
              </View>

              <TouchableOpacity style={[styles.primaryButton, { marginTop: 24, marginBottom: 10 }]} onPress={handleSaveGrade}>
                <Text style={styles.primaryButtonText}>Guardar</Text>
              </TouchableOpacity>
            </ScrollView>
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
  listContainer: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 80,
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
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupText: {
    fontSize: 14,
  },
  promedioContainer: {
    alignItems: 'flex-end',
  },
  promedioLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  promedioValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderColor: '#ddd',
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
    justifyContent: 'center',
    padding: 20,
  },
  detailModalContent: {
    borderRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  detailHeader: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeDetailBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  profileGroup: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailBody: {
    paddingHorizontal: 24,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
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
    fontSize: 14,
    fontWeight: '600',
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  gradesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addGradeBtn: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addGradeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyGradesText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  materiaCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  materiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materiaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  promedioBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  promedioBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  notaInfo: {
    flex: 1,
  },
  notaText: {
    fontSize: 14,
  },
  notaFecha: {
    fontSize: 12,
    marginTop: 2,
  },
  notaActions: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  styledInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  gradeInputWrapper: {
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeInputText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
});
