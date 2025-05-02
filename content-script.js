function log(...args) {
  console.log("[ToolCloud]", ...args);
}

let scrollInterval = null;

function autoScrollPlaylist() {
  log("Autoscrolling...");
  let lastScrollHeight = 0;
  let retries = 0;

  scrollInterval = setInterval(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const currentHeight = document.body.scrollHeight;

    if (currentHeight !== lastScrollHeight) {
      lastScrollHeight = currentHeight;
      retries = 0;
    } else {
      retries++;
    }

    if (retries >= 3) {
      clearInterval(scrollInterval);
      scrollInterval = null;
      log("Reached end of Playlist.");
    }
  }, 100);
}

function stopScroll() {
  if (scrollInterval) {
    clearInterval(scrollInterval);
    scrollInterval = null;
    log("Auto-Scroll gestoppt.");
  }
}

function shouldScroll() {
  return location.pathname.includes("/sets/");
}

function handleScrollSetting(enabled) {
  if (enabled && shouldScroll()) {
    autoScrollPlaylist();
  } else {
    stopScroll();
  }
}

function handleUrlChange() {
  chrome.storage.local.get("scrollEnabled", (data) => {
    handleScrollSetting(data.scrollEnabled === true);
  });
}

handleUrlChange();

let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    log("URL changed to:", lastUrl);
    handleUrlChange();
  }
}, 1000);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.scrollEnabled) {
    log("Scroll setting changed:", changes.scrollEnabled.newValue);
    handleScrollSetting(changes.scrollEnabled.newValue);
  }
});