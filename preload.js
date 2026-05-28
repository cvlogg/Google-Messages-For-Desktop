const { ipcRenderer } = require("electron");

const OriginalNotification = window.Notification;

function ElectronNotification(title, options = {}) {
  ipcRenderer.send("show-notification", {
    title,
    body: options.body || "",
    icon: options.icon || "",
    tag: options.tag || "",
  });

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
