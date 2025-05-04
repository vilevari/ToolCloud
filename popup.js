document.addEventListener("DOMContentLoaded", () => {
  const checkbox_autoscroll = document.getElementById("toggle-scroll");
  const checkbox_autoplayShuffle = document.getElementById("toggle-autoplay_shuffle");

  chrome.storage.local.get(["scrollEnabled"], (result) => {
    if (result && result.scrollEnabled !== undefined) {
      checkbox_autoscroll.checked = result.scrollEnabled;
    } else {
      checkbox_autoscroll.checked = false; 
    }
  });

  chrome.storage.local.get(["autoplayShuffleEnabled"], (result) => {
    if (result && result.autoplayShuffleEnabled !== undefined) {
      checkbox_autoplayShuffle.checked = result.autoplayShuffleEnabled;
    } else {
      checkbox_autoplayShuffle.checked = false;
    }

  })

  checkbox_autoscroll.addEventListener("change", () => {
    chrome.storage.local.set({ scrollEnabled: checkbox_autoscroll.checked });
  });

  checkbox_autoplayShuffle.addEventListener("change", () => {
    chrome.storage.local.set({ autoplayShuffleEnabled: checkbox_autoplayShuffle.checked });
  })
});