import { Bot, Check, Copy, ExternalLink, ShieldCheck, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface ConnectAgentDialogProps {
  open: boolean;
  ready: boolean;
  onClose: () => void;
}

const demoPrompt = "Use venue.load_image with my empty hall photograph, then plan it for 150 guests with exactly 19 tables and 8 chairs per table, a dance floor, live band, DJ, two catering stations, a drinks bar, and an outdoor barbecue. Generate the strongest layout. Call venue.render_scene to receive the current image and exact edit brief. Use your own image tool to create the photoreal revision, then return it with venue.apply_image_revision. Capture and inspect the returned image. For each improvement, call venue.refine_scene, edit the image with your own image tool, and apply the new revision. Continue until the spacing and realism are excellent, then validate and stage it for my review.";

export function ConnectAgentDialog({ open, ready, onClose }: ConnectAgentDialogProps) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  return (
    <motion.div className="dialog-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.section className="connect-dialog" role="dialog" aria-modal="true" aria-labelledby="connect-title" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}>
        <button className="dialog-close" type="button" aria-label="Close agent setup" onClick={onClose}><X size={17} /></button>
        <div className="dialog-hero"><span className="dialog-bot"><Bot size={22} /></span><p className="eyebrow">WebMCP collaboration</p><h2 id="connect-title">Describe it. Your agent renders it.</h2><p>Your existing agent operates the same layout board and uses its own image capability. Venue Studio needs no account or API key.</p></div>
        <div className={`connection-check ${ready ? "is-ready" : ""}`}><span>{ready ? <Check size={15} /> : <Bot size={15} />}</span><p><strong>{ready ? "15 venue tools are ready" : "Open this page in a WebMCP browser"}</strong><small>The agent can receive the source image, generate a revision with its own image tool, return it to the studio, inspect it, and refine it again.</small></p></div>
        <ol className="connect-steps">
          <li><span>1</span><p><strong>Give the agent your empty venue photo</strong><small>You can upload it, or the agent can load image content received from another tool.</small></p></li>
          <li><span>2</span><p><strong>Tell your agent what the event needs</strong><small>Guests are counts, while stages, bands, food, bars, and custom zones are inventory.</small></p></li>
          <li><span>3</span><p><strong>Watch each image revision land</strong><small>The agent receives the real image after every pass and can keep refining. Only you can approve and export.</small></p></li>
        </ol>
        <div className="dialog-prompt"><div><p className="eyebrow">Demo prompt</p><span>Paste into your agent</span></div><p>{demoPrompt}</p><button className="button button-primary full-width" type="button" onClick={async () => { await navigator.clipboard.writeText(demoPrompt); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy agent prompt"}</button></div>
        <div className="dialog-trust"><ShieldCheck size={16} /><p><strong>No hidden image service.</strong> Your connected agent creates every revision, and only you can approve or export the final layout.</p></div>
        <a className="dialog-doc-link" href="https://learn.chatgpt.com/docs/webmcp" target="_blank" rel="noreferrer">How WebMCP site tools work <ExternalLink size={11} /></a>
      </motion.section>
    </motion.div>
  );
}
