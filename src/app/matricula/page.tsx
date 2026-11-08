import type { Metadata } from 'next'
import MatriculaClient from './MatriculaClient'

export const metadata: Metadata = {
  title: 'Matrícula | Escuela Virtual Escencia',
  description: 'Selecciona los horarios de las asignaturas de Escuela Virtual Escencia.',
}

export default function MatriculaPage() {
  return <MatriculaClient />
}
