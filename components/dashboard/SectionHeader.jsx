export default function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <img src="/assets/observone_logo_1080p.png" alt="ObservOne logo" className="h-8 w-8 object-contain rounded" />
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <span className="ml-2 text-primary font-extrabold">{subtitle}</span>
        ) : null}
      </div>
      {right}
    </div>
  )
}
