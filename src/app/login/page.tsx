import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { isSimpleAuthed } from "@/lib/simple-auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isSimpleAuthed()) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="login-page">
      <section className="login-copy">
        <div className="brand" style={{ marginBottom: 22 }}>
          <div className="brand-mark">AI</div>
          <div>
            <div className="brand-title">Agencia IA</div>
            <div className="brand-subtitle">supervised growth ops</div>
          </div>
        </div>
        <div className="eyebrow">Acceso privado</div>
        <h1>Centro operativo para una agencia IA supervisada</h1>
        <p className="muted" style={{ marginTop: 12 }}>
          Ingresá con el password privado de la v1.
        </p>
      </section>
      <LoginForm error={error} />
    </main>
  );
}
