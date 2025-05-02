document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("toggle-scroll");

  chrome.storage.local.get(["scrollEnabled"], (result) => {
    if (result && result.scrollEnabled !== undefined) {
      checkbox.checked = result.scrollEnabled;
    } else {
      checkbox.checked = false; 
    }
  });

  checkbox.addEventListener("change", () => {
    chrome.storage.local.set({ scrollEnabled: checkbox.checked });
  });
});