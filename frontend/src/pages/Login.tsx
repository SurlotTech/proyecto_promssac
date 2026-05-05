import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("auth_token", "true");
      navigate("/");
    }, 1500);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#121212]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/login-bg.png")' }}
      >
        {/* Dark overlay to make the card pop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] ring-1 ring-white/30">
          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="mb-8 flex flex-col items-center justify-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
                <Truck className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  FleetOps
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  PROMSSAC
                </p>
              </div>
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Accede a tu cuenta
              </h2>
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
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-11 pr-11 h-12 rounded-xl bg-zinc-50 border-zinc-200 transition-colors focus:bg-white focus:ring-primary/20 text-foreground font-mono"
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
          </div>
          
          <div className="bg-zinc-100/50 px-8 py-5 border-t border-zinc-200/50 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-bold text-foreground">Promssac</span> — <a href="#" className="font-medium text-foreground hover:underline">Términos y condiciones</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
