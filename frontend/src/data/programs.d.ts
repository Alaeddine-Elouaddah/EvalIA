export interface Program {
  id: string
  label: string
  language: 'fr' | 'en'
}

export interface ProgramGroup {
  id: string
  cycle: string
  programs: Program[]
}

export const programGroups: ProgramGroup[]
export const ENGLISH_PROGRAM_ID: string
export function getProgram(programId: string): Program | null
