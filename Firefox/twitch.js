/** Twitch vars */
var apiTwitch = "https://api.twitch.tv/kraken/streams?channel=humilityfr";
var clientID = "f08e5f3ptwhchdmj1ey17ri9ynd1yy1";
var delaisTwitch = 60000;
var streamDatas = {
  onAir: false,
  title: ""
};
/** Icon badge "ON" color  */
browser.browserAction.setBadgeBackgroundColor({color:"#B1CA20"});

/* Functions */

/**
* Main function check live status every minutes
* @return void
*/
function run_twitch_extension() {
  checkLive();
  setInterval(checkLive, delaisTwitch);
}

/**
* Call api to know if a stream exist
* @return void
*/
function checkLive() {
  $.ajax({
    url: apiTwitch,
    headers: {
      'Client-ID': clientID
    }
  }).done(function(data) {
    processCheckLive(data);
  });
}

/**
* Get Stream elements (title, image...)
* @param data live information
* @return void
*/
function processCheckLive(data) {
  if(data.streams.length > 0) {
    var stream = data.streams[0].channel;

    // If already checked and it's the same title, stop
    if(streamDatas.onAir && streamDatas.title === stream.status) {
      return;
    }

    // Update live status
    setOnAir(stream);

    // Prepare notification
    var imageObject = defaultImages.default;
    var args = {
        notifId: notifId.live,
        type: browser.notifications.TemplateType.BASIC,
        iconUrl: imageObject.url,
        title: streamDatas.title,
        message: imageObject.message_notif
    };

    // Go create notification
    checkImageIsOk(args);
  } else {
    // Set Offline
    setOffAir();
  }
}

/**
* Set stream status online
* @param stream object Stream returned by api
* @return void
*/
function setOnAir(stream) {
  streamDatas.onAir = true;
  streamDatas.title = stream.status;

  // Change popup - On Air button
  if (popupIsLoad) {
	   changeButtonOnAirButton(true);
  }

  // Update icon in browser
  var title = { title: streamDatas.title };
  var badgeText = { text: "ON" };
  var icon = {
      path:{
          "24":"/ressources/iconon24.png",
          "32":"/ressources/iconon32.png"
      }
  };

  setBrowserAction(title, badgeText, icon);
}

/**
* Set stream status offline
* @return void
*/
function setOffAir() {
  streamDatas.onAir = false;
  streamDatas.title = "";

	// Change popup - On Air button
	if (popupIsLoad) {
	  changeButtonOnAirButton(false);
	}

  var title = { title: "Humility - Offline" };
  var badgeText = { text: "" };
  var icon = {
      path: {
          "24": "/ressources/iconoff24.png",
          "32": "/ressources/iconoff32.png"
      }
  };

  setBrowserAction(title, badgeText, icon);
}

/**
* Update live information for browser icon and notification
* @param title string stream title
* @param badgeText string stream text "ON" or empty
* @param icon object Humility icon "ON" or "OFF"
* @return void
*/
function setBrowserAction(title, badgeText, icon) {
  browser.browserAction.setTitle(title);
  browser.browserAction.setBadgeText(badgeText);
  browser.browserAction.setIcon(icon);
}

/* Handler / Sender Message */

/**
* Send message for our popup button
* @param changeOnAir boolean
*/
function changeButtonOnAirButton(changeOnAir) {
  var sending = browser.runtime.sendMessage({ changeOnAir: changeOnAir });
  sending.then(handleResponse, handleError);
}

/**
* Get message
* @param message string response message
*/
function handleResponse(message) {
  console.log('Response accepted: ' + message);
}

/**
* Get error message
* @param error
*/
function handleError(error) {
  console.log('Error: ' + error);
}
