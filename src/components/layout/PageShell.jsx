import Header from "./Header";

export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-950">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-orange-500 via-amber-400 to-emerald-400" />
      <div className="relative">
        <Header title={title} subtitle={subtitle} />
        <main className="px-4 pt-4">{children}</main>
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, description, icon }) {
  return (
    <section className="mb-5 rounded-lg border border-white/30 bg-white/90 p-4 shadow-xl shadow-slate-950/10 backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {eyebrow}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        {icon && (
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-orange-100 text-orange-700">
            {icon}
          </div>
        )}
      </div>
    </section>
  );
}

export function StatePanel({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white p-6 text-center shadow-sm">
      {icon && (
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-orange-100 text-orange-700">
          {icon}
        </div>
      )}
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
