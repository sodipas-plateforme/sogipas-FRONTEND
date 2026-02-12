import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginResponse {
  success: boolean;
  requiresOtp: boolean;
  user: {
    id: number;
    email: string;
    role: string;
  };
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError(null);
    
    if (value.length > 0) {
      setIsEmailValid(validateEmail(value));
    } else {
      setIsEmailValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide");
      setIsEmailValid(false);
      return;
    }

    if (!password) {
      setError("Veuillez entrer votre mot de passe");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3002/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        sessionStorage.setItem("pendingAuth", JSON.stringify({
          email,
          userId: data.user.id,
          role: data.user.role,
        }));

        if (data.requiresOtp) {
          navigate("/verify-otp");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      setError("Impossible de se connecter au serveur. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1F3A5F] overflow-hidden">
        {/* Content */}
        <div className="relative z-10 flex flex-col w-full h-full p-12 text-white">
          {/* Logo */}
          <div className="mb-auto flex items-center gap-3 pt-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F9C74F]">
              <Package className="h-6 w-6 text-[#1F3A5F]" />
            </div>
            <span className="text-xl font-bold tracking-tight">SODIPAS</span>
          </div>
          
          {/* Welcome Text - Aligned with form */}
          <div className="mt-20">
            <h2 className="text-5xl font-bold mb-4">Bienvenue sur SODIPAS</h2>
            <p className="text-slate-300 text-xl leading-relaxed max-w-md">
              Plateforme de gestion logistique & commerciale.<br/>
              Gérez efficacement vos opérations.
            </p>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-auto flex items-center gap-6 text-base text-slate-400 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#2E7D32]" />
              <span>Connexion sécurisée</span>
            </div>
            <div className="h-4 w-px bg-slate-600" />
            <span>© 2026 SODIPAS</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F3A5F] shadow-lg shadow-primary/25">
                <Package className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight">SODIPAS</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Se connecter</h1>
            <p className="text-muted-foreground">Veuillez entrer vos identifiants pour accéder à votre espace</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ex: nom@entreprise.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                  className={`pl-11 h-12 text-base transition-all ${
                    isEmailValid === false
                      ? "border-red-300 focus-visible:ring-red-500"
                      : isEmailValid === true
                      ? "border-green-300 focus-visible:ring-green-500"
                      : ""
                  }`}
                  autoComplete="email"
                />
                {isEmailValid === true && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Mot de passe
                </Label>
                <a href="#" className="text-sm text-[#1F3A5F] hover:underline font-medium">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-11 h-12 text-base"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium gap-2 shadow-lg hover:shadow-xl transition-all mt-6"
              style={{ backgroundColor: '#1F3A5F' }}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{" "}
              <a href="#" className="text-[#1F3A5F] font-medium hover:underline">
                Créer un compte
              </a>
            </p>
          </div>

          {/* Mobile Trust Indicators */}
          <div className="mt-8 lg:hidden flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#2E7D32]" />
              <span>Connexion sécurisée</span>
            </div>
            <span>© 2024 SODIPAS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
