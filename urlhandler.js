(function() {
    const { log } = ToolCloudUtils;
    const { autoScrollPlaylist, stopScroll } = ToolCloudScroll;

    function shouldScroll() {
        return location.pathname.includes("/sets/");
    }

    async function handleScrollSetting(type) {
        if(shouldScroll()){
            switch (type){
                case 1:
                    ToolCloudScroll.autoScrollPlaylist();
                    break;
                case 2:
                    await ToolCloudScroll.autoScrollPlaylist();
                    ToolCloudAutoPlay.startPlaylist_shuffle();
                    break;
                default:
                    ToolCloudUtils.log("Das Addon ist deaktiviert.");
                    break;
            }
        }
    }

    async function handleUrlChange() {
        let type = 0;

        const scrollData = await new Promise((resolve) =>
            chrome.storage.local.get("scrollEnabled", resolve)
        );
        const autoplayData = await new Promise((resolve) =>
            chrome.storage.local.get("autoplayShuffleEnabled", resolve)
        );

        if (scrollData.scrollEnabled === true) {
            type = 1;
        }
        if (autoplayData.autoplayShuffleEnabled === true) {
            type = 2;
        }
        handleScrollSetting(type);
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && changes.scrollEnabled) {
            log("Scroll setting changed:", changes.scrollEnabled.newValue);
            handleScrollSetting(changes.scrollEnabled.newValue);
        } else if (areaName === "local" && changes.autoplayShuffleEnabled) {
            log("Autoplay setting changed: ", changes.autoplayShuffleEnabled.newValue);
        }
      });

    window.ToolCloudUrlHandler = {
        handleUrlChange
    };
})();