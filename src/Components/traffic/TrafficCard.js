// A panel on the Traffic page: a title with an icon, one plain-language line
// saying what it shows, and the content.
import React from "react";

export default function TrafficCard({ icon: Icon, title, hint, actions, className = "", children, index = 0 }) {
  return (
    <section className={`tr-card ${className}`} style={{ "--i": index }}>
      <header className="tr-card-head">
        <div>
          <h2 className="tr-card-title">
            {Icon && (
              <span className="tr-card-icon" aria-hidden="true">
                <Icon />
              </span>
            )}
            {title}
          </h2>
          {hint && <p className="tr-card-hint">{hint}</p>}
        </div>
        {actions && <div className="tr-card-actions">{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function EmptyNote({ children }) {
  return <p className="tr-empty">{children}</p>;
}
