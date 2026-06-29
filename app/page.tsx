import PageShell from "@/components/PageShell";
import { SNIPPETS } from "@/lib/snippets";

export default function Home() {
  return <PageShell builtins={SNIPPETS} />;
}
