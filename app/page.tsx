export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "4rem 2rem",
        maxWidth: 640,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
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
              fontSize: 13,
            }}
          >
            Sign out
          </button>
        </form>
      </div>
      <p>Everything that matters, in one place.</p>
      <p>
        This is a private vault under active construction. Single-user
        authentication and a PostgreSQL-backed data layer (folders, items,
        assets, tags) are live. Private object storage and the photo and
        document engines have not been built yet.
      </p>
    </main>
  );
}
