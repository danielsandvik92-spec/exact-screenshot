import { useNavigate } from "react-router-dom";

const Gdpr = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EFF2EE",
      maxWidth: "430px",
      margin: "0 auto",
      padding: "40px 24px 60px",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none", border: "none",
          fontFamily: "'Nunito', sans-serif",
          fontSize: 14, color: "#5E6B5A",
          cursor: "pointer", padding: 0,
          marginBottom: 24,
        }}
      >
        ← Tilbake
      </button>

      <h1 style={{
        fontFamily: "'Lora', serif",
        fontSize: 26, color: "#2D4A3E",
        fontWeight: 400, marginBottom: 8,
      }}>
        Personvern
      </h1>

      <p style={{ fontSize: 14, color: "#8E9B8A", lineHeight: 1.7, marginBottom: 32 }}>
        Ro & Retning er laget med respekt for det du deler. Det du skriver i appen er personlig og sensitivt — og det behandler vi deretter. Denne erklæringen forklarer hvordan vi håndterer dine opplysninger i henhold til GDPR og norsk personvernlovgivning.
      </p>

      {[
        {
          title: "Hvem er ansvarlig",
          text: "Behandlingsansvarlig for dine personopplysninger er Ro & Retning. Kontakt oss på personvern@roretning.no ved spørsmål om hvordan vi behandler dine data."
        },
        {
          title: "Hva vi lagrer",
          text: "Vi lagrer e-postadressen din og dataen du registrerer i appen — innsjekker, øvelser og refleksjoner. Dette lagres sikkert via Supabase, vår databehandler, med servere i EU/EØS-regionen."
        },
        {
          title: "Behandlingsgrunnlag",
          text: "Vi behandler dine opplysninger på grunnlag av samtykke (du godtar disse vilkårene ved registrering) og avtale (vi trenger e-postadressen din for å levere tjenesten). Du kan når som helst trekke tilbake samtykket ditt ved å slette kontoen din."
        },
        {
          title: "Hvem som ser dataen din",
          text: "Ingen andre enn deg har tilgang til det du skriver i appen. Vi selger ikke, deler ikke, og analyserer ikke din personlige data. Vi har inngått databehandleravtale med Supabase som sikrer at din data behandles i henhold til GDPR."
        },
        {
          title: "AI-refleksjon",
          text: "Noen funksjoner i appen bruker kunstig intelligens (Anthropic Claude) til å generere personlige refleksjoner basert på det du har delt. Dette er ikke automatiserte beslutninger som har rettslig virkning for deg — det er et støtteverktøy du selv velger å bruke."
        },
        {
          title: "Lagringstid",
          text: "Vi lagrer dine data så lenge du har en aktiv konto. Dersom du ikke har vært aktiv på over 24 måneder, vil vi varsle deg før vi sletter kontoen. Du kan selv slette all data når som helst."
        },
        {
          title: "Dine rettigheter",
          text: "Du har rett til innsyn i, retting av og sletting av dine personopplysninger. Du har også rett til dataportabilitet og til å protestere mot behandlingen. Send en e-post til personvern@roretning.no så hjelper vi deg umiddelbart."
        },
        {
          title: "Klagerett",
          text: "Dersom du mener vi ikke behandler dine opplysninger i henhold til loven, har du rett til å klage til Datatilsynet (datatilsynet.no)."
        },
        {
          title: "Informasjonskapsler",
          text: "Vi bruker kun nødvendige informasjonskapsler for å holde deg innlogget. Vi bruker ingen sporings- eller reklamekapsler."
        },
      ].map((section, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "'Lora', serif",
            fontSize: 16, color: "#2D4A3E",
            fontWeight: 400, marginBottom: 8,
          }}>
            {section.title}
          </div>
          <p style={{
            fontSize: 14, color: "#5E6B5A",
            lineHeight: 1.8, margin: 0,
          }}>
            {section.text}
          </p>
        </div>
      ))}

      <p style={{
        fontSize: 12, color: "#B8C4B0",
        lineHeight: 1.6, marginTop: 32,
        fontStyle: "italic",
      }}>
        Ro & Retning følger GDPR og norsk personvernlovgivning. Sist oppdatert: mars 2026.
      </p>
    </div>
  );
};

export default Gdpr;