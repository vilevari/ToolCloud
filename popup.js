document.addEventListener("DOMContentLoaded", () => {

    //html elements used in following logic
    const elements = {
        autoscroll: document.getElementById("toggle-scroll"),
        autoplayShuffle: document.getElementById("toggle-autoplay_shuffle"),
        skipButton: document.getElementById("skip"),
        previousButton: document.getElementById("previous"),
        playControl: document.getElementById("playControl"),
        playbackTimeline: document.getElementById("timeline_foreground"),
        playbackTimer: document.getElementById("timeline_secondsPlayed"),
        songDuration: document.getElementById("timeline_songDuration"),
        songTitle: document.getElementById("songTitle"),
        scrollContent: document.getElementById("scroll-content"),
        scrollWrapper: document.getElementById("scroll-wrapper"),
    };
    elements.playIcon = elements.playControl.querySelector('i');

    //needed for changing title animation from this document
    const styleEl = document.createElement('style');
    styleEl.id = 'my-keyframes-style';
    document.head.appendChild(styleEl);
    const sheet = styleEl.sheet;

    //init
    [
        () => changePlayIcon(elements.playIcon),
        () => displayCurrentPlaybackTime_timeline(elements.playbackTimeline),
        () => displayCurrentPlaybackTime_timer(elements.playbackTimer, elements.songDuration),
        () => displaySongDuration(elements.songDuration),
        () => displaySongTitle(elements.songTitle),
        () => setupControlEvents(elements.playControl, elements.previousButton, elements.skipButton, elements.playIcon)
    ].forEach(fn => fn());

    //every second after init
    setInterval(updatePlayback, 1000);
    function updatePlayback() {
        displayCurrentPlaybackTime_timeline(elements.playbackTimeline);
        displayCurrentPlaybackTime_timer(elements.playbackTimer);
    }

    //responsible for loading & saving correct checkbox status
    function loadToggleState(key, checkbox) {
        chrome.storage.local.get([key], (result) => {
            checkbox.checked = !!result[key];
        });
    }

    function saveToggleState(key, checkbox) {
        chrome.storage.local.set({ [key]: checkbox.checked });
    }

    loadToggleState("scrollEnabled", elements.autoscroll);
    loadToggleState("autoplayShuffleEnabled", elements.autoplayShuffle);

    elements.autoscroll.addEventListener("change", () => {
        saveToggleState("scrollEnabled", elements.autoscroll);
    });

    elements.autoplayShuffle.addEventListener("change", () => {
        saveToggleState("autoplayShuffleEnabled", elements.autoplayShuffle);
    });

    //displays song title and adds animation to it
    function displaySongTitle(songTitle) {
        sendActionMessage("getSongTitle", (_tabId, title) => {
            console.debug("Got answer with title:", title);
            if (title === 'unknown') {
                console.warn("Fehler beim auslesen des Titels:", title, _tabId);
            } else {
                songTitle.textContent = `${title}`;
                elements.scrollContent.style.width = (songTitle.offsetWidth) + "px";
                elements.scrollContent.style.animationDuration = (songTitle.offsetWidth / 25) + "s";

                for (let i = 0; i < sheet.cssRules.length; i++) {
                    const rule = sheet.cssRules[i];
                    if (rule.type === CSSRule.KEYFRAMES_RULE) {
                        sheet.deleteRule(i);
                        break;
                    }
                }
                if ((elements.scrollContent.offsetWidth - elements.scrollWrapper.offsetWidth) >= 0) {
                    const keyframes = `
                @keyframes scroll-text {
                    0%, 20% {transform: translateX(0%)}
                    80%, 100% {transform: translateX(-${elements.scrollContent.offsetWidth - elements.scrollWrapper.offsetWidth}px)}
                }`;
                    sheet.insertRule(keyframes, 0);
                }
            }
        });
    }

    //displays current playbacktime, also responsible for setting songtitle and duration upon a new song starting
    function displayCurrentPlaybackTime_timer(playbackTimer) {
        sendActionMessage("getPlaybackTime_timer", (_tabId, progress) => {
            console.debug("Got answer with progress of:", progress);
            if (progress === 'unknown') {
                console.warn("Fehler beim auslesen des Songprogress (Timer):", progress, _tabId);
            } else {
                if (progress < 2) {
                    displaySongDuration(elements.songDuration);
                    displaySongTitle(elements.songTitle);
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

function setupControlEvents(playControl, previous, skip, playIcon) {
    document.addEventListener("keydown", (event) => {
        switch (event.code) {
            case "Space":
            case "KeyK":
            case " ":
                event.preventDefault();
                sendActionMessage("play");
                changePlayIcon(playIcon);
                break;

            case "ArrowLeft":
            case "KeyJ":
                event.preventDefault();
                sendActionMessage("previous");
                break;

            case "ArrowRight":
            case "KeyL":
                event.preventDefault();
                sendActionMessage("skip");
                break;

            default:
                break;
        }

    })

    playControl.addEventListener('click', (e) => {
        sendActionMessage("play");
        changePlayIcon(playIcon);
        e.currentTarget.blur();
    });

    previous.addEventListener('click', () => {
        sendActionMessage("previous");
    });

    skip.addEventListener('click', () => {
        sendActionMessage("skip");
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