import { useNavigate } from "react-router-dom";

const Gdpr = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EFF2EE",
      display: "flex",
      flexDirection: "column",
      padding: "60px 24px 40px",
      maxWidth: "430px",
      margin: "0 auto",
    }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "none",
          border: "none",
          fontFamily: "'Nunito', sans-serif",
          fontSize: "15px",
          color: "#5E6B5A",
          cursor: "pointer",
          textAlign: "left",
          marginBottom: "32px",
          padding: 0,
        }}
      >
        ← Tilbake
      </button>

      <h1 style={{
        fontFamily: "'Lora', serif",
        fontSize: "26px",
        color: "#2D4A3E",
        fontWeight: 400,
        marginBottom: "24px",
      }}>
        Personvern
      </h1>

      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Nunito', sans-serif",
        fontSize: "15px",
        color: "#5E6B5A",
        lineHeight: 1.8,
      }}>
        <p>
          Ro & Retning er laget med respekt for det du deler. Det du skriver i appen er personlig og sensitivt — og det behandler vi deretter.
        </p>

        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "#2D4A3E", fontWeight: 400, marginBottom: "8px" }}>
            Hva vi lagrer
          </h2>
          <p>
            Vi lagrer e-postadressen din og dataen du registrerer i appen — innsjekker, øvelser og refleksjoner. Dette lagres sikkert i vår database.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "#2D4A3E", fontWeight: 400, marginBottom: "8px" }}>
            Hvem som ser dataen din
          </h2>
          <p>
            Ingen andre enn deg har tilgang til det du skriver i appen. Vi selger ikke, deler ikke, og analyserer ikke din personlige data.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "#2D4A3E", fontWeight: 400, marginBottom: "8px" }}>
            Dine rettigheter
          </h2>
          <p>
            Du kan når som helst be om å få slettet all din data. Send en e-post til oss så ordner vi det umiddelbart.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", color: "#2D4A3E", fontWeight: 400, marginBottom: "8px" }}>
            Informasjonskapsler
          </h2>
          <p>
            Vi bruker kun nødvendige informasjonskapsler for å holde deg innlogget. Vi bruker ingen sporings- eller reklamekapsler.
          </p>
        </div>

        <p style={{ fontSize: "13px", color: "#8E9B8A", marginTop: "8px" }}>
          Ro & Retning følger GDPR og norsk personvernlovgivning.
        </p>
      </div>
    </div>
  );
};

export default Gdpr;
