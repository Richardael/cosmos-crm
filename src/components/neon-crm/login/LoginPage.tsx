import { useEffect, useRef, useState } from "react";
import { Form, required, useLogin, useNotify, useTranslate } from "ra-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/admin/text-input";
import { Notification } from "@/components/admin/notification";
import { useConfigurationContext } from "@/components/neon-crm/root/ConfigurationContext.tsx";
import { SSOAuthButton } from "./SSOAuthButton";

export const LoginPage = (props: { redirectTo?: string }) => {
  const { googleWorkplaceDomain, disableEmailPasswordAuthentication } =
    useConfigurationContext();
  const { redirectTo } = props;
  const [loading, setLoading] = useState(false);
  const hasDisplayedRecoveryNotification = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldNotify = searchParams.get("passwordRecoveryEmailSent") === "1";

    if (!shouldNotify || hasDisplayedRecoveryNotification.current) {
      return;
    }

    hasDisplayedRecoveryNotification.current = true;
    notify("crm.auth.recovery_email_sent", {
      type: "success",
      messageArgs: {
        _: "Si eres usuario registrado, recibirás pronto un correo de recuperación.",
      },
    });

    searchParams.delete("passwordRecoveryEmailSent");
    const nextSearch = searchParams.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate, notify]);

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    login(values, redirectTo)
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        notify(
          typeof error === "string"
            ? error
            : typeof error === "undefined" || !error.message
              ? "ra.auth.sign_in_error"
              : error.message,
          {
            type: "error",
            messageArgs: {
              _:
                typeof error === "string"
                  ? error
                  : error && error.message
                    ? error.message
                    : undefined,
            },
          },
        );
      });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: `linear-gradient(rgba(245,197,24,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(245,197,24,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="w-full max-w-sm px-6 space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div
            style={{
              filter: "drop-shadow(0 0 20px rgba(245,197,24,0.35))",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 32 32"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="6" fill="#111111" />
              <path d="M14 4L7 18H13L9 28L23 14H16L19 4H14Z" fill="#F5C518" />
            </svg>
          </div>
          <div className="text-center">
            <div className="flex items-baseline gap-1 justify-center">
              <span
                style={{
                  fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#fafafa",
                  letterSpacing: "-0.03em",
                }}
              >
                NEON
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#f5c518",
                  letterSpacing: "-0.03em",
                }}
              >
                CRM
              </span>
            </div>
            <p
              style={{
                color: "#a0a0a0",
                fontSize: "0.8rem",
                marginTop: "0.25rem",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Tu pipeline. Tu velocidad. Tus reglas.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div
          style={{
            backgroundColor: "#111111",
            border: "1px solid #2e2e2e",
            borderRadius: "0.75rem",
            padding: "2rem",
          }}
        >
          {disableEmailPasswordAuthentication ? null : (
            <Form className="space-y-5" onSubmit={handleSubmit}>
              <TextInput
                label={translate("ra.auth.email")}
                source="email"
                type="email"
                validate={required()}
              />
              <TextInput
                label={translate("ra.auth.password")}
                source="password"
                type="password"
                validate={required()}
              />
              <Button
                type="submit"
                className="w-full cursor-pointer font-bold"
                disabled={loading}
                style={{
                  backgroundColor: "#f5c518",
                  color: "#0a0a0a",
                  border: "none",
                  fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
                  fontWeight: 700,
                }}
              >
                {loading ? "Iniciando sesión..." : translate("ra.auth.sign_in")}
              </Button>
            </Form>
          )}

          {googleWorkplaceDomain ? (
            <div className="mt-4">
              <SSOAuthButton className="w-full" domain={googleWorkplaceDomain}>
                {translate("crm.auth.sign_in_google_workspace", {
                  _: "Iniciar sesión con Google Workspace",
                })}
              </SSOAuthButton>
            </div>
          ) : null}

          {disableEmailPasswordAuthentication ? null : (
            <Link
              to="/forgot-password"
              className="block text-sm text-center mt-4 hover:underline"
              style={{ color: "#a0a0a0" }}
            >
              {translate("ra-supabase.auth.forgot_password", {
                _: "¿Olvidaste tu contraseña?",
              })}
            </Link>
          )}
        </div>
      </div>
      <Notification />
    </div>
  );
};
