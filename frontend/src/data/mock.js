const question = (id, text, options, explanation = '') => ({
  id,
  text,
  type: 'single',
  points: 1,
  options: options.map((option, index) => ({
    id: `${id}-${index + 1}`,
    text: option,
    isCorrect: index === 0,
  })),
  explanation,
})

export const mockExams = [
  {
    id: 'EX-2048',
    title: 'Algorithmique et complexité',
    subject: 'Algorithmique',
    durationMinutes: 45,
    date: '2026-11-18',
    openTime: '09:00',
    status: 'published',
    targets: ['prep-year-2'],
    language: 'fr',
    accessCode: 'K7M2QX',
    accessEnabled: true,
    participants: 28,
    mode: 'manual',
    questions: [
      question('q-1', 'Quelle est la complexité moyenne du tri fusion ?', ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)']),
      question('q-2', 'Quelle structure suit le principe LIFO ?', ['Une pile', 'Une file', 'Un arbre', 'Un graphe']),
    ],
  },
  {
    id: 'EX-2047',
    title: 'Bases de données relationnelles',
    subject: 'Bases de données',
    durationMinutes: 60,
    date: '2026-11-20',
    openTime: '10:00',
    status: 'published',
    targets: ['eng-sbdia'],
    language: 'fr',
    accessCode: 'P4T8WY',
    accessEnabled: true,
    participants: 24,
    mode: 'ai',
    questions: [
      question('q-3', 'Quel est le rôle d’une clé primaire ?', ['Identifier chaque ligne de façon unique', 'Trier les résultats', 'Chiffrer une table', 'Créer une vue']),
      question('q-4', 'Quelle clause filtre les groupes après agrégation ?', ['HAVING', 'WHERE', 'ORDER BY', 'LIMIT']),
    ],
  },
  {
    id: 'EX-2046',
    title: 'Réseaux — fondamentaux',
    subject: 'Réseaux',
    durationMinutes: 30,
    date: '2026-11-12',
    openTime: '09:30',
    status: 'finished',
    targets: ['eng-sitcn'],
    language: 'fr',
    accessCode: 'R6C3HT',
    accessEnabled: false,
    participants: 31,
    mode: 'manual',
    questions: [
      question('q-5', 'Quelle couche du modèle OSI route les paquets ?', ['Réseau', 'Liaison', 'Session', 'Application']),
    ],
  },
  {
    id: 'EX-2045',
    title: 'Programmation orientée objet',
    subject: 'Développement logiciel',
    durationMinutes: 40,
    date: '2026-11-25',
    openTime: '08:30',
    status: 'draft',
    participants: 0,
    mode: 'manual',
    questions: [
      question('q-6', 'Quel principe permet de masquer les détails internes ?', ['Encapsulation', 'Héritage', 'Polymorphisme', 'Surcharge']),
    ],
  },
]

export const mockStudents = [
  { id: 'ST-018', name: 'Yasmine El Amrani', email: 'yasmine.elamrani@ensiasd.ma', group: '2A — GI', programId: 'prep-year-2' },
  { id: 'ST-021', name: 'Adam Benali', email: 'adam.benali@ensiasd.ma', group: '2A — GI', programId: 'prep-year-2' },
  { id: 'ST-026', name: 'Salma Idrissi', email: 'salma.idrissi@ensiasd.ma', group: '2A — GI', programId: 'prep-year-2' },
  { id: 'ST-032', name: 'Mehdi Alaoui', email: 'mehdi.alaoui@ensiasd.ma', group: '2A — GD', programId: 'eng-sbdia' },
  { id: 'ST-041', name: 'Nour Eddine Tazi', email: 'nour.tazi@ensiasd.ma', group: '3A — GI', programId: 'eng-sitcn' },
  { id: 'ST-047', name: 'Lina Chraibi', email: 'lina.chraibi@ensiasd.ma', group: '3A — GD', programId: 'master-data-ai' },
]

export const mockResults = [
  { id: 'R-1001', studentId: 'ST-018', studentName: 'Yasmine El Amrani', studentEmail: 'yasmine.elamrani@ensiasd.ma', examId: 'EX-2046', examTitle: 'Réseaux — fondamentaux', score: 18, status: 'graded', submittedAt: '2026-11-12T10:42:00' },
  { id: 'R-1002', studentId: 'ST-021', studentName: 'Adam Benali', studentEmail: 'adam.benali@ensiasd.ma', examId: 'EX-2046', examTitle: 'Réseaux — fondamentaux', score: 15.5, status: 'graded', submittedAt: '2026-11-12T11:08:00' },
  { id: 'R-1003', studentId: 'ST-026', studentName: 'Salma Idrissi', studentEmail: 'salma.idrissi@ensiasd.ma', examId: 'EX-2046', examTitle: 'Réseaux — fondamentaux', score: 12, status: 'graded', submittedAt: '2026-11-12T11:19:00' },
  { id: 'R-1004', studentId: 'ST-032', studentName: 'Mehdi Alaoui', studentEmail: 'mehdi.alaoui@ensiasd.ma', examId: 'EX-2048', examTitle: 'Algorithmique et complexité', score: 16, status: 'graded', submittedAt: '2026-11-14T09:10:00' },
  { id: 'R-1005', studentId: 'ST-041', studentName: 'Nour Eddine Tazi', studentEmail: 'nour.tazi@ensiasd.ma', examId: 'EX-2048', examTitle: 'Algorithmique et complexité', score: null, status: 'in-progress', submittedAt: null },
  { id: 'R-1006', studentId: 'ST-047', studentName: 'Lina Chraibi', studentEmail: 'lina.chraibi@ensiasd.ma', examId: 'EX-2047', examTitle: 'Bases de données relationnelles', score: null, status: 'missing', submittedAt: null },
  { id: 'R-1007', studentId: 'ST-018', studentName: 'Yasmine El Amrani', studentEmail: 'yasmine.elamrani@ensiasd.ma', examId: 'EX-2048', examTitle: 'Algorithmique et complexité', score: 14, status: 'graded', submittedAt: '2026-11-14T09:26:00' },
  { id: 'R-1008', studentId: 'ST-026', studentName: 'Salma Idrissi', studentEmail: 'salma.idrissi@ensiasd.ma', examId: 'EX-2048', examTitle: 'Algorithmique et complexité', score: 19, status: 'graded', submittedAt: '2026-11-14T09:37:00' },
]

export const mockQuestionBank = [
  {
    ...question('bank-1', 'Quelle est la complexité moyenne du tri fusion ?', ['O(n log n)', 'O(n²)', 'O(log n)', 'O(n)']),
    subject: 'Algorithmique',
    level: '2A — GI',
    updatedAt: '2026-11-10',
  },
  {
    ...question('bank-2', 'Quel est le rôle d’une clé étrangère ?', ['Maintenir une relation entre deux tables', 'Identifier toutes les lignes', 'Compresser une colonne', 'Créer une transaction']),
    subject: 'Bases de données',
    level: '2A — GI',
    updatedAt: '2026-11-08',
  },
  {
    ...question('bank-3', 'Quelle couche du modèle OSI route les paquets ?', ['Réseau', 'Liaison', 'Session', 'Application']),
    subject: 'Réseaux',
    level: '2A — GD',
    updatedAt: '2026-11-06',
  },
]
