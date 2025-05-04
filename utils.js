(function () {
  function log(...args) {
  console.log("[ToolCloud]", ...args);
  }

  function simulateClick(element) {
    if (element) {
      element.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }));
    } else {
      console.warn("[ToolCloud] SimulateClick: Kein Element übergeben");
    }
  }

  window.ToolCloudUtils = {
    log,
    simulateClick,
  };
})();