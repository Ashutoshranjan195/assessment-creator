import type { GeneratedQuestionPaper } from '@vedaai/shared';
import { DifficultyBadge } from './DifficultyBadge';

interface Props {
  paper: GeneratedQuestionPaper;
  /** When true, suppresses interactive chrome (used by the /print route). */
  printMode?: boolean;
}

export function QuestionPaper({ paper, printMode = false }: Props): JSX.Element {
  return (
    <article
      role="document"
      className={`paper bg-white ${
        printMode
          ? 'mx-auto max-w-[820px] p-10 font-sans text-[15px] leading-7'
          : 'rounded-[24px] p-5 font-sans text-[15px] leading-7 sm:p-8'
      }`}
    >
      <header className="text-center pb-5 mb-6 border-b border-slate-200">
        <h1 className="text-[1.8rem] sm:text-[2.15rem] font-semibold tracking-tight text-slate-800">{paper.header.school}</h1>
        <p className="text-[1.05rem] font-semibold mt-1 text-slate-700">
          {paper.header.subject} &middot; {paper.header.class}
        </p>
        <p className="text-[1rem] mt-2 text-slate-700">
          Time Allowed: <strong>{paper.header.timeAllowed}</strong> &nbsp;&nbsp; Maximum Marks:{' '}
          <strong>{paper.header.maxMarks}</strong>
        </p>
      </header>

      <section className="mb-6 avoid-break">
        <div className="grid grid-cols-1 gap-2 text-[1rem] sm:grid-cols-2">
          {paper.studentInfo.map((label) => (
            <div key={label} className="flex items-end gap-2 text-slate-700">
              <span className="whitespace-nowrap font-semibold">{label}:</span>
              <span className="flex-1 border-b border-slate-500 h-5" />
            </div>
          ))}
        </div>
      </section>

      {paper.sections.map((section, sIdx) => (
        <section key={section.title} className={sIdx > 0 ? 'mt-8 avoid-break' : 'avoid-break'}>
          <h2 className="text-[1.15rem] font-semibold tracking-tight border-b border-slate-200 pb-1 text-slate-800">
            {section.title}
          </h2>
          <p className="text-[0.95rem] italic text-slate-600 mb-3">{section.instruction}</p>
          <ol className="space-y-5">
            {section.questions.map((q) => (
              <li key={q.id} className="avoid-break">
                <div className="flex items-start gap-3 text-slate-800">
                  <span className="min-w-[2.5rem] font-medium">{q.id}.</span>
                  <div className="flex-1">
                    <p className="text-[0.98rem] leading-7">{q.text}</p>
                    {q.options && q.options.length > 0 && (
                      <ol className="mt-3 ml-4 list-[lower-alpha] space-y-1.5 text-[0.96rem] text-slate-700">
                        {q.options.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        ))}
                      </ol>
                    )}
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <DifficultyBadge value={q.difficulty} />
                      <span>[{q.marks} mark{q.marks === 1 ? '' : 's'}]</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <footer className="mt-10 text-center text-sm font-semibold text-slate-500 border-t border-slate-200 pt-4">
        End of Question Paper
      </footer>
    </article>
  );
}
