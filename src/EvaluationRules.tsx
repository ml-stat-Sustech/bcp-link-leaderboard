import { Database, FileText, GlobeLock, Route, Search } from "lucide-react";
import type { Translation } from "./i18n";

function ToolPanel({
  icon,
  signature,
  summary,
  input,
  retrieval,
  response,
  copy,
}: {
  icon: React.ReactNode;
  signature: string;
  summary: string;
  input: string;
  retrieval: string;
  response: string;
  copy: Translation;
}) {
  return (
    <article className="tool-panel">
      <div className="tool-panel-heading">
        <span className="tool-icon" aria-hidden="true">{icon}</span>
        <div>
          <h3><code>{signature}</code></h3>
          <p>{summary}</p>
        </div>
      </div>
      <dl className="tool-specs">
        <div>
          <dt>{copy.rules.inputLabel}</dt>
          <dd>{input}</dd>
        </div>
        <div>
          <dt>{copy.rules.retrievalLabel}</dt>
          <dd>{retrieval}</dd>
        </div>
        <div>
          <dt>{copy.rules.responseLabel}</dt>
          <dd>{response}</dd>
        </div>
      </dl>
    </article>
  );
}

export function EvaluationRules({ copy }: { copy: Translation }) {
  const principleIcons = [<Database />, <GlobeLock />, <Route />];

  return (
    <section
      id="rules"
      className="page-section rules-section"
      aria-labelledby="rules-heading"
    >
      <div className="container section-inner">
        <div className="section-heading">
          <p className="section-kicker">{copy.rules.kicker}</p>
          <h2 id="rules-heading">{copy.rules.heading}</h2>
          <p className="section-note">{copy.rules.note}</p>
        </div>

        <div className="rule-principles">
          {copy.rules.principles.map((principle, index) => (
            <article key={principle.title}>
              <span className="principle-icon" aria-hidden="true">{principleIcons[index]}</span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="tool-grid">
          <ToolPanel
            icon={<Search />}
            signature="search(query)"
            summary={copy.rules.search.summary}
            input={copy.rules.search.input}
            retrieval={copy.rules.search.retrieval}
            response={copy.rules.search.response}
            copy={copy}
          />
          <ToolPanel
            icon={<FileText />}
            signature="visit(document_id, goal)"
            summary={copy.rules.visit.summary}
            input={copy.rules.visit.input}
            retrieval={copy.rules.visit.retrieval}
            response={copy.rules.visit.response}
            copy={copy}
          />
        </div>

        <p className="turn-limit">{copy.rules.turnLimit}</p>
      </div>
    </section>
  );
}
