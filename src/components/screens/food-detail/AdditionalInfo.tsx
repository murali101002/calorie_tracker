interface InfoItem {
  label: string
  value: string
}

interface AdditionalInfoProps {
  items: InfoItem[]
}

export function AdditionalInfo({ items }: AdditionalInfoProps) {
  return (
    <section>
      <h3 className="text-label-lg text-on-background mb-4">Additional Info</h3>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex justify-between items-center py-2 ${
              i < items.length - 1 ? 'border-b border-outline-variant/50' : ''
            }`}
          >
            <span className="text-body-md text-outline">{item.label}</span>
            <span className="text-body-lg text-on-background">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
