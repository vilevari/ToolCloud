(function () {
  
  ToolCloudUrlHandler.handleUrlChange();

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      ToolCloudUtils.log("URL changed to:", lastUrl);
      ToolCloudUrlHandler.handleUrlChange();
    }
  }, 1000);
})();