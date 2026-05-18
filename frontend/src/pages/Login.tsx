import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex min-h-screen w-full bg-[#121212]">
      {/* Left: Background Image - Desktop only */}
      <div 
        className="hidden md:block md:w-1/2 lg:w-[55%] bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url("/login-bg.png")' }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Right: Login Form - White background */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white">
        <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-500 space-y-8">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <img 
              src="/logo.png" 
              alt="FleetOps" 
              className="h-44 w-37 object-contain"
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Usuario o Email
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <Input 
                  id="username" 
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="pl-11 h-12 rounded-xl bg-zinc-50 border-zinc-200 transition-colors focus:bg-white focus:ring-primary/20 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Contraseña
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input 
                  id="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl bg-zinc-50 border-zinc-200 transition-colors focus:bg-white focus:ring-primary/20 text-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-1">
              <div className="flex items-center space-x-2.5">
                <Checkbox id="remember" className="border-zinc-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <Label htmlFor="remember" className="text-sm font-medium leading-none text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                  Mantener sesión abierta
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-semibold shadow-md bg-primary hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </Button>

            <div className="text-center pt-3">
              <a href="#" className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </form>
          
          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Desarrollado por <span className="font-bold text-foreground">Grupo Sulort Tech S.A.C</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
