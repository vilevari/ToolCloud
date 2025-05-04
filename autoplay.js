(function() {
    const { simulateClick } = ToolCloudUtils;

    async function startPlaylist_shuffle() {
        ToolCloudUtils.log("Starting playlist on shuffle mode.");
        setTimeout(() => {
            activateShuffleButton();
            setTimeout(() => {
                pressPlayButton();
                setTimeout(() => {
                    pressSkipButton();
                }, 700);
            }, 700);
        }, 300);
    }

    function pressPlayButton() {
        const playButton = document.querySelectorAll('[title="Play"]')[0];
    
        if(playButton){
            simulateClick(playButton);
            ToolCloudUtils.log("Playing playlist.");
        } else {
            ToolCloudUtils.log("No play button was found!");
        }
      }
    
      function activateShuffleButton(){
        const shuffleButton = document.querySelector('.shuffleControl');
        
        if(shuffleButton) {
          if(!shuffleButton.classList.contains('m-shuffling')){
            simulateClick(shuffleButton);
            ToolCloudUtils.log("Activating shuffle.");
          } else {
            ToolCloudUtils.log("Already shuffling.");
            return;
          }
        } else {
          ToolCloudUtils.log("No shuffle button found!");
        }
      }
    
      function pressSkipButton(){
        const skipButton = document.querySelector('.skipControl__next');

        if(skipButton){
            simulateClick(skipButton);
            ToolCloudUtils.log("Skipping first song.");
        } else {
          ToolCloudUtils.log("No skip button found!");
        }
      }

      window.ToolCloudAutoPlay = {
        startPlaylist_shuffle
    };
})();