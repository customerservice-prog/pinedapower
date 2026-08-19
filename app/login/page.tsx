import { COLORS, RADIUS, SHADOW } from "../components/theme";

type LoginPageProps = {
  searchParams: { from?: string; error?: string };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const from = searchParams?.from ?? "/";
  const hasError = searchParams?.error === "1";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.background,
        color: COLORS.textPrimary,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: 16,
      }}
    >
      <form
        method="POST"
        action="/api/auth/login"
        style={{
          width: 340,
          padding: 32,
          borderRadius: RADIUS.lg,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          boxShadow: SHADOW.panel,
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 4, fontWeight: 600 }}>
          My Digital Life
        </h1>
        <p style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 24 }}>
          Private vault. Sign in to continue.
        </p>

        <input type="hidden" name="from" value={from} />

        <label
          htmlFor="password"
          style={{ display: "block", fontSize: 13, marginBottom: 6 }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoFocus
          required
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
            background: COLORS.inputBackground,
            color: COLORS.textPrimary,
            marginBottom: 16,
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        {hasError && (
          <p style={{ color: COLORS.danger, fontSize: 13, marginBottom: 12 }}>
            Incorrect password. Please try again.
          </p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: COLORS.accent,
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
