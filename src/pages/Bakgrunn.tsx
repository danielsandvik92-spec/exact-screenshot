import { useState } from "react";
import { useNavigate } from "react-router-dom";

const temaer = [
  {
    id: "kropp",
    tittel: "Hvorfor kroppen reagerer",
    kort: "Kroppen din er ikke din fiende. Når du kjenner uro, hjertebank eller at du vil trekke deg unna — er det nervesystemet ditt som prøver å beskytte deg. Det har gjort dette lenge, lenge før du ble deg.",
    mer: "Forsker Stephen Porges har vist at nervesystemet hele tiden scanner etter fare — ikke gjennom tanker, men gjennom kroppen. Når systemet oppfatter trussel, skjer det automatisk: hjertefrekvensen øker, musklene spenner seg, tankene spinner. Dette kalles aktivering.\n\nDet viktige er at kroppen ikke skiller godt mellom fysisk fare og sosial fare. En melding uten svar kan aktivere samme system som en reell trussel. Det er ikke svakhet — det er biologi.\n\nRegulering handler om å hjelpe nervesystemet tilbake til trygghet. Pust, grounding og bevegelse virker fordi de snakker direkte til kroppen — ikke til tankene.",
  },
  {
    id: "skam",
    tittel: "Skam og den indre kritikeren",
    kort: "Skam er ikke det samme som skyld. Skyld sier 'jeg gjorde noe galt'. Skam sier 'jeg er feil'. Det er en viktig forskjell — og skam er ofte det som ligger under den harde stemmen inni deg.",
    mer: "Psykolog Paul Gilbert har forsket mye på hvordan skam og selvkritikk fungerer. Han fant at mennesker med høy skam har et overaktivt trusselssystem — den indre kritikeren er egentlig et forsøk på å beskytte deg mot avvisning og feil.\n\nProblemet er at kritikeren ikke hjelper. Den forsterker skammen i stedet for å løse den. Det som faktisk hjelper er å møte kritikeren med nysgjerrighet — hvem ligner denne stemmen på? Hva er den egentlig redd for?\n\nSelvmedfølelse er ikke det samme som å gi opp eller være snill med deg selv på en overfladisk måte. Det er å behandle deg selv med samme varme du ville gitt en god venn.",
  },
  {
    id: "relasjoner",
    tittel: "Relasjoner og tilknytning",
    kort: "Måten vi forholder oss til nære mennesker er ofte formet lenge før vi husker det. Ikke fordi noe er galt med oss — men fordi vi lærte oss å overleve i de relasjonene vi hadde.",
    mer: "Tilknytningsteori, utviklet av John Bowlby, viser at vi som barn knytter oss til omsorgspersoner på den måten som fungerer best for oss. Noen lærer at nærhet er trygt. Andre lærer at de må være på vakt, eller at det er best å klare seg selv.\n\nDisse mønstrene følger oss inn i voksenlivet. En melding uten svar kan føles som avvisning. En litt kjøligere tone kan aktivere frykt for å miste noen. Det er ikke overfølsomhet — det er gamle mønstre som prøver å beskytte deg.\n\nÅ forstå sine egne mønstre er ikke det samme som å endre dem over natten. Men det er et viktig første steg å se dem — og å vite at de ikke er hvem du er.",
  },
  {
    id: "tanker",
    tittel: "Tankemønstre og kognitiv forståelse",
    kort: "Hjernen din er ikke alltid en pålitelig forteller. Den fyller inn hull, tolker tvetydighet og trekker konklusjoner — ofte raskere enn du rekker å merke det.",
    mer: "Kognitiv atferdsterapi, utviklet av Aaron Beck, viser at automatiske tanker — de som bare dukker opp uten at du velger dem — ofte er farget av tidligere erfaringer. 'De liker meg ikke', 'jeg rotet det til', 'dette går galt' kan føles som fakta, men er egentlig tolkninger.\n\nÅ sjekke bevisene er ikke det samme som å tenke positivt. Det handler om å stille spørsmål: Hva vet jeg faktisk? Hva antar jeg? Hva ville en nøytral observatør sett?\n\nDette er kjernen i modulen for sosial etterreaksjon og skam i appen — ikke for å avfeie følelsene, men for å se situasjonen litt klarere.",
  },
  {
    id: "identitet",
    tittel: "Å finne seg selv",
    kort: "Mange av oss har lært å tilpasse oss så godt at vi har mistet kontakten med hvem vi egentlig er. Ikke fordi vi er falske — men fordi tilpasning en gang var nødvendig.",
    mer: "Aksept- og forpliktelsesterapi (ACT) skiller mellom det observerende selvet og tankene og følelsene vi har. Du er ikke angsten din. Du er ikke kritikeren din. Du er den som legger merke til dem.\n\nIdentitet handler ikke om å finne et fast svar på hvem du er — det handler om å bli kjent med hva som faktisk betyr noe for deg, og å leve mer i tråd med det.\n\nSpørsmålet 'hvem er du når du er rolig?' er ikke et spørsmål du svarer på én gang. Det er noe du utforsker over tid — og det er akkurat det identitetsmodulen i appen inviterer deg til.",
  },
];

const Bakgrunn = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

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
        marginBottom: "8px",
      }}>
        Tankene bak
      </h1>

      <p style={{
  fontFamily: "'Nunito', sans-serif",
  fontSize: "15px",
  color: "#5E6B5A",
  lineHeight: 1.8,
  marginBottom: "32px",
}}>
  Vi laget denne appen fordi vi selv har kjent på det — å ha mye inni seg, men ingen god plass å legge det. Det som er her er ikke et kurs eller en manual. Det er bakgrunnen for valgene vi tok — for deg som er nysgjerrig på hvorfor ting er lagt opp slik de er.
</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {temaer.map((tema) => (
          <div
            key={tema.id}
            style={{
              background: "#F9FAF8",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #DFE5DC",
            }}
          >
            <h2 style={{
              fontFamily: "'Lora', serif",
              fontSize: "18px",
              color: "#2D4A3E",
              fontWeight: 400,
              margin: "0 0 10px 0",
            }}>
              {tema.tittel}
            </h2>

            <p style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "14px",
              color: "#5E6B5A",
              lineHeight: 1.8,
              margin: 0,
            }}>
              {tema.kort}
            </p>

            {expanded === tema.id && (
              <div style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #DFE5DC",
              }}>
                {tema.mer.split("\n\n").map((avsnitt, i) => (
                  <p key={i} style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: "14px",
                    color: "#5E6B5A",
                    lineHeight: 1.8,
                    margin: "0 0 12px 0",
                  }}>
                    {avsnitt}
                  </p>
                ))}
              </div>
            )}

            <button
              onClick={() => setExpanded(expanded === tema.id ? null : tema.id)}
              style={{
                background: "none",
                border: "none",
                fontFamily: "'Nunito', sans-serif",
                fontSize: "13px",
                color: "#2D4A3E",
                cursor: "pointer",
                padding: "8px 0 0 0",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {expanded === tema.id ? "Vis mindre" : "Les mer"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bakgrunn;
