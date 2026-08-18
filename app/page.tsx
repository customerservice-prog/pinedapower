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
      <h1>My Digital Life</h1>
      <p>Everything that matters, in one place.</p>
      <p>
        This is a minimal Phase 1 deployment shell confirming the app builds
        and runs on Railway. The full vault application (authentication,
        database, object storage, photo and document engines) has not been
        built yet.
      </p>
    </main>
  );
}
