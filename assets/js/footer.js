export function renderFooter() {
  const spielzugLabel = document.body?.dataset?.spielzugLabel || 'Spielzug';
  const currentStep   = Number(document.body?.dataset?.stepCurrent || 1);
  const totalSteps    = Number(document.body?.dataset?.stepTotal   || 20);

  const displaySteps = Math.min(totalSteps, 30);
  let progressHtml = '';
  for (let i = 1; i <= displaySteps; i++) {
    progressHtml += `<span class="progress-box${i <= currentStep ? ' active' : ''}"></span>`;
  }

  return `
    <div class="footer-shell">
      <footer class="footer-inner gradient-main footer-border rounded-xl flex items-stretch overflow-hidden" style="height:75px;">

        <!-- ← Zurück -->
        <button id="nav-back" class="footer-btn flex items-center justify-center flex-shrink-0" style="width:70px;">
          <img src="../assets/pictos/back.svg" alt="Zurück" style="height:34px;width:34px;object-fit:contain;" />
        </button>

        <!-- Handbuch -->
        <button id="nav-handbuch" type="button"
          class="footer-btn footer-divider bg-transparent border-0 flex items-center justify-center flex-shrink-0"
          style="width:70px;">
          <img src="../assets/pictos/handbuch.svg" alt="Handbuch" style="height:32px;width:32px;object-fit:contain;" />
        </button>

        <!-- Wirkungsgefüge -->
        <button id="nav-wirkungen" type="button"
          class="footer-btn footer-divider bg-transparent border-0 flex items-center justify-center flex-shrink-0"
          style="width:70px;">
          <img src="../assets/pictos/wirkung.svg" alt="Wirkungsgefüge" style="height:32px;width:32px;object-fit:contain;" />
        </button>

        <!-- Spielzug + Fortschritt -->
        <div class="footer-divider flex items-center flex-1 min-w-0" style="padding:0 20px;gap:12px;">
          <span class="nav-label flex-shrink-0" style="font-size:0.85rem;">${spielzugLabel}</span>
          <div class="flex items-center flex-wrap" style="gap:1px;">
            ${progressHtml}
          </div>
        </div>

        <!-- Bank -->
        <button id="nav-bank" type="button"
          class="footer-btn footer-divider bg-transparent border-0 flex items-center justify-center flex-shrink-0"
          style="width:70px;">
          <img src="../assets/pictos/bank.svg" alt="Bank" style="height:32px;width:32px;object-fit:contain;" />
        </button>

        <!-- Ereignis -->
        <button id="nav-ereignis"
          class="footer-btn footer-divider flex items-center justify-center flex-shrink-0"
          style="width:70px;">
          <img src="../assets/pictos/ereignis.svg" alt="Ereignis" style="height:32px;width:32px;object-fit:contain;" />
        </button>

        <!-- → Weiter -->
        <button id="nav-next" class="footer-btn footer-divider flex items-center justify-center flex-shrink-0" style="width:70px;">
          <img src="../assets/pictos/next.svg" alt="Weiter" style="height:34px;width:34px;object-fit:contain;" />
        </button>

      </footer>
    </div>
  `;
}
