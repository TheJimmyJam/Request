export default function FeeCalculator({ itemCost, finderFee }) {
  const x = parseFloat(itemCost) || 0
  const y = parseFloat(finderFee) || 0
  const platform = Math.round((x + y) * 0.10 * 100) / 100
  const total    = Math.round((x + y) * 1.10 * 100) / 100

  if (x === 0 && y === 0) return null

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2">
      <p className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-3">Fee Breakdown</p>
      {[
        { label: 'Item Cost (X)', val: x, sub: "What the traveler will spend" },
        { label: "Finder's Fee (Y)", val: y, sub: "Traveler's compensation" },
        { label: 'Request Fee (10%)', val: platform, sub: "(X + Y) × 10%", highlight: true },
      ].map(row => (
        <div key={row.label} className={`flex items-center justify-between ${row.highlight ? 'text-brand-700 font-semibold' : 'text-gray-700'}`}>
          <div>
            <span>{row.label}</span>
            {row.sub && <p className="text-xs text-gray-400 font-normal">{row.sub}</p>}
          </div>
          <span>${row.val.toFixed(2)}</span>
        </div>
      ))}
      <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-bold text-gray-900">
        <span>Total You Pay</span>
        <span className="text-lg">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}
