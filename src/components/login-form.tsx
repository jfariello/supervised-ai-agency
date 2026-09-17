import { KeyRound } from "lucide-react";
import { loginWithPassword } from "@/app/login/actions";

export function LoginForm({ error }: { error?: string }) {
  return (
    <form action={loginWithPassword} className="panel login-panel">
      <div className="panel-header">
        <h2>Password de acceso</h2>
        <KeyRound size={18} />
      </div>
      <div className="panel-body form-grid">
        <div className="field full">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
        </div>
        {error ? <p className="muted full">Password incorrecto.</p> : null}
        <button className="button full" type="submit">
          Ingresar
        </button>
      </div>
    </form>
  );
}
