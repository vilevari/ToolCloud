document.addEventListener("DOMContentLoaded", () => {
  const checkbox_autoscroll = document.getElementById("toggle-scroll");
  const checkbox_autoplayShuffle = document.getElementById("toggle-autoplay_shuffle");
  const skipButton = document.getElementById("skip");
  const previousButton = document.getElementById("previous");
  const playControl = document.getElementById("playControl");
  const playIcon = playControl.querySelector('i');
  changePlayIcon(playIcon);

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
  });

  checkbox_autoscroll.addEventListener("change", () => {
    chrome.storage.local.set({ scrollEnabled: checkbox_autoscroll.checked });
  });

  checkbox_autoplayShuffle.addEventListener("change", () => {
    chrome.storage.local.set({ autoplayShuffleEnabled: checkbox_autoplayShuffle.checked });
  });

  playControl.addEventListener('click', () => {
    sendActionMessage("play");
    changePlayIcon();
  });

  previousButton.addEventListener('click', () => {
    sendActionMessage("previous");
  });
  
  skipButton.addEventListener('click', () => {
    sendActionMessage("skip");
  });
});

function sendActionMessage(action, onResponse) {
  chrome.tabs.query({}, (tabs) => {
    const scTabs = tabs.filter(tab => {
      return tab.url && tab.url.match(/^https?:\/\/(www\.)?soundcloud\.com\//);
    });

    if (scTabs.length === 0) {
      console.warn("Kein SoundCloud-Tab gefunden.");
      return;
    }

    scTabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {action: action}, (response) => {
        if (chrome.runtime.lastError) {
          console.error(`Nachricht an Tab ${tab.id} fehlgeschlagen:`, chrome.runtime.lastError.message);
        } else {
          console.debug(`Action Message gesendet an Tab ${tab.id}:`, action);

          if(typeof onResponse === 'function') {
            onResponse(tab.id, response)
          }
        }
      });
    });
  });
}

function changePlayIcon(playIcon){
  sendActionMessage("getPlaybackStatus", (_tabId, status) => {
    console.debug("Got answer with status:", status);
    if (status === 'playing') {
      playIcon.classList.replace('fa-circle-play', 'fa-circle-pause');
    } else if (status === 'paused') {
      playIcon.classList.replace('fa-circle-pause', 'fa-circle-play');
    } else {
      console.warn("Fehler beim wechseln des Playbackstatus:", status, _tabId);
    }
  });
}