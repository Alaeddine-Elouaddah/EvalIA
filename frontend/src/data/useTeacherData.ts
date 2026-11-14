import { useContext } from 'react'
import { TeacherDataContext } from './teacherContext'

export function useTeacherData() {
  const context = useContext(TeacherDataContext)
  if (!context) throw new Error('useTeacherData doit être utilisé dans TeacherDataProvider')
  return context
}
