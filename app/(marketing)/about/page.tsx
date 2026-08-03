export const metadata = { title: "About PlantiD" };

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <p className="stamp mb-6">About the project</p>
      <h1 className="text-4xl md:text-5xl leading-tight mb-6">
        Expert-level plant knowledge, in every pocket.
      </h1>
      <p className="text-parchment-200/80 text-lg">
        PlantiD is an AI-powered plant identification and disease-detection app
        built for farmers, gardeners, botanists, and anyone whose work or
        curiosity puts them in front of unfamiliar leaves. It replaces the
        wait for an agronomist or the guesswork of a search engine with an
        instant, structured field report.
      </p>

      <section className="mt-14">
        <h2 className="text-2xl mb-4">Why we built it</h2>
        <p className="text-parchment-200/70 leading-relaxed">
          Food security, sustainable agriculture, and biodiversity all hinge
          on catching plant health issues early — a single undetected disease
          can devastate a whole crop. PlantiD combines species identification,
          health assessment, and controlled-substance checking in one
          frictionless tool, so a smallholder farmer, a home gardener, and a
          field regulator can all get a professional-grade diagnosis from a
          single photo.
        </p>
      </section>

      <section className="mt-14 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg mb-2">What it does</h3>
          <ul className="text-sm text-parchment-200/70 space-y-2">
            <li>Identifies species (common &amp; scientific name, family, habitat, uses).</li>
            <li>Diagnoses disease, pest damage and nutrient stress with a severity rating.</li>
            <li>Flags regulated or controlled species for compliance.</li>
            <li>Supports batch aerial imagery for whole-plot monitoring.</li>
            <li>Answers follow-up questions through an AI plant-care assistant.</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg mb-2">How it works</h3>
          <ul className="text-sm text-parchment-200/70 space-y-2">
            <li>Upload one or more photos of a plant.</li>
            <li>A vision model returns a structured field report in seconds.</li>
            <li>Results are saved to your private history for later review.</li>
            <li>Feedback on each report improves the platform over time.</li>
          </ul>
        </div>
      </section>

      <div className="specimen-label mt-14">
        <p className="text-xs uppercase tracking-wider text-parchment-200/50">
          Field-journal note
        </p>
        <p className="text-parchment-200/70 mt-2 text-sm">
          PlantiD does not replace a licensed agronomist, plant pathologist, or
          regulator. Use its output as an informed second opinion — especially
          for treatment decisions or compliance calls.
        </p>
      </div>
    </main>
  );
}
