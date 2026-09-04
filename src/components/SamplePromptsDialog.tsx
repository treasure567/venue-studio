import { Check, Copy, ExternalLink, Library, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { samplePrompts } from "../samplePrompts";

interface SamplePromptsDialogProps {
  onClose: () => void;
}

export function SamplePromptsDialog({ onClose }: SamplePromptsDialogProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyPrompt(id: string, prompt: string) {
    await navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId((current) => current === id ? null : current), 1600);
  }

  return (
    <motion.div className="dialog-backdrop prompt-library-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.section className="prompt-library-dialog" role="dialog" aria-modal="true" aria-labelledby="prompt-library-title" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.985 }}>
        <button className="dialog-close" type="button" aria-label="Close sample prompts" onClick={onClose}><X size={17} /></button>
        <div className="prompt-library-header">
          <span><Library size={21} /></span>
          <div><p className="eyebrow">Agent inspiration library</p><h2 id="prompt-library-title">Ten rooms worth imagining.</h2><p>Every brief now includes a complete photoreal example. Seven begin with a different sourced venue photograph.</p></div>
        </div>
        <div className="prompt-showcase-grid">
          {samplePrompts.map((sample) => (
            <article className="prompt-card has-preview" key={sample.id}>
              <img src={sample.preview} alt={`${sample.title} sample render`} loading="lazy" decoding="async" />
              <div className="prompt-card-body">
                <span className="prompt-event-type">{sample.eventType}</span>
                <h3>{sample.title}</h3>
                <p>{sample.summary}</p>
                {sample.source.url ? <a className="prompt-source-link" href={sample.source.url} target="_blank" rel="noreferrer"><ExternalLink size={12} />Source venue: {sample.source.creator} · {sample.source.license}</a> : <span className="prompt-source-note">{sample.source.label} · {sample.source.license}</span>}
                <details><summary>Read full prompt</summary><p>{sample.prompt}</p></details>
                <button type="button" onClick={() => void copyPrompt(sample.id, sample.prompt)}>{copiedId === sample.id ? <Check size={13} /> : <Copy size={13} />}{copiedId === sample.id ? "Copied" : "Copy prompt"}</button>
              </div>
            </article>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
