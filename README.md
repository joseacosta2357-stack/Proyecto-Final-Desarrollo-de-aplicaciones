Project Overview
Relevant source files
README.md
SistemaEscolar/app.json
SistemaEscolar/package.json
SistemaEscolar is a cross-platform educational management application built with React Native and Expo. It serves as a comprehensive tool for managing academic workflows, including student records, subject scheduling, attendance tracking, task management, and institutional announcements.

The application is designed for a mobile-first experience on Android and iOS, while maintaining compatibility with web browsers via react-native-web.

Tech Stack
The project leverages a modern TypeScript-based mobile stack:

Component	Technology
Framework	Expo (SDK 54) 
SistemaEscolar/package.json
15
Language	TypeScript 
SistemaEscolar/package.json
35
Navigation	Expo Router (File-based) 
SistemaEscolar/package.json
19
UI Components	React Native 
SistemaEscolar/package.json
25
Persistence	AsyncStorage 
SistemaEscolar/package.json
13
Icons	@expo/vector-icons (FontAwesome) 
SistemaEscolar/package.json
12
Core Modules
The application is structured into five primary functional modules, each represented by a dedicated tab in the navigation shell.

1. Home Dashboard (Inicio)
The entry point of the application. It aggregates data from all other modules to provide a high-level summary, including active subjects, pending tasks, and the latest announcements. It features a schedule parser that visualizes the weekly timetable.

Key File: app/(tabs)/index.tsx
2. Subjects Management (Materias)
Handles the academic curriculum. It allows for the creation of subjects, definition of weekly schedules, and contains the Attendance (Asistencia) sub-system for daily roll calls.

Key File: app/(tabs)/materias.tsx
3. Student Management (Alumnos)
Manages the student roster. This module includes GPA calculation logic, grade entry per subject, and visual indicators for academic performance.

Key File: app/(tabs)/alumnos.tsx
4. Task Tracker (Tareas)
A lifecycle-based task management system. Tasks transition through states (Pending, In Review, Delivered) and are categorized by subject.

Key File: app/(tabs)/tareas.tsx
5. Announcements (Avisos)
A communication hub for broadcasting information. Supports categorization (General, Urgent, Informative) and chronological sorting.

Key File: app/(tabs)/avisos.tsx
System Integration Diagram
The following diagram illustrates how the five main modules interact through the shared persistence layer.

Module Interaction & Storage Map
























Sources: 
SistemaEscolar/package.json
13
 
SistemaEscolar/app.json
33

Project Structure & Navigation
The project follows the Expo Router convention where the file system defines the navigation stack. The app/ directory serves as the root for all screens and layouts.

Code-to-Entity Mapping











Sources: 
SistemaEscolar/package.json
3
 
SistemaEscolar/app.json
6-10

Setup and Configuration
To get started with development, please refer to the following child pages:

Getting Started: Instructions for environment setup, dependency installation via npm install, and running the development server using npx expo start.
Application Configuration: Detailed breakdown of app.json settings, including the newArchEnabled flag, typedRoutes experiment, and platform-specific configurations for Android and iOS.
Sources: 
SistemaEscolar/package.json
5-10
 
SistemaEscolar/app.json
1-39
