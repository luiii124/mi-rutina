import { createHashRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Inicio } from './screens/Inicio/Inicio'
import { MiProgreso } from './screens/MiProgreso/MiProgreso'
import { Ajustes } from './screens/Ajustes/Ajustes'
import { Rutina } from './screens/Rutina/Rutina'
import { RoutineForm } from './screens/Rutina/RoutineForm'
import { WorkoutForm } from './screens/Entreno/WorkoutForm'
import { Entreno } from './screens/Entreno/Entreno'
import { ConfigurarEjercicio } from './screens/Entreno/ConfigurarEjercicio'
import { AnadirEjercicio } from './screens/AnadirEjercicio/AnadirEjercicio'
import { EjercicioSesion } from './screens/Sesion/EjercicioSesion'
import { Debug } from './screens/Debug/Debug'

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/progreso', element: <MiProgreso /> },
      { path: '/ajustes', element: <Ajustes /> },

      { path: '/rutinas/nueva', element: <RoutineForm /> },
      { path: '/rutinas/:routineId', element: <Rutina /> },
      { path: '/rutinas/:routineId/editar', element: <RoutineForm /> },
      { path: '/rutinas/:routineId/entrenos/nuevo', element: <WorkoutForm /> },

      { path: '/entrenos/:workoutId', element: <Entreno /> },
      { path: '/entrenos/:workoutId/editar', element: <WorkoutForm /> },
      { path: '/entrenos/:workoutId/anadir-ejercicio', element: <AnadirEjercicio /> },
      { path: '/entrenos/:workoutId/ejercicios/nuevo', element: <ConfigurarEjercicio /> },
      {
        path: '/entrenos/:workoutId/ejercicios/:workoutExerciseId/editar',
        element: <ConfigurarEjercicio />,
      },
      {
        path: '/entrenos/:workoutId/sesion/:sessionId/:workoutExerciseId',
        element: <EjercicioSesion />,
      },

      { path: '/debug', element: <Debug /> },
    ],
  },
])
