import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(usuario, contrasena);
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center sm:justify-end overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(rgba(5,10,20,0.12),rgba(5,10,20,0.12)),
          url("/bg-login1.webp")
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="animate-fade-in">
        <div
          className="
            w-full max-w-[460px] mx-4 my-8
            sm:mr-[7vw] sm:ml-auto sm:mx-0
            rounded-[26px] border border-white/70
            p-[44px_46px] max-sm:p-[34px_26px]
            animate-breathe hover:[animation-play-state:paused]
          "
        style={{
          backgroundColor: "rgba(255,255,255,0.96)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
        }}
      >
        {/* Title */}
        <h1 className="m-0 text-center text-[34px] max-sm:text-[28px] font-extrabold tracking-tight text-[#111827]">
          Iniciar sesión
        </h1>
        <p className="mt-[10px] mb-[34px] text-center text-[15px] text-[#667085]">
          Accede a tu plataforma de gestión de rutas
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Usuario */}
          <div className="mb-5">
            <label className="block mb-2 text-[13px] font-bold text-[#344054]">
              Usuario o correo
            </label>
            <div
              className="flex items-center h-[52px] px-[15px] gap-3 border rounded-xl bg-white transition-all duration-200"
              style={{ borderColor: "#d8dee8" }}
              onFocus={(e) => {
                const wrapper = e.currentTarget;
                wrapper.style.borderColor = "#ef1c25";
                wrapper.style.boxShadow = "0 0 0 4px rgba(239,28,37,0.12)";
              }}
              onBlur={(e) => {
                const wrapper = e.currentTarget;
                wrapper.style.borderColor = "#d8dee8";
                wrapper.style.boxShadow = "none";
              }}
            >
              <Mail className="h-5 w-5 shrink-0 text-[#667085]" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="nombre@ejemplo.com"
                className="w-full border-0 outline-none bg-transparent text-[15px] text-[#111827] placeholder:text-[#98a2b3]"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="mb-5">
            <label className="block mb-2 text-[13px] font-bold text-[#344054]">
              Contraseña
            </label>
            <div
              className="flex items-center h-[52px] px-[15px] gap-3 border rounded-xl bg-white transition-all duration-200"
              style={{ borderColor: "#d8dee8" }}
              onFocus={(e) => {
                const wrapper = e.currentTarget;
                wrapper.style.borderColor = "#ef1c25";
                wrapper.style.boxShadow = "0 0 0 4px rgba(239,28,37,0.12)";
              }}
              onBlur={(e) => {
                const wrapper = e.currentTarget;
                wrapper.style.borderColor = "#d8dee8";
                wrapper.style.boxShadow = "none";
              }}
            >
              <Lock className="h-5 w-5 shrink-0 text-[#667085]" />
              <input
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                className="w-full border-0 outline-none bg-transparent text-[15px] text-[#111827] placeholder:text-[#98a2b3]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="border-0 bg-transparent shrink-0 text-[#667085] hover:text-[#111827] cursor-pointer transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mantener sesión */}
          <div className="flex items-center gap-[10px] mt-[6px] mb-6">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 accent-[#ef1c25]"
            />
            <label htmlFor="remember" className="text-[14px] text-[#475467] cursor-pointer select-none">
              Mantener sesión abierta
            </label>
          </div>

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] border-0 rounded-xl bg-[#ef1c25] text-white text-[16px] font-bold cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ boxShadow: "0 12px 26px rgba(239,28,37,0.28)" }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = "#d9141d";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ef1c25";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>

          {/* Olvidaste contraseña */}
          <a
            href="#"
            className="block mt-6 text-center text-[14px] font-bold text-[#ef1c25] no-underline hover:underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>

          {/* Divider */}
          <div className="h-[1px] bg-[#eaecf0] mt-[30px] mb-[18px]" />

          {/* Footer */}
          <p className="text-center text-[13px] text-[#667085]">
            Desarrollado por <strong className="text-[#111827]">Grupo Sulort Tech S.A.C</strong>
          </p>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Login;
