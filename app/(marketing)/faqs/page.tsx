export const metadata = { title: "FAQs — PlantiD" };

const FAQS: { q: string; a: string }[] = [
  {
    q: "How accurate is the identification?",
    a: "Every result comes with a confidence score. Above 90% usually means the model is confident in the species; anything below 70% should be treated as a starting point and cross-checked. Clear, well-lit photos of the whole plant (leaf, stem, and any flowers) give the best results.",
  },
  {
    q: "Can PlantiD diagnose disease?",
    a: "Yes — it flags disease, pest damage, nutrient deficiency, and environmental stress, rates severity from Low to Severe, and suggests treatment and prevention steps. For high-value crops or ambiguous symptoms, confirm with a local extension officer or plant pathologist before acting.",
  },
  {
    q: "What is Drone Mode?",
    a: "Drone Mode accepts a batch of aerial or walk-through photos of a plot and returns a plot-level health read on the dominant crop, rather than a single-specimen identification. Useful for farm surveys where you care about coverage and stress patterns instead of one leaf.",
  },
  {
    q: "Why does PlantiD flag some plants as controlled?",
    a: "Some species (e.g. Cannabis, Opium Poppy) are regulated in most jurisdictions. When the model is confident a photo shows one, we surface it explicitly so regulators, land managers, and growers all have the same signal to act on.",
  },
  {
    q: "Do you store my photos?",
    a: "Yes — photos and analysis results are stored to your private History so you can return to them, export them, and give feedback. You can delete any analysis (and its photos) from the History page at any time.",
  },
  {
    q: "Can I export a report?",
    a: "Yes. From an analysis result or a row in History, use “Export report” to download a PDF you can share with a client, extension officer, or your own records.",
  },
  {
    q: "How does feedback improve the app?",
    a: "The 👍 / 👎 on a result is stored against the analysis and used to prioritise where the identification and health-assessment prompts need work. It is never shared publicly.",
  },
  {
    q: "Is there a free tier?",
    a: "During the beta, PlantiD is free to use with a fair-use limit on analyses per day so a single account can’t swamp the vision model. If you hit the limit, come back in an hour.",
  },
];

export default function FAQsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <p className="stamp mb-6">Frequently asked</p>
      <h1 className="text-4xl md:text-5xl leading-tight mb-4">
        How PlantiD works, in plain terms.
      </h1>
      <p className="text-parchment-200/70 max-w-xl mb-10">
        The short answers you need before trusting a diagnosis. Anything
        missing? Ping us on the Contact page.
      </p>

      <div className="flex flex-col gap-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="specimen-label group open:pb-5"
          >
            <summary className="cursor-pointer list-none font-display text-lg pr-6 relative">
              {item.q}
              <span className="absolute right-0 top-1 text-ochre-400 group-open:rotate-45 transition-transform inline-block h-4 w-4 text-center leading-4">
                +
              </span>
            </summary>
            <p className="text-sm text-parchment-200/70 mt-3 leading-relaxed">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </main>
  );
}
