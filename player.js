(function () {

    let slider = null;
    let volume = null;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.debug("Got message:", message);
        switch (message.action) {
            case "skip":
                skipControl();
                break;
            case "previous":
                previousControl();
                break;
            case "play":
                playControl();
                break;
            case "getPlaybackStatus":
                const playButton = document.querySelector(".playControl.sc-ir.playControls__control.sc-button-play.sc-button-large.sc-mr-2x");
                if(!playButton){
                    sendResponse("unknown");
                    return true;
                }
                if (playButton.classList.contains("playing")){
                    sendResponse("playing");
                } else {
                    sendResponse("paused");
                }
                return true;
            default:
                ToolCloudUtils.warn("No action found with message:", message.action);
                break;
        }
    });

    function getSlider() {
        volume = document.querySelector('.volume');
        volume.classList.add('expanded');

        setTimeout(() => {
            slider = document.querySelector('.volume__sliderWrapper');
            if (!slider) {
                ToolCloudUtils.warn("Slider not found.");
                return;
            }
            volume.classList.remove('expanded');
        }, 500);
    }

    function playControl() {
        const playControl = document.querySelector(".playControl.sc-ir.playControls__control.sc-button-play.sc-button-large.sc-mr-2x");
        if(!playControl) ToolCloudUtils.warn("Playcontrol not found.");
        ToolCloudUtils.simulateClick(playControl);
    }

    function skipControl() {
        const skipControl = document.querySelector(".skipControl.sc-ir.playControls__control.playControls__next");
        if(!skipControl) ToolCloudUtils.warn("Skipcontrol not found.");
        ToolCloudUtils.simulateClick(skipControl);
    }

    function previousControl() {
        const previousControl = document.querySelector(".skipControl.sc-ir.playControls__control.playControls__prev");
        if(!previousControl) ToolCloudUtils.warn("Previouscontrol not found.");
        ToolCloudUtils.simulateClick(previousControl);
    }

    function changeVolume(percent) {
        /*
        ============================================================
                 This works with a small margin of error.
                                WIP
        ============================================================

        console.debug("called with percent: ", percent);
        
        const rect = slider.getBoundingClientRect();
        const padding_bottom = 13;
        const padding_top = 27;
        const usableHeight = 154 - padding_top - padding_bottom;

        const clamped = Math.max(0, Math.min(percent, 100)) / 100;
        // - (usableHeight * clamped);
        //  - padding_top; - (usableHeight * 1);
        const y = rect.bottom - padding_bottom - (usableHeight * clamped); 
        const x = rect.left + rect.width / 2;

        const clickX = x + window.scrollX;
        const clickY = y + window.scrollY;

        volume.classList.add('expanded');
        setTimeout(() => {
            simulateClick(clickX, clickY);
            console.debug("Clicking at:", clickX, clickY);
            console.debug("Element at point:", document.elementFromPoint(clickX, clickY));
        }, 500);

        function simulateClick(x, y) {
            const evtDown = new MouseEvent("mousedown", {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y
            });
            const evtUp = new MouseEvent("mouseup", {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y
            });

            const el = document.elementFromPoint(x - window.scrollX, y - window.scrollY);
            if (el) {
                el.dispatchEvent(evtDown);
                el.dispatchEvent(evtUp);
            }
        }
        */
    }
   
    window.ToolCloudPlayer = {
        changeVolume,
        getSlider,
        playControl,
        skipControl,
        previousControl
    };
}) ();
