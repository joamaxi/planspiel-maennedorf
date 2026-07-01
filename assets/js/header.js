export function renderHeader() {
  const teamNumber = localStorage.getItem('teamNumber') || '';
  const rundeNumber = localStorage.getItem('rundeNumber') || '';
  const teamLabel  = teamNumber ? `Team ${teamNumber}` : '';
  const rundeLabel = rundeNumber ? `Runde ${rundeNumber}` : '';

  return `
    <header style="
      width: 100%;
      height: 55px;
      background: linear-gradient(to bottom, #f0f6fc 0%, #dcedf8 85%, #b8d6ee 100%);
      border-bottom: 1px solid #a0c8e8;
      display: flex;
      justify-content: center;
      align-items: stretch;
    ">
      <div style="
        width: 100%;
        max-width: 1024px;
        padding: 0 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">

        <!-- Links: Neosight Logo (Klick → Check-Seite) -->
        <img
          id="neosight-logo"
          src="../assets/logos/neosight-logo.png"
          alt="Neosight Logo"
          style="height: 25px; width: auto; display: block; flex-shrink: 0; cursor: pointer;"
        />

        <!-- Mitte: Team + Runde -->
        <span id="header-team-label" style="
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-accent);
          letter-spacing: 0.03em;
          display: flex;
          align-items: center;
          gap: 18px;
        ">
          <span style="font-weight:400; color:#7aabcc;">${teamLabel}</span>
          <span id="header-runde-label" style="font-weight:400; color:#7aabcc;">${rundeLabel}</span>
        </span>

        <!-- Rechts: Spital Bülach Logo -->
        <img
          id="spital-logo"
          src="../assets/logos/spital-buelach-logo.png"
          alt="Spital Bülach"
          style="height: 15px; width: auto; display: block; flex-shrink: 0;"
        />

      </div>
    </header>
  `;
}
