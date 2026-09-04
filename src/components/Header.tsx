import { Bot, Lightbulb, RefreshCcw, Sparkles, Upload } from "lucide-react";

interface HeaderProps {
  eventName: string;
  eventMeta: string;
  webmcpSupported: boolean;
  webmcpRegistered: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onConnect: () => void;
  onPrompts: () => void;
}

export function Header({
  eventName,
  eventMeta,
  webmcpSupported,
  webmcpRegistered,
  onGenerate,
  onReset,
  onConnect,
  onPrompts,
}: HeaderProps) {
  const status = webmcpRegistered ? "15 agent tools ready" : webmcpSupported ? "Connecting tools" : "Manual mode";
  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
        <div>
          <p className="eyebrow">Venue Studio</p>
          <h1>{eventName}</h1>
          <p className="event-meta">{eventMeta}</p>
        </div>
      </div>
      <div className="header-actions">
        <span className={`agent-status ${webmcpRegistered ? "is-ready" : ""}`}><i />{status}</span>
        <button className="button button-quiet" type="button" onClick={onReset}><RefreshCcw size={14} />Reset demo</button>
        <button className="button button-quiet button-prompts" type="button" onClick={onPrompts}><Lightbulb size={14} />Sample prompts</button>
        <button className="button button-connect" type="button" onClick={onConnect}><Bot size={15} />Connect agent</button>
        <button className="button button-primary" type="button" onClick={onGenerate}><Sparkles size={15} />Generate plan</button>
        <span className="upload-hint"><Upload size={13} />Your agent renders</span>
      </div>
    </header>
  );
}
