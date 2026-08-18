export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 2rem", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>My Digital Life</h1>
        <form method="POST" action="/api/auth/logout">
          <button
            type="submit"
            style={{
              background: "none",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Sign out
          </button>
        </form>
      </div>
      <p>Everything that matters, in one place.</p>
      <p>
        This is a private vault under active construction. Single-user authentication, a
        PostgreSQL-backed data layer (folders, items, assets, tags), and private object
        storage with a working upload/download pipeline are live. The photo and document
        processing engines (thumbnails, previews, OCR) have not been built yet.
      </p>
      <a
        href="/vault"
        style={{
          display: "inline-block",
          marginTop: 12,
          padding: "8px 16px",
          border: "1px solid #222",
          borderRadius: 6,
          textDecoration: "none",
          color: "#222",
          fontSize: 14,
        }}
      >
        Open vault →
      </a>
    </main>
  );
}
