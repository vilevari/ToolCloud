(function() {
    const { log } = ToolCloudUtils;
    const { autoScrollPlaylist, stopScroll } = ToolCloudScroll;

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

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === "local" && changes.scrollEnabled) {
          log("Scroll setting changed:", changes.scrollEnabled.newValue);
          handleScrollSetting(changes.scrollEnabled.newValue);
        }
      });

    window.ToolCloudUrlHandler = {
        handleUrlChange
    };
})();