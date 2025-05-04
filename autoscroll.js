(function () {
  let scrollInterval = null;

  async function autoScrollPlaylist() {
    return new Promise((resolve) => {
      ToolCloudUtils.log("Autoscrolling...");
      let lastScrollHeight = 0;
      let retries = 0;
  
      scrollInterval = setInterval(async () => {
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
          ToolCloudUtils.log("Reached end of Playlist.");
          await scrollUp();
          resolve();
        }
      }, 100);
    });
  }

  async function scrollUp() {
    ToolCloudUtils.log("Scrolling up...");

    return new Promise((resolve) => {
      let lastScrollTop = Infinity;
      let retries = 0;
  
      upInterval = setInterval(() => {
        window.scrollTo(0, 0);
  
        const currentTop = window.pageYOffset || document.documentElement.scrollTop;
  
        if (currentTop !== lastScrollTop) {
          lastScrollTop = currentTop;
          retries = 0;
        } else {
          retries++;
        }
  
        if (retries >= 3) {
          clearInterval(upInterval);
          upInterval = null;
          ToolCloudUtils.log("Reached top of Playlist.");
          resolve();
        }
      }, 100);
    })
  }

  window.ToolCloudScroll = {
    autoScrollPlaylist,
  };
})();