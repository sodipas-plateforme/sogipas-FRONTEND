import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Loader2, Shield, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";

interface VerifyOtpResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
}

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingAuth, setPendingAuth] = useState<{
    email: string;
    userId: number;
    role: string;
  } | null>(null);

  useEffect(() => {
    // Check if user came from login page
    const stored = sessionStorage.getItem("pendingAuth");
    if (!stored) {
      navigate("/login");
      return;
    }
    setPendingAuth(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    // Countdown timer for resend
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);

    // Auto-submit when OTP is complete
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleVerify = async (otpValue: string = otp) => {
    if (otpValue.length !== 6) {
      setError("Veuillez entrer le code complet à 6 chiffres");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3002/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingAuth?.email,
          otp: otpValue,
        }),
      });

      const data: VerifyOtpResponse = await response.json();

      if (data.success && data.token && data.user) {
        // Use auth context to login
        login(data.token, data.user);
        
        // Clear pending auth
        sessionStorage.removeItem("pendingAuth");
        
        // Navigate to dashboard
        navigate("/");
      } else {
        setError(data.message || "Code invalide. Veuillez réessayer.");
        setOtp("");
      }
    } catch (err) {
      setError("Impossible de vérifier le code. Veuillez réessayer.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !pendingAuth) return;

    setIsResending(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3002/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: pendingAuth.email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendCooldown(60); // 60 seconds cooldown
        setOtp("");
      } else {
        setError(data.message || "Impossible de renvoyer le code");
      }
    } catch (err) {
      setError("Erreur lors de l'envoi du code");
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    sessionStorage.removeItem("pendingAuth");
    navigate("/login");
  };

  const maskedEmail = pendingAuth?.email
    ? pendingAuth.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1F3A5F]/3 via-transparent to-[#1F3A5F]/3 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F8FAFC]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* OTP Card */}
        <div 
          className="w-full p-8 rounded-2xl border border-[#E5E7EB] shadow-xl bg-white"
          style={{ boxShadow: '0 4px 6px -1px rgba(31, 58, 95, 0.1), 0 2px 4px -2px rgba(31, 58, 95, 0.1)' }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#1F3A5F' }}
              >
                <Package className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1F2937] tracking-tight">SODIPAS</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-xl font-semibold text-[#1F2937]">
              Vérification de sécurité
            </h1>
            <p className="text-[#6B7280]">
              Entrez le code à 6 chiffres envoyé à{" "}
              <span className="font-medium text-[#1F3A5F]">{maskedEmail}</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[#FDECEA] border border-[#FFCDD2] text-[#C62828] text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot 
                  index={0} 
                  className="h-14 w-12 text-xl font-semibold border-2 border-[#E5E7EB] bg-[#F8FAFC]" 
                />
                <InputOTPSlot 
                  index={1} 
                  className="h-14 w-12 text-xl font-semibold border-2 border-[#E5E7EB] bg-[#F8FAFC]" 
                />
                <InputOTPSlot 
                  index={2} 
                  className="h-14 w-12 text-xl font-semibold border-2 border-[#E5E7EB] bg-[#F8FAFC]" 
                />
                <InputOTPSlot 
                  index={3} 
                  className="h-14 w-12 text-xl font-semibold border-2 border-[#E5E7EB] bg-[#F8FAFC]" 
                />
                <InputOTPSlot 
                  index={4} 
                  className="h-14 w-12 text-xl font-semibold border-2 border-[#E5E7EB] bg-[#F8FAFC]" 
                />
                <InputOTPSlot 
                  index={5} 
                  className="h-14 w-12 text-xl font-semibold border-2 border-[#E5E7EB] bg-[#F8FAFC]" 
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            className="w-full h-12 text-base font-semibold gap-2 rounded-xl transition-all"
            style={{ 
              backgroundColor: '#1F3A5F',
              color: 'white'
            }}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vérification...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Vérifier le code
              </>
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center mt-6">
            {resendCooldown > 0 ? (
              <p className="text-sm text-[#6B7280]">
                Renvoyer le code dans{" "}
                <span className="font-medium text-[#1F2937]">{resendCooldown}s</span>
              </p>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-[#1F3A5F] hover:text-[#1F3A5F]/80 hover:bg-[#E6EEF6]"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renvoyer le code
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Info Message */}
          <div 
            className="flex items-start gap-3 p-4 rounded-lg mt-6"
            style={{ backgroundColor: '#E6EEF6', border: '1px solid rgba(31, 58, 95, 0.1)' }}
          >
            <Shield className="h-5 w-5 text-[#1F3A5F] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Ce code expire dans 10 minutes. Si vous ne l'avez pas reçu, vérifiez vos spams ou demandez un nouveau code.
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#9CA3AF]">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#2E7D32]" />
            <span>Connexion sécurisée</span>
          </div>
          <div className="h-4 w-px bg-[#E5E7EB]" />
          <span>© 2024 SODIPAS</span>
        </div>
      </div>
    </div>
  );
}
