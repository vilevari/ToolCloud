document.addEventListener("DOMContentLoaded", () => {
  const checkbox_autoscroll = document.getElementById("toggle-scroll");
  const checkbox_autoplayShuffle = document.getElementById("toggle-autoplay_shuffle");
  const skipButton = document.getElementById("skip");
  const previousButton = document.getElementById("previous");
  const playControl = document.getElementById("playControl");
  const playIcon = playControl.querySelector('i');

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

  function sendActionMession(action) {
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
          }
        });
      });
    });
  }

  function changePlayIcon(){
    if(playIcon.classList.contains("fa-circle-play")){
      playIcon.classList.remove("fa-circle-play");
      playIcon.classList.add("fa-circle-pause");
    } else {
      playIcon.classList.remove("fa-circle-pause");
      playIcon.classList.add("fa-circle-play");
    }
  }

  playControl.addEventListener('click', () => {
    sendActionMession("play");
    changePlayIcon();
  });

  previousButton.addEventListener('click', () => {
    sendActionMession("previous");
  });
  
  skipButton.addEventListener('click', () => {
    sendActionMession("skip");
  });
});