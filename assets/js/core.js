import { renderHeader } from './header.js';
import { renderFooter } from './footer.js';

/* ─── Letzten Screen merken (für "Weiterspielen" auf index.html) ────────────── */
localStorage.setItem('lastScreen', window.location.pathname);

/* ─── Header ──────────────────────────────────────────────────────────────── */
const headerTarget = document.getElementById('app-header');
if (headerTarget) {
  headerTarget.innerHTML = renderHeader();
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
const footerTarget = document.getElementById('app-footer');
if (footerTarget) {
  footerTarget.innerHTML = renderFooter();

  let savedFooterHTML = null;

  /* -- Close-Bar: tauscht Footer-Inhalt gegen ✕ / Close ─────────────────── */
  function showCloseBar(closeFn) {
    const inner = footerTarget.querySelector('.footer-inner');
    if (!inner) return;
    savedFooterHTML = inner.innerHTML;
    inner.innerHTML = `
      <div id="overlay-close-bar" style="
        width:100%; height:100%; display:flex; align-items:center;
        justify-content:center; gap:10px; cursor:pointer; user-select:none;
      ">
        <span style="font-size:1.6rem; color:var(--color-accent); font-weight:700; line-height:1;">&times;</span>
        <span style="font-size:0.95rem; color:var(--color-accent); font-weight:600; letter-spacing:0.5px;">Schliessen</span>
      </div>
    `;
    document.getElementById('overlay-close-bar').addEventListener('click', closeFn);
  }

  /* -- Footer wiederherstellen ────────────────────────────────────────────── */
  function restoreFooter() {
    if (savedFooterHTML === null) return;
    const inner = footerTarget.querySelector('.footer-inner');
    if (inner) inner.innerHTML = savedFooterHTML;
    savedFooterHTML = null;
    rebindFooterButtons();
  }
  window.__restoreFooter = restoreFooter;

  // rebindFooterButtons wird weiter unten definiert (vollständige Version mit Bank + Ereignis)

  /* ── Navigation ─────────────────────────────────────────────────────────── */
  function goBack() {
    const p = document.body.dataset.prev;
    if (p) window.location.href = p;
  }
  function goNext() {
    const n = document.body.dataset.next;
    if (!n) return;
    document.dispatchEvent(new CustomEvent('nav:next'));
    window.location.href = n;
  }

  const backBtn = document.getElementById('nav-back');
  const nextBtn = document.getElementById('nav-next');
  if (backBtn) backBtn.addEventListener('click', goBack);
  if (nextBtn) nextBtn.addEventListener('click', goNext);

  /* ── Handbuch ────────────────────────────────────────────────────────────── */
  const handbuchBtn = document.getElementById('nav-handbuch');
  const wirkungBtn  = document.getElementById('nav-wirkungen');

  /* Lookup-Map aus handbuch.json: spielzug → handbuch-Datei */
  let _handbuchMap = {};
  let _handbuchVerfuegbar = false;
  const _currentScreen = window.location.pathname.split('/').pop();

  function _applyHandbuchState() {
    const btn = document.getElementById('nav-handbuch');
    if (btn) btn.classList.toggle('disabled', !_handbuchVerfuegbar);
  }

  /* JSON laden (UTF-16LE mit BOM oder UTF-8) – gleiche Daten wie im Import (spz-00.html) */
  async function _fetchUTF16Json(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf   = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const isUtf16le = bytes[0] === 0xFF && bytes[1] === 0xFE;
    let text;
    if (isUtf16le) {
      text = new TextDecoder('utf-16le').decode(buf);
      if (text.startsWith('﻿')) text = text.slice(1);
    } else {
      text = new TextDecoder('utf-8').decode(buf);
    }
    return JSON.parse(text);
  }

  _fetchUTF16Json('../data/json/handbuch.json')
    .then(data => {
      (data.Handbuch || []).forEach(e => { _handbuchMap[e.spielzug] = e.handbuch; });
      _handbuchVerfuegbar = Object.keys(_handbuchMap).some(k => k === _currentScreen || k.startsWith(_currentScreen + ':'));
      _applyHandbuchState();
    })
    .catch(() => {});

  function _getHandbuchFile() {
    /* Für spz-25: Compound-Key mit aktiver ProjektNr */
    if (_currentScreen === 'spz-25.html') {
      const nr = localStorage.getItem('aktivProjektNr');
      if (nr) return _handbuchMap[`spz-25.html:${nr}`] || null;
      return null;
    }
    return _handbuchMap[_currentScreen] || document.body.dataset.handbuch || null;
  }

  /* Overlay + iframe in DOM injizieren */
  const handbuchOverlay = document.createElement('div');
  handbuchOverlay.id = 'handbuch-overlay';
  handbuchOverlay.className = 'app-overlay';
  handbuchOverlay.style.cssText = [
    'position:fixed','inset:0','background:rgba(0,0,0,0.55)',
    'display:none','align-items:center','justify-content:center','z-index:4000'
  ].join(';');
  handbuchOverlay.innerHTML =
    '<iframe id="handbuch-frame" src="" frameborder="0" ' +
    'style="width:100%;height:100%;border:none;background:transparent;"></iframe>' +
    '<button id="handbuch-close-btn" style="' +
      'position:absolute;top:14px;right:18px;z-index:10;' +
      'background:linear-gradient(to bottom,#f0f6fc 0%,#dcedf8 85%,#b8d6ee 100%);' +
      'border:1px solid #2575b0;border-radius:10px;' +
      'width:44px;height:44px;font-size:1.6rem;line-height:1;cursor:pointer;' +
      'color:#2575b0;box-shadow:0 2px 8px rgba(0,0,0,0.18);display:flex;' +
      'align-items:center;justify-content:center;' +
    '">&times;</button>';
  document.body.appendChild(handbuchOverlay);

  const _hbStyle = document.createElement('style');
  _hbStyle.textContent = '#handbuch-overlay.show{display:flex!important;}';
  document.head.appendChild(_hbStyle);

  /* X-Button verdrahten */
  document.getElementById('handbuch-close-btn').addEventListener('click', function() {
    closeHandbuch();
  });

  function closeHandbuch() {
    const ov = document.getElementById('handbuch-overlay');
    const fr = document.getElementById('handbuch-frame');
    if (ov) ov.classList.remove('show');
    if (fr) fr.src = '';
    if (handbuchBtn) handbuchBtn.classList.remove('active');
    const shell = document.querySelector('.footer-shell');
    if (shell) shell.style.display = '';
  }

  function openHandbuch() {
    const file = _getHandbuchFile();
    if (!file) return;
    const ov = document.getElementById('handbuch-overlay');
    const fr = document.getElementById('handbuch-frame');
    if (!ov || !fr) return;

    // Wirkungen-Overlay schliessen
    const wo = document.getElementById('wirkung-overlay');
    const wf = document.getElementById('wirkung-frame');
    if (wo) wo.classList.remove('show');
    if (wf) wf.src = '';
    if (wirkungBtn) wirkungBtn.classList.remove('active');

    if (ov.classList.contains('show')) {
      closeHandbuch();
    } else {
      fr.src = `handbuch.html?file=${encodeURIComponent(file)}`;
      ov.classList.add('show');
      if (handbuchBtn) handbuchBtn.classList.add('active');
      const shell = document.querySelector('.footer-shell');
      if (shell) shell.style.display = 'none';
    }
  }

  if (handbuchBtn) handbuchBtn.addEventListener('click', openHandbuch);

  /* ── Wirkungsgefüge ──────────────────────────────────────────────────────── */
  function closeWirkung() {
    const ov = document.getElementById('wirkung-overlay');
    const fr = document.getElementById('wirkung-frame');
    if (ov) ov.classList.remove('show');
    if (fr) {
      fr.src = '';
      fr.style.display = 'block';
      const wrap = fr.parentElement;
      if (wrap) {
        const sd = wrap.querySelector('.wirkung-svg-scroll');
        if (sd) sd.remove();
        wrap.style.overflow = '';
      }
    }
    if (wirkungBtn) wirkungBtn.classList.remove('active');
    restoreFooter();
  }

  function openWirkung() {
    const file = document.body.dataset.wirkung || '00-wirkungen.png';
    const from = encodeURIComponent(window.location.pathname.split('/').pop());
    window.location.href = `wirkungen.html?file=${encodeURIComponent(file)}&from=${from}`;
  }

  if (wirkungBtn) wirkungBtn.addEventListener('click', openWirkung);

  /* ── Bank ────────────────────────────────────────────────────────────────── */
  const bankBtn = document.getElementById('nav-bank');

  const bankOverlay = document.createElement('div');
  bankOverlay.id = 'bank-overlay';
  bankOverlay.className = 'app-overlay';
  bankOverlay.style.cssText = [
    'position:fixed','inset:0','background:rgba(0,0,0,0.45)',
    'display:none','align-items:center','justify-content:center','z-index:4000'
  ].join(';');
  bankOverlay.innerHTML =
    '<iframe id="bank-frame" src="" frameborder="0" ' +
    'style="width:100%;height:100%;border:none;background:transparent;"></iframe>';
  document.body.appendChild(bankOverlay);

  const _bankStyle = document.createElement('style');
  _bankStyle.textContent = '#bank-overlay.show{display:flex!important;}';
  document.head.appendChild(_bankStyle);

  function applyBankTransfer() {
    let current;
    try { current = JSON.parse(localStorage.getItem('bankValues')) || {}; } catch(e) { current = {}; }
    const totals  = _getLS('bankApplied') || { aufnahme: 0, rueckzahlung: 0 };

    const aufNeu   = Number(current.aufnahme)     || 0;
    const rueckNeu = Number(current.rueckzahlung) || 0;

    if (aufNeu === 0 && rueckNeu === 0) return;

    const bilanzData = _getLS('bilanzStart');
    if (bilanzData) {
      const arr    = bilanzData.Anfangsbilanz || bilanzData;
      const teamNr = Number(localStorage.getItem('teamNumber')) || 1;
      const idx    = arr[teamNr] !== undefined ? teamNr : (arr[teamNr-1] !== undefined ? teamNr-1 : 0);
      const entry  = arr[idx];
      if (entry && entry.Bilanz) {
        entry.Bilanz.FluessigeMittel = (Number(entry.Bilanz.FluessigeMittel) || 0) + aufNeu - rueckNeu;
        entry.Bilanz.Darlehen_Bank   = (Number(entry.Bilanz.Darlehen_Bank)   || 0) + aufNeu - rueckNeu;
        arr[idx] = entry;
        _setLS('bilanzStart', bilanzData.Anfangsbilanz ? { ...bilanzData, Anfangsbilanz: arr } : arr);
      }
    }

    const teamNr    = Number(localStorage.getItem('teamNumber')) || 1;
    const teamLabel = localStorage.getItem('klinikName') || `Team ${teamNr}`;
    const protokoll = _getLS('protokoll') || [];
    if (aufNeu !== 0) protokoll.push({
      zeit: new Date().toISOString(), spielzug: 'bank',
      aktion: 'Darlehen aufgenommen', von: 'Bank',
      nach: 'Flüssige Mittel', betrag: aufNeu, team: teamLabel
    });
    if (rueckNeu !== 0) protokoll.push({
      zeit: new Date().toISOString(), spielzug: 'bank',
      aktion: 'Darlehen zurückbezahlt', von: 'Flüssige Mittel',
      nach: 'Bank', betrag: rueckNeu, team: teamLabel
    });
    _setLS('protokoll', protokoll);

    _setLS('bankApplied', {
      aufnahme:    (Number(totals.aufnahme)    || 0) + aufNeu,
      rueckzahlung: (Number(totals.rueckzahlung) || 0) + rueckNeu
    });
    _setLS('bankValues', { aufnahme: 0, rueckzahlung: 0 });

    /* Rückzahlungs-Flag für diese Runde setzen */
    if (rueckNeu > 0) {
      const runde = localStorage.getItem('rundeNumber') || '1';
      localStorage.setItem(`bank_rueckzahlung_r${runde}`, 'true');
    }
  }

  function closeBank() {
    applyBankTransfer();
    bankOverlay.classList.remove('show');
    const fr = document.getElementById('bank-frame');
    if (fr) fr.src = '';
    if (bankBtn) bankBtn.classList.remove('active');
    restoreFooter();
  }
  window.closeBankOverlay = closeBank;

  function openBank() {
    const isOpen = bankOverlay.classList.contains('show');

    ['handbuch-overlay','wirkung-overlay','ereignis-overlay','hinweis-overlay'].forEach(id => {
      const o = document.getElementById(id); if (o) o.classList.remove('show');
    });
    ['handbuch-frame','wirkung-frame','ereignis-frame','hinweis-frame'].forEach(id => {
      const f = document.getElementById(id); if (f) f.src = '';
    });
    if (handbuchBtn) handbuchBtn.classList.remove('active');
    if (wirkungBtn)  wirkungBtn.classList.remove('active');
    if (ereignisBtn) ereignisBtn.classList.remove('active');

    if (isOpen) {
      closeBank();
    } else {
      const fr = document.getElementById('bank-frame');
      if (fr) fr.src = `bank.html?t=${Date.now()}`;
      bankOverlay.classList.add('show');
      if (bankBtn) bankBtn.classList.add('active');
      showCloseBar(closeBank);
    }
  }

  if (bankBtn) bankBtn.addEventListener('click', openBank);

  /* ── Hinweis (Auto-Popup) ─────────────────────────────────────────────────── */
  const hinweisOverlay = document.createElement('div');
  hinweisOverlay.id = 'hinweis-overlay';
  hinweisOverlay.className = 'app-overlay';
  hinweisOverlay.style.cssText = [
    'position:fixed','inset:0','background:rgba(0,0,0,0.55)',
    'display:none','align-items:center','justify-content:center','z-index:4000'
  ].join(';');
  hinweisOverlay.innerHTML =
    '<iframe id="hinweis-frame" src="" frameborder="0" ' +
    'style="width:100%;height:100%;border:none;background:transparent;"></iframe>';
  document.body.appendChild(hinweisOverlay);

  const _hwStyle = document.createElement('style');
  _hwStyle.textContent = '#hinweis-overlay.show{display:flex!important;}';
  document.head.appendChild(_hwStyle);

  function closeHinweis(spielzug, runde) {
    if (spielzug) localStorage.setItem(`hinweis_gesehen_${spielzug}_r${runde}`, 'true');
    hinweisOverlay.classList.remove('show');
    const fr = document.getElementById('hinweis-frame');
    if (fr) fr.src = '';
    restoreFooter();
  }

  function openHinweis(spielzug, runde) {
    const fr = document.getElementById('hinweis-frame');
    if (fr) fr.src = `hinweis.html?spielzug=${encodeURIComponent(spielzug)}&runde=${encodeURIComponent(runde)}`;
    hinweisOverlay.classList.add('show');
    showCloseBar(() => closeHinweis(spielzug, runde));
  }

  /* Prüfen, ob für den aktuellen Screen + Runde ein noch nicht gesehener Hinweis existiert */
  (function checkHinweis() {
    const spielzug = _currentScreen.replace(/\.html$/, '');
    const runde    = localStorage.getItem('rundeNumber') || '1';
    let data;
    try { data = JSON.parse(localStorage.getItem('hinweis')); } catch(e) { data = null; }
    if (!data) return;

    const arr   = data.hinweise || data;
    const entry = Array.isArray(arr)
      ? arr.find(e => e.spielzug === spielzug && String(e.runde) === String(runde))
      : null;
    if (!entry) return;

    if (localStorage.getItem(`hinweis_gesehen_${spielzug}_r${runde}`) === 'true') return;

    openHinweis(spielzug, runde);
  })();

  /* ── Ereignis ─────────────────────────────────────────────────────────────── */
  const ereignisBtn = document.getElementById('nav-ereignis');

  /* Overlay + iframe in DOM injizieren */
  const ereignisOverlay = document.createElement('div');
  ereignisOverlay.id = 'ereignis-overlay';
  ereignisOverlay.className = 'app-overlay';
  ereignisOverlay.style.cssText = [
    'position:fixed','inset:0','background:rgba(0,0,0,0.45)',
    'display:none','align-items:center','justify-content:center','z-index:4000'
  ].join(';');
  ereignisOverlay.innerHTML =
    '<iframe id="ereignis-frame" src="" frameborder="0" ' +
    'style="width:100%;height:100%;border:none;background:transparent;"></iframe>';
  document.body.appendChild(ereignisOverlay);

  /* .show → sichtbar */
  const _erStyle = document.createElement('style');
  _erStyle.textContent = '#ereignis-overlay.show{display:flex!important;}';
  document.head.appendChild(_erStyle);

  /* ── Hilfsfunktionen für Ereignis-Transfer ─────────────────────────────── */
  function _getLS(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch(e) { return null; }
  }
  function _setLS(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function applyEreignisTransfer() {
    const current = _getLS('eventCardValues')  || { positive: 0, negative: 0 };
    const totals  = _getLS('eventCardApplied') || { positive: 0, negative: 0 };

    const posNeu = Number(current.positive) || 0;
    const negNeu = Number(current.negative) || 0;

    /* Nichts eingegeben → nichts buchen */
    if (posNeu === 0 && negNeu === 0) return;

    /* Bilanz: FluessigeMittel akkumulieren */
    const bilanzData = _getLS('bilanzStart');
    if (bilanzData) {
      const arr    = bilanzData.Anfangsbilanz || bilanzData;
      const teamNr = Number(localStorage.getItem('teamNumber')) || 1;
      const idx    = arr[teamNr] !== undefined ? teamNr : (arr[teamNr-1] !== undefined ? teamNr-1 : 0);
      const entry  = arr[idx];
      if (entry && entry.Bilanz) {
        entry.Bilanz.FluessigeMittel =
          (Number(entry.Bilanz.FluessigeMittel) || 0) + posNeu - negNeu;
        arr[idx] = entry;
        _setLS('bilanzStart', bilanzData.Anfangsbilanz ? { ...bilanzData, Anfangsbilanz: arr } : arr);
      }
    }

    /* Erfolgsrechnung: Ausserordentliche Erträge / Aufwände akkumulieren */
    if (posNeu !== 0 || negNeu !== 0) {
      const er = _getLS('erfolgsrechnung') || {};
      if (posNeu !== 0) er.Ausserordentliche_Ertraege = (Number(er.Ausserordentliche_Ertraege) || 0) + posNeu;
      if (negNeu !== 0) er.Ausserordentliche           = (Number(er.Ausserordentliche)          || 0) + negNeu;
      _setLS('erfolgsrechnung', er);
    }

    /* Protokoll */
    const teamNr    = Number(localStorage.getItem('teamNumber')) || 1;
    const teamLabel = localStorage.getItem('klinikName') || `Team ${teamNr}`;
    const protokoll = _getLS('protokoll') || [];
    if (posNeu !== 0) protokoll.push({
      zeit: new Date().toISOString(), spielzug: 'ereignis',
      aktion: 'Ereigniskarte positiv', von: 'Spielleitung',
      nach: 'Flüssige Mittel', betrag: posNeu, team: teamLabel
    });
    if (negNeu !== 0) protokoll.push({
      zeit: new Date().toISOString(), spielzug: 'ereignis',
      aktion: 'Ereigniskarte negativ', von: 'Flüssige Mittel',
      nach: 'Ausserordentlicher Aufwand', betrag: negNeu, team: teamLabel
    });
    _setLS('protokoll', protokoll);

    /* Akkumulierten Total merken, Eingabe zurücksetzen */
    _setLS('eventCardApplied', {
      positive: (Number(totals.positive) || 0) + posNeu,
      negative: (Number(totals.negative) || 0) + negNeu
    });
    _setLS('eventCardValues', { positive: 0, negative: 0 });
  }

  function closeEreignis() {
    applyEreignisTransfer();
    ereignisOverlay.classList.remove('show');
    const fr = document.getElementById('ereignis-frame');
    if (fr) fr.src = '';
    if (ereignisBtn) ereignisBtn.classList.remove('active');
    restoreFooter();
  }
  window.closeEreignisOverlay = closeEreignis;
  window.__restoreFooter = restoreFooter;

  function openEreignis() {
    const isOpen = ereignisOverlay.classList.contains('show');

    /* Andere Overlays schliessen */
    ['handbuch-overlay','wirkung-overlay','hinweis-overlay'].forEach(id => {
      const o = document.getElementById(id); if (o) o.classList.remove('show');
    });
    ['handbuch-frame','wirkung-frame','hinweis-frame'].forEach(id => {
      const f = document.getElementById(id); if (f) f.src = '';
    });
    if (handbuchBtn) handbuchBtn.classList.remove('active');
    if (wirkungBtn)  wirkungBtn.classList.remove('active');

    if (isOpen) {
      closeEreignis();
    } else {
      const fr = document.getElementById('ereignis-frame');
      if (fr) fr.src = 'ereignis.html';
      ereignisOverlay.classList.add('show');
      if (ereignisBtn) ereignisBtn.classList.add('active');
      showCloseBar(closeEreignis);
    }
  }

  if (ereignisBtn) ereignisBtn.addEventListener('click', openEreignis);

  /* ── rebindFooterButtons — Bank + Ereignis ergänzen ─────────────────────── */
  function rebindFooterButtons() {
    const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    bind('nav-back',      goBack);
    bind('nav-next',      goNext);
    bind('nav-handbuch',  openHandbuch);
    bind('nav-wirkungen', openWirkung);
    bind('nav-bank',      openBank);
    bind('nav-ereignis',  openEreignis);

    [
      { id: 'nav-back',      flag: 'disableBack'      },
      { id: 'nav-next',      flag: 'disableNext'      },
      { id: 'nav-handbuch',  flag: 'disableHandbuch'  },
      { id: 'nav-wirkungen', flag: 'disableWirkungen' },
      { id: 'nav-bank',      flag: 'disableBank'      },
      { id: 'nav-ereignis',  flag: 'disableEreignis'  },
    ].forEach(({ id, flag }) => {
      const el = document.getElementById(id);
      if (el && document.body.dataset[flag] === 'true') el.classList.add('disabled');
    });
    _applyHandbuchState();
  }

  /* ── Disabled-Zustände initial setzen ───────────────────────────────────── */
  [
    { id: 'nav-back',      flag: 'disableBack'      },
    { id: 'nav-next',      flag: 'disableNext'      },
    { id: 'nav-handbuch',  flag: 'disableHandbuch'  },
    { id: 'nav-wirkungen', flag: 'disableWirkungen' },
    { id: 'nav-bank',      flag: 'disableBank'      },
    { id: 'nav-ereignis',  flag: 'disableEreignis'  },
  ].forEach(({ id, flag }) => {
    const el = document.getElementById(id);
    if (el && document.body.dataset[flag] === 'true') el.classList.add('disabled');
  });

}  // end if (footerTarget)

/* ═══════════════════════════════════════════════════════════════════════════
   Neosight-Logo → Passwort-Modal → check.html
   ═══════════════════════════════════════════════════════════════════════════ */
(function() {
  const CHECK_PASSWORD = '8822';   // ← Passwort hier ändern
  const CHECK_PAGE     = 'check.html';

  /* Modal-HTML einfügen */
  const modal = document.createElement('div');
  modal.id = 'check-modal';
  modal.innerHTML = `
    <div id="check-modal-backdrop" class="app-overlay" style="
      position:fixed; inset:0; background:rgba(0,0,0,0.45);
      display:none; align-items:center; justify-content:center;
      z-index:9999; opacity:0; transition:opacity 0.2s;
    ">
      <div style="
        background:#fff; border-radius:16px; padding:36px 40px 32px 40px;
        width:320px; box-shadow:0 8px 40px rgba(37,117,176,0.25);
        display:flex; flex-direction:column; gap:16px;
        transform:scale(0.92); transition:transform 0.2s;
      " id="check-modal-box">
        <div style="font-size:1.1rem; font-weight:700; color:var(--color-accent);">
          Moderatoren-Zugang
        </div>
        <div style="font-size:0.85rem; color:#666;">
          Bitte Passwort eingeben:
        </div>
        <input id="check-pw-input" type="password"
          placeholder="Passwort"
          style="
            height:44px; border:1.5px solid var(--color-border);
            border-radius:8px; padding:0 14px; font-size:1rem;
            color:#333; outline:none; width:100%;
          "
        />
        <div id="check-pw-error" style="
          font-size:0.80rem; color:#e05; display:none;
        ">Falsches Passwort</div>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:4px;">
          <button id="check-modal-cancel" style="
            height:40px; padding:0 20px; border:1.5px solid var(--color-border);
            border-radius:8px; background:#fff; color:#888;
            font-size:0.88rem; cursor:pointer;
          ">Abbrechen</button>
          <button id="check-modal-ok" style="
            height:40px; padding:0 20px; border:none;
            border-radius:8px; background:var(--color-accent); color:#fff;
            font-size:0.88rem; font-weight:700; cursor:pointer;
          ">Öffnen</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const backdrop = document.getElementById('check-modal-backdrop');
  const box      = document.getElementById('check-modal-box');
  const input    = document.getElementById('check-pw-input');
  const errMsg   = document.getElementById('check-pw-error');

  function openModal() {
    input.value = '';
    errMsg.style.display = 'none';
    backdrop.style.display = 'flex';
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      box.style.transform    = 'scale(1)';
    });
    setTimeout(() => input.focus(), 100);
  }

  function closeModal() {
    backdrop.style.opacity = '0';
    box.style.transform    = 'scale(0.92)';
    setTimeout(() => { backdrop.style.display = 'none'; }, 200);
  }

  let modalMode = 'check';

  function tryEnter() {
    if (input.value !== CHECK_PASSWORD) {
      errMsg.style.display = 'block';
      input.value = '';
      input.focus();
      return;
    }
    closeModal();
    if (modalMode === 'unlock') {
      localStorage.removeItem('done_spz26_projekte');
      window.location.reload();
    } else {
      window.location.href = CHECK_PAGE;
    }
  }

  document.getElementById('check-modal-cancel').addEventListener('click', closeModal);
  document.getElementById('check-modal-ok').addEventListener('click', tryEnter);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryEnter(); });
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

  /* Logo-Klick nach Header-Rendering abfangen (Event-Delegation) */
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'neosight-logo') { modalMode = 'check'; openModal(); }
  });

  /* Für einzelne Screens (z.B. spz-25.html) nutzbar, um dasselbe Moderatoren-
     Passwort-Modal für einen anderen Zweck als "check.html öffnen" zu triggern. */
  window.openModeratorModal = function(mode) {
    modalMode = mode;
    openModal();
  };
})();
