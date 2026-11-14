import { useMemo, useState } from 'react'
import { BookOpenCheck, Search } from 'lucide-react'
import { useTeacherData } from '../../data/useTeacherData'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Input } from '../../components/ui/Input'
import { PageHeader } from './shared'

export function Questions() {
  const { questionBank } = useTeacherData()
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('all')
  const subjects = [...new Set(questionBank.map((question) => question.subject))]
  const visible = useMemo(() => questionBank.filter((question) => {
    const matchesText = `${question.text} ${question.subject}`.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr'))
    return matchesText && (subject === 'all' || question.subject === subject)
  }), [questionBank, search, subject])

  return (
    <>
      <PageHeader
        eyebrow="Ressources pédagogiques"
        title="Banque de questions"
        description="Retrouvez les questions de démonstration classées par matière et par niveau."
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_240px]">
          <Input label="Rechercher une question" placeholder="Énoncé ou matière…" value={search} onChange={(event) => setSearch(event.target.value)} leadingIcon={<Search className="h-4 w-4" />} />
          <div className="space-y-1.5">
            <label htmlFor="question-subject" className="block text-sm font-medium text-ink">Matière</label>
            <select id="question-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="all">Toutes les matières</option>
              {subjects.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">{visible.length} question{visible.length > 1 ? 's' : ''}</p>
        {visible.length === 0 ? (
          <div className="mt-4"><EmptyState icon={BookOpenCheck} title="Aucune question trouvée" description="Essayez une autre recherche ou sélectionnez une autre matière." /></div>
        ) : (
          <div className="mt-4 space-y-3">
            {visible.map((question) => (
              <article key={question.id} className="rounded-xl border border-line p-4 transition hover:border-primary-200 hover:bg-canvas/40">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={question.type === 'single' ? 'info' : 'warning'}>{question.type === 'single' ? 'Choix unique' : 'Choix multiple'}</Badge>
                  <span className="text-xs font-medium text-muted">{question.subject}</span>
                  <span className="text-xs text-muted">· {question.level}</span>
                </div>
                <h2 className="mt-3 text-sm font-semibold leading-6 text-ink">{question.text}</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <div key={option.id} className={`rounded-lg border px-3 py-2 text-xs ${option.isCorrect ? 'border-success-line bg-success-soft font-medium text-success' : 'border-line text-muted'}`}>
                      {option.text}{option.isCorrect && <span className="ml-2">· Bonne réponse</span>}
                    </div>
                  ))}
                </div>
                {question.explanation && <p className="mt-3 border-t border-line pt-3 text-xs leading-5 text-muted"><span className="font-semibold text-ink">Explication : </span>{question.explanation}</p>}
              </article>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
