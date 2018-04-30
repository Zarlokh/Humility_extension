/** Variables utiles */
var apiTwitch = "https://api.twitch.tv/kraken/streams?channel=lestream";
var clientID = "f08e5f3ptwhchdmj1ey17ri9ynd1yy1";
var streamDatas = {isLive: false, title: ""};
var delaisTwitch = 60000;

/** Icon config color */
browser.browserAction.setBadgeBackgroundColor({color:"#B1CA20"});

//Listener réception de requête inter-extension
browser.runtime.onMessage.addListener(
  // Request, sender and sendResponse ?
  function(request, sender, sendResponse){
    if(request.question === "isLive"){
      sendResponse({isLive: streamDatas.isLive});
    }
  }
);

/* Fonction principale : Vérifie si un live est "ON"  **/
function run_twitch_extension(){
  checkLive();
  setInterval(checkLive, delaisTwitch);
}

/* Vérifcation du live en cours et récupération des données du live  */
function checkLive(){
  $.ajax({
    url: apiTwitch,
    headers: {
      'Client-ID': clientID
    }
  }).done(function(data){
    //console.log(data);
  	processCheckLive(data);
  });
}

/** Check islive */
function processCheckLive(data){
  if(data.streams.length > 0) {
    var stream = data.streams[0].channel;
    // Si le stream est déjà en cours et vérifié.
    if(streamDatas.isLive && streamDatas.title === stream.status) return;

    /** Passage en ligne et mise à jour */
    streamDatas.isLive = true;
    streamDatas.title = stream.status;

    // CHange popup - On Air button
    browser.runtime.sendMessage({changeIsLive: true}, function(response){
      if(typeof response === 'undefined') return;
      console.log(response.message || "Problème lors de la réception de la réponse");
    });

    /** Icones */
    browser.browserAction.setTitle({title: streamDatas.title});
    browser.browserAction.setBadgeText({text:"ON"});
    browser.browserAction.setIcon({
      path:{
        "32":"/ressources/logo32.png",
        "48":"/ressources/logo48.png"
      }
    });

    var imageObject = defaultImages.default;
		var args = {
			notifId: notifId.live,
			type: browser.notifications.TemplateType.BASIC,
			iconUrl: imageObject.url,
			title: streamDatas.title,
			message: imageObject.message_notif
		};
		checkImageIsOk(args);

  } else {
    browser.runtime.sendMessage({changeIsLive: false}, function(response){
      if(typeof response !== 'undefined'){
        console.log(response.message || "Problème lors de la réception de la réponse");
      }
    });

    streamDatas.isLive = false;
    streamDatas.title = "";
    browser.browserAction.setTitle({title: "Humility - Offline"});
    browser.browserAction.setIcon({
      path:{
        "19":"/ressources/iconoff19.png",
        "38":"/ressources/iconoff38.png"
      }
    });
    browser.browserAction.setBadgeText({text:""});
  }
}
