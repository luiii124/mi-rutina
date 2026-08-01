import { createHashRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Inicio } from './screens/Inicio/Inicio'
import { MiProgreso } from './screens/MiProgreso/MiProgreso'
import { Ajustes } from './screens/Ajustes/Ajustes'
import { Rutina } from './screens/Rutina/Rutina'
import { Debug } from './screens/Debug/Debug'

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Inicio /> },
      { path: '/progreso', element: <MiProgreso /> },
      { path: '/ajustes', element: <Ajustes /> },
      { path: '/rutinas/:routineId', element: <Rutina /> },
      { path: '/debug', element: <Debug /> },
    ],
  },
])
