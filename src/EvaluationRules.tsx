import { FileText, RefreshCw, Route, Search, Wrench } from "lucide-react";
import type { Translation } from "./i18n";

function ToolPanel({
  icon,
  title,
  summary,
  input,
  retrieval,
  response,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  summary: string;
  input: string;
  retrieval: string;
  response: string;
  copy: Translation;
}) {
  return (
    <article className="tool-panel">
      <div className="tool-panel-heading">
        <div className="tool-title-row">
          <span className="tool-icon" aria-hidden="true">{icon}</span>
          <h3>{title}</h3>
        </div>
        <p>{summary}</p>
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
  const principleIcons = [<RefreshCw />, <Route />, <Wrench />];

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

        <div
          className="evaluation-flow-scroll"
          tabIndex={0}
          aria-label={copy.rules.flowScrollLabel}
        >
          <ol className="evaluation-flow">
            {copy.rules.flowSteps.map((step, index) => (
              <li
                key={`${step.title}-${step.detail}`}
                className={
                  index === 1
                    ? "flow-step flow-step-search"
                    : index === 2 || index === 3
                      ? "flow-step flow-step-visit"
                      : "flow-step"
                }
              >
                <span className="flow-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="flow-node" aria-hidden="true" />
                <strong>{step.title}</strong>
                <small>{step.detail}</small>
              </li>
            ))}
          </ol>
        </div>

        <div className="tool-grid">
          <ToolPanel
            icon={<Search />}
            title={copy.rules.search.title}
            summary={copy.rules.search.summary}
            input={copy.rules.search.input}
            retrieval={copy.rules.search.retrieval}
            response={copy.rules.search.response}
            copy={copy}
          />
          <ToolPanel
            icon={<FileText />}
            title={copy.rules.visit.title}
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
