import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button className="button secondary" type="submit">
        <LogOut size={16} /> Salir
      </button>
    </form>
  );
}
