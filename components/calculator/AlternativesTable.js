import { Check } from 'lucide-react'

/**
 * Mode B alternatives: what other standard water volumes would give you.
 *
 * A real <table> with a caption and scope'd headers, and the recommended row
 * is marked with a tick and a visually-hidden label — native marks it with
 * colour and a bare "✓" glyph appended to the number.
 */
export default function AlternativesTable({ alternatives, recommendedWater }) {
  if (!alternatives?.length) return null

  return (
    <div className="mt-5">
      <p className="eyebrow mb-2">Alternative water volumes</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[380px] border-collapse text-left font-mono text-[12px]">
          <caption className="sr-only">
            Draw units, concentration and dose count for other standard BAC
            water volumes
          </caption>
          <thead>
            <tr className="text-tx3-body">
              <th scope="col" className="py-1.5 pr-2 font-normal">Water</th>
              <th scope="col" className="py-1.5 pr-2 font-normal">Units/dose</th>
              <th scope="col" className="py-1.5 pr-2 font-normal">Conc.</th>
              <th scope="col" className="py-1.5 text-right font-normal">Doses</th>
            </tr>
          </thead>
          <tbody>
            {alternatives.map((a) => {
              const isRecommended = a.water_ml === recommendedWater
              return (
                <tr
                  key={a.water_ml}
                  className={
                    isRecommended
                      ? 'bg-teal/6 font-bold text-teal'
                      : 'text-tx2'
                  }
                >
                  <td className="py-1.5 pr-2">
                    <span className="inline-flex items-center gap-1">
                      {a.water_ml} mL
                      {isRecommended && (
                        <>
                          <Check size={12} aria-hidden="true" />
                          <span className="sr-only">(recommended)</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2">{a.units_per_dose.toFixed(1)}</td>
                  <td className="py-1.5 pr-2">{a.concentration.toFixed(0)}</td>
                  <td className="py-1.5 text-right">{a.doses_per_vial}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-tx3-body">
        Concentration in mcg/mL · units on a U-100 syringe
      </p>
    </div>
  )
}
