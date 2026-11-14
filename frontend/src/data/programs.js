export const programGroups = [
  {
    id: 'preparatory',
    cycle: 'Cycle préparatoire',
    programs: [
      { id: 'prep-year-1', label: '1ère année', language: 'fr' },
      { id: 'prep-year-2', label: '2ème année', language: 'fr' },
    ],
  },
  {
    id: 'engineering',
    cycle: 'Cycle ingénieur',
    programs: [
      { id: 'eng-sbdia', label: 'Sciences des Données, Big data & IA (SDBDIA)', language: 'fr' },
      { id: 'eng-sitcn', label: 'Sécurité IT et Confiance Numérique (SITCN)', language: 'fr' },
      { id: 'eng-il', label: 'Ingénierie Logicielle (IL)', language: 'fr' },
      { id: 'eng-mgsi', label: 'Management et Gouvernance des Systèmes d’Informations (MGSI)', language: 'fr' },
      { id: 'eng-deis', label: 'Data Engineering and Intelligent Systems (DEIS)', language: 'en' },
    ],
  },
  {
    id: 'masters',
    cycle: 'Masters',
    programs: [
      { id: 'master-data-ai', label: 'Ingénierie des Données et Intelligence Artificielle', language: 'fr' },
      { id: 'master-cyber', label: 'Sécurité des Systèmes Intelligents et Cyberdéfense', language: 'fr' },
    ],
  },
]

export const ENGLISH_PROGRAM_ID = 'eng-deis'

export function getProgram(programId) {
  for (const group of programGroups) {
    const program = group.programs.find((item) => item.id === programId)
    if (program) return program
  }
  return null
}
