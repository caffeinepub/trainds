import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Map as MapIcon, Shield, Train, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
      queryClient.clear();
    } catch (error: any) {
      if (error?.message === "User is already authenticated") {
        // Already authenticated
      } else {
        console.error("Login error:", error);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.12 0.025 250) 0%, oklch(0.16 0.03 245) 50%, oklch(0.12 0.025 250) 100%)",
      }}
    >
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(oklch(0.73 0.14 186) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.14 186 / 20%) 0%, oklch(0.73 0.14 186 / 30%) 100%)",
                border: "2px solid oklch(0.73 0.14 186 / 40%)",
              }}
            >
              <Train className="h-8 w-8 text-teal" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight">
            Trainds
          </h1>
          <p className="text-muted-foreground">
            Mumbai's Intelligent Train Assistant
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: Zap, text: "ML Delay Prediction", color: "text-teal" },
            {
              icon: MapIcon,
              text: "Smart Journey Planner",
              color: "text-blue-400",
            },
            { icon: Shield, text: "Emergency SOS", color: "text-red-400" },
            {
              icon: Train,
              text: "Live Train Tracking",
              color: "text-orange-400",
            },
          ].map(({ icon: Icon, text, color }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 rounded-xl p-3"
              style={{
                background: "oklch(1 0 0 / 4%)",
                border: "1px solid oklch(1 0 0 / 8%)",
              }}
            >
              <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
              <span className="text-xs text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.19 0.03 245) 0%, oklch(0.17 0.025 248) 100%)",
            border: "1px solid oklch(1 0 0 / 10%)",
            boxShadow: "0 20px 60px oklch(0 0 0 / 50%)",
          }}
        >
          <h2 className="text-xl font-bold text-foreground mb-2">
            Welcome, Commuter
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in with Internet Identity to access your personalized
            dashboard, save routes, and get real-time alerts.
          </p>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="login.primary_button"
            style={{
              background: isLoggingIn
                ? undefined
                : "linear-gradient(135deg, oklch(0.65 0.14 186) 0%, oklch(0.75 0.16 186) 100%)",
              color: "oklch(0.12 0.025 248)",
              boxShadow: "0 4px 20px oklch(0.73 0.14 186 / 30%)",
            }}
          >
            {isLoggingIn ? (
              <>
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              "Sign In with Internet Identity"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Powered by the Internet Computer · No passwords required
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Built for{" "}
          <span className="text-teal">
            Mumbai's 7.5 million daily commuters
          </span>
        </p>
      </div>
    </div>
  );
}
