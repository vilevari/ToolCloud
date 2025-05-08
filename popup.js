document.addEventListener("DOMContentLoaded", () => {
  const checkbox_autoscroll = document.getElementById("toggle-scroll");
  const checkbox_autoplayShuffle = document.getElementById("toggle-autoplay_shuffle");
  const skipButton = document.getElementById("skip");
  const previousButton = document.getElementById("previous");
  const playControl = document.getElementById("playControl");
  const playIcon = playControl.querySelector('i');
  const playbackTimeline = document.getElementById("timeline_foreground");
  const playbackTimer = document.getElementById("timeline_secondsPlayed");
  const songDuration = document.getElementById("timeline_songDuration");
  const songTitle = document.getElementById("songTitle");
  const scrollContent = document.getElementById("scroll-content");
  const scrollWrapper = document.getElementById("scroll-wrapper");
  const styleEl = document.createElement('style');
  let changed = true;
  styleEl.id = 'my-keyframes-style';
  document.head.appendChild(styleEl);
  const sheet = styleEl.sheet;
  changePlayIcon(playIcon);
  displayCurrentPlaybackTime_timeline(playbackTimeline);
  displayCurrentPlaybackTime_timer(playbackTimer, songDuration);
  displaySongDuration(songDuration);
  displaySongTitle(songTitle);
  setInterval(() => {
    displayCurrentPlaybackTime_timeline(playbackTimeline);
    displayCurrentPlaybackTime_timer(playbackTimer, songDuration);
    displaySongTitle(songTitle);
  }, 1000);

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
    changePlayIcon(playIcon);
  });

  previousButton.addEventListener('click', () => {
    sendActionMessage("previous");
  });
  
  skipButton.addEventListener('click', () => {
    sendActionMessage("skip");
  });

function displaySongTitle(songTitle) {
    sendActionMessage("getSongTitle", (_tabId, title) => {
        console.debug("Got answer with title:", title);
        if (title === 'unknown') {
            console.warn("Fehler beim auslesen des Titels:", title, _tabId);
        } else {
            songTitle.textContent = `${title}`;
            scrollContent.style.width = (songTitle.offsetWidth) + "px";
            scrollContent.style.animationDuration = (songTitle.offsetWidth / 25) + "s";

            if (changed) {
                for (let i = 0; i < sheet.cssRules.length; i++) {
                    const rule = sheet.cssRules[i];
                    if (rule.type === CSSRule.KEYFRAMES_RULE) {
                        sheet.deleteRule(i);
                        break;
                    }
                }
                if ((scrollContent.offsetWidth - scrollWrapper.offsetWidth) >= 0) {
                    const keyframes = `
                @keyframes scroll-text {
                    0%, 20% {transform: translateX(0%)}
                    80%, 100% {transform: translateX(-${scrollContent.offsetWidth - scrollWrapper.offsetWidth}px)}
                }`;
                    changed = false;
                    sheet.insertRule(keyframes, 0);
                }
            }
        }
    });
    }
    function displayCurrentPlaybackTime_timer(playbackTimer, songDuration) {
        sendActionMessage("getPlaybackTime_timer", (_tabId, progress) => {
            console.debug("Got answer with progress of:", progress);
            if (progress === 'unknown') {
                console.warn("Fehler beim auslesen des Songprogress (Timer):", progress, _tabId);
            } else {
                if (progress < 2) {
                    displaySongDuration(songDuration);
                    changed = true;
                }
                const minutes = Math.floor(progress / 60);
                const seconds = progress % 60;
                playbackTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        });
    }
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
          console.error(`Action message to tab ${tab.id} failed:`, chrome.runtime.lastError.message);
        } else {
          console.debug(`Sent action message to tab ${tab.id}:`, action);

          if(typeof onResponse === 'function') {
            onResponse(tab.id, response)
          }
        }
      });
    });
  });


}

function displaySongDuration(songDuration) {
  sendActionMessage("getSongDuration_timer", (_tabId, progress) => {
    console.debug("Got answer with progress of:", progress);
    if(progress === 'unknown'){
      console.warn("Fehler beim auslesen der Songduration:", progress, _tabId);
    } else {
      const minutes = Math.floor(progress / 60);
      const seconds = progress % 60;
      songDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  });
}



function displayCurrentPlaybackTime_timeline(playbackTimeline){
  sendActionMessage("getPlaybackTime_timeline", (_tabId, progress) => {
    console.debug("Got answer with progress of:", progress);
    if(progress === 'unknown'){
      console.warn("Fehler beim auslesen des Songprogress (Timeline):", progress, _tabId);
    } else {
      playbackTimeline.style.width = progress + '%';
    }
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