import TrainerApp from "@/components/TrainerApp";
import { SNIPPETS } from "@/lib/snippets";

const ASCII = String.raw`
  ____ _  __   ______  _   _
 / ___| | \ \ / /  _ \| | | |
| |  _| |  \ V /| |_) | |_| |
| |_| | |___| | |  __/|  _  |
 \____|_____|_| |_|   |_| |_|
`;

const FEATURES = [
  {
    glyph: "</>",
    title: "Real Code",
    body: "Type real LeetCode-style solutions, not random sentences.",
  },
  {
    glyph: ">_",
    title: "Smart Feedback",
    body: "Instant character-by-character feedback to help you improve faster.",
  },
  {
    glyph: "|->",
    title: "Auto Indent",
    body: "Press Enter and we'll handle the indentation for you.",
  },
  {
    glyph: "~/",
    title: "Revise As You Go",
    body: "Finish a problem and see the core idea behind the solution.",
  },
];

export default function Home() {
  return (
    <main className="page">
      <div className="window">
        <div className="winBar">
          <span className="dot dot-red" />
          <span className="dot dot-amber" />
          <span className="dot dot-green" />
          <nav className="winNav">
            <span className="prompt">user@glyph:~$</span>
            <span className="navItem">[1] Practice</span>
            <span className="navItem">[2] Problems</span>
            <span className="navItem">[3] Stats</span>
            <span className="navItem">[4] About</span>
          </nav>
        </div>

        <header className="hero">
          <pre className="ascii" aria-label="Glyph">
            {ASCII}
          </pre>
          <p className="heroLead">
            <span className="accent">&gt;</span> A terminal typing trainer for real
            developers<span className="blink">_</span>
          </p>
          <p className="heroSub">
            Practice typing LeetCode-style code solutions. Improve your speed,
            accuracy, and coding fluency one keystroke at a time.
          </p>
        </header>

        <TrainerApp builtins={SNIPPETS} />

        <section className="featureGrid">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <span className="featureGlyph">{f.glyph}</span>
              <span className="featureTitle">{f.title}</span>
              <span className="featureBody">{f.body}</span>
            </div>
          ))}
        </section>

        <footer className="footer">
          <span className="prompt">user@glyph:~$</span> esc to restart ·
          tab+enter to skip · indent is automatic<span className="blink">&#9612;</span>
        </footer>
      </div>
    </main>
  );
}
