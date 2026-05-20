# 📚 Nombre del proyecto
<!-- Escribe aquí el nombre de tu aplicación -->
> _Por definir_

---

## 👥 Integrantes
<!-- Agrega el nombre completo de cada integrante del equipo -->

| Nombre | Rol |
|--------|-----|
| &nbsp; | &nbsp; |
| &nbsp; | &nbsp; |
| &nbsp; | &nbsp; |

---

## 📋 Descripción

App Sistema Escolar es una aplicación móvil diseñada para que docentes y coordinadores gestionen su entorno educativo desde un único punto de acceso. Centraliza en una sola herramienta la gestión de materias, alumnos, tareas, calificaciones, asistencia y avisos institucionales, eliminando la dependencia de múltiples formatos desconectados entre sí.

La interfaz se estructura en cinco secciones principales accesibles desde una barra de navegación inferior. Un panel de inicio agrega en tiempo real los datos más relevantes de cada módulo, y un horario semanal se construye automáticamente a partir de los datos registrados en Materias. Las calificaciones y los porcentajes de asistencia se calculan de forma automática y se reflejan en el perfil de cada alumno.

El proyecto se construye con una metodología incremental: primero se valida la interfaz completa con datos simulados, y luego cada módulo se conecta con persistencia local y lógica real en fases sucesivas.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Descripción |
|------------|-------------|
| [React Native](https://reactnative.dev/) | Framework principal para el desarrollo móvil multiplataforma |
| [Expo](https://expo.dev/) | Plataforma de desarrollo y distribución (SDK más reciente compatible con Expo Go) |
| [Expo Router](https://expo.github.io/router/) | Navegación basada en archivos dentro de la app |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | Persistencia de datos local en el dispositivo |
| [React Navigation](https://reactnavigation.org/) | Gestión de navegación entre pantallas y barra inferior |
| JavaScript / JSX | Lenguaje de desarrollo de componentes y lógica |

---

## ✨ Funcionalidades

### 🏠 Inicio
- Panel central con tarjetas resumen sincronizadas en tiempo real
- Acceso directo a cada sección con un toque
- Vista de horario semanal generada automáticamente

### 📖 Materias
- Crear, editar y eliminar materias (nombre, profesor, horario, descripción)
- Ver detalle completo de cada materia
- Pasar lista de asistencia por día con estado por alumno (presente / ausente / tardanza)
- Consultar y editar historial de asistencia

### 👨‍🎓 Alumnos
- Crear, editar y eliminar alumnos (nombre, grupo, contacto)
- Ver perfil individual con datos consolidados
- Registrar, editar y eliminar calificaciones por materia
- Promedio general y por materia calculado automáticamente
- Porcentaje de asistencia acumulado y actualizado en tiempo real

### ✅ Tareas
- Crear tareas con título, descripción, materia asignada y fecha límite
- Editar y eliminar tareas
- Cambiar estado: `pendiente` → `en revisión` → `entregada`
- Filtrar lista por materia o por estado
- Ver detalle completo de cada tarea

### 📣 Avisos
- Crear avisos con título, contenido, fecha y categoría (general / urgente / informativo)
- Editar y eliminar avisos
- Lista ordenada del más reciente al más antiguo
- Vista de detalle con contenido completo

### 🗓️ Horario
- Vista semanal (lunes a viernes) generada automáticamente desde los horarios de Materias
- Navegación directa a la materia tocando cualquier bloque

### 📊 Calificaciones _(dentro del perfil del alumno)_
- Registro de notas por materia con descripción del tipo de evaluación
- Cálculo automático de promedio por materia y promedio general
- Edición y eliminación de calificaciones registradas

### 📋 Asistencia _(dentro del detalle de cada materia)_
- Lista de alumnos para marcar asistencia del día
- Historial de asistencia por fecha y por materia
- Porcentaje de asistencia reflejado en el perfil de cada alumno

---

## 🚀 Instrucciones de instalación y ejecución

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) instalado globalmente
- Aplicación **Expo Go** en tu dispositivo móvil ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/nombre-del-proyecto.git

# 2. Entra al directorio del proyecto
cd nombre-del-proyecto

# 3. Instala las dependencias
npm install
# o con yarn:
yarn install
```

### Ejecución

```bash
# Inicia el servidor de desarrollo
npx expo start
```

Escanea el código QR que aparece en la terminal con la app **Expo Go** desde tu dispositivo móvil para ver la aplicación en tiempo real.

### Opciones adicionales

```bash
# Ejecutar en emulador Android
npx expo start --android

# Ejecutar en simulador iOS (solo macOS)
npx expo start --ios

# Ejecutar en navegador web
npx expo start --web
```

---

## 📁 Estructura del proyecto

```
nombre-del-proyecto/
├── app/                  # Pantallas y navegación (Expo Router)
│   ├── (tabs)/           # Secciones de la barra inferior
│   │   ├── index.jsx     # Inicio
│   │   ├── materias.jsx  # Materias
│   │   ├── alumnos.jsx   # Alumnos
│   │   ├── tareas.jsx    # Tareas
│   │   └── avisos.jsx    # Avisos
│   └── _layout.jsx       # Layout raíz
├── components/           # Componentes reutilizables
├── storage/              # Lógica de persistencia local
├── assets/               # Imágenes e íconos
├── app.json              # Configuración de Expo
└── package.json
```

---

## 📄 Licencia
<!-- Define la licencia de tu proyecto -->
Este proyecto se desarrolla con fines académicos.

---

_Desarrollado con React Native y Expo._
