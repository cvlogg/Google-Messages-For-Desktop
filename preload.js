const { ipcRenderer } = require("electron");

// ---------- Notification bridge → native OS notification + sound ----------

function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

function playDoorOpenSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain).connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {}
}

function ElectronNotification(title, options = {}) {
  ipcRenderer.send("show-notification", {
    title,
    body: options.body || "",
    icon: options.icon || "",
    tag: options.tag || "",
  });
  playMessageSound();

  const emptyTarget = new EventTarget();
  Object.defineProperties(emptyTarget, {
    title: { get: () => title },
    body: { get: () => options.body || "" },
    icon: { get: () => options.icon || "" },
    tag: { get: () => options.tag || "" },
    onclick: { value: null, writable: true },
    onclose: { value: null, writable: true },
    onerror: { value: null, writable: true },
    onshow: { value: null, writable: true },
    close: { value: () => {} },
  });
  return emptyTarget;
}

ElectronNotification.permission = "granted";
ElectronNotification.requestPermission = (callback) => {
  const result = Promise.resolve("granted");
  if (callback) callback("granted");
  return result;
};

Object.defineProperty(window, "Notification", {
  value: ElectronNotification,
  writable: false,
  configurable: false,
});

// ---------- XP-style title bar + AIM theme ----------

const themeCSS = `
  body, html {
    font-family: Tahoma, "MS Sans Serif", Geneva, sans-serif !important;
    background: #ECE9D8 !important;
  }
  #aim-titlebar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 28px;
    background: linear-gradient(to bottom,
      #0831d9 0%,
      #1c52d9 8%,
      #4488e3 40%,
      #5994df 55%,
      #3a7dd8 80%,
      #1941a5 100%);
    border-bottom: 1px solid #001ea0;
    display: flex;
    align-items: center;
    padding: 0 4px 0 8px;
    font-family: "Trebuchet MS", Tahoma, sans-serif;
    font-size: 13px;
    font-weight: bold;
    color: white;
    text-shadow: 1px 1px 0 rgba(0, 0, 30, 0.6);
    z-index: 2147483647;
    -webkit-app-region: drag;
    user-select: none;
    box-sizing: border-box;
  }
  #aim-titlebar .aim-title {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  #aim-titlebar .aim-icon {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    background: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #1941a5;
    font-size: 11px;
    -webkit-app-region: drag;
  }
  #aim-titlebar .aim-controls {
    display: flex;
    gap: 2px;
    -webkit-app-region: no-drag;
  }
  #aim-titlebar button {
    width: 22px;
    height: 22px;
    border: 1px solid #003c74;
    border-radius: 3px;
    cursor: pointer;
    font-family: "Marlett", Tahoma, sans-serif;
    font-size: 11px;
    font-weight: bold;
    color: white;
    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    line-height: 1;
  }
  #aim-titlebar .btn-min,
  #aim-titlebar .btn-max {
    background: linear-gradient(to bottom,
      #e7f0fd 0%,
      #94b2dc 50%,
      #4267b1 50%,
      #4267b1 100%);
  }
  #aim-titlebar .btn-min:hover,
  #aim-titlebar .btn-max:hover { filter: brightness(1.15); }
  #aim-titlebar .btn-close {
    background: linear-gradient(to bottom,
      #e58898 0%,
      #c5223d 50%,
      #a51121 50%,
      #962d34 100%);
  }
  #aim-titlebar .btn-close:hover { filter: brightness(1.15); }
  body {
    padding-top: 28px !important;
  }
`;

function injectTitleBar() {
  if (document.getElementById("aim-titlebar")) return;

  const style = document.createElement("style");
  style.id = "aim-theme-style";
  style.textContent = themeCSS;
  (document.head || document.documentElement).appendChild(style);

  const bar = document.createElement("div");
  bar.id = "aim-titlebar";
  bar.innerHTML = `
    <div class="aim-title">
      <span class="aim-icon">M</span>
      <span>Google Messages</span>
    </div>
    <div class="aim-controls">
      <button class="btn-min" title="Minimize">0</button>
      <button class="btn-max" title="Maximize">1</button>
      <button class="btn-close" title="Close">r</button>
    </div>
  `;
  document.body.insertBefore(bar, document.body.firstChild);

  bar.querySelector(".btn-min").addEventListener("click", () =>
    ipcRenderer.send("window-minimize")
  );
  bar.querySelector(".btn-max").addEventListener("click", () =>
    ipcRenderer.send("window-maximize")
  );
  bar.querySelector(".btn-close").addEventListener("click", () =>
    ipcRenderer.send("window-close")
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectTitleBar);
} else {
  injectTitleBar();
}

window.addEventListener("load", () => {
  setTimeout(playDoorOpenSound, 400);
});
