(function () {
  function log(...args) {
  console.log("[ToolCloud]", ...args);
  }

  window.ToolCloudUtils = {
    log
  };
})();