/** Variables utiles */
var apiTwitch = "https://api.twitch.tv/kraken/streams?channel=lestream";
var clientID = "f08e5f3ptwhchdmj1ey17ri9ynd1yy1";
var streamDatas = {onAir: false, title: ""};
var delaisTwitch = 60000;

/** Icon config color */
browser.browserAction.setBadgeBackgroundColor({color:"#B1CA20"});

//Listener réception de requête inter-extension
browser.runtime.onMessage.addListener(handleMessage);

/** #######List of functions#######*/

/* Fonction principale : Vérifie si un live est "ON"  **/
function run_twitch_extension()
{
  checkLive();
  setInterval(checkLive, delaisTwitch);
}

/* Vérifcation du live en cours et récupération des données du live  */
function checkLive()
{
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
function processCheckLive(data)
{
  if(data.streams.length > 0) {
    var stream = data.streams[0].channel;
    // Si le stream est déjà en cours et vérifié.
    if(streamDatas.onAir && streamDatas.title === stream.status) {
      return;
    }

    setOnAir(stream);
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
    setOffAir();
  }
}

function setOnAir(stream)
{
  /** Passage en ligne et mise à jour */
  streamDatas.onAir = true;
  streamDatas.title = stream.status;

  // Change popup - On Air button
  changeButtonOnAirButton(true);

  var title = {title: streamDatas.title};
  var badgeText = {text:"ON"};
  var icon = {
      path:{
          "32":"/ressources/logo32.png",
          "48":"/ressources/logo48.png"
      }
  };
}

function setOffAir()
{
    streamDatas.onAir = false;
    streamDatas.title = "";

    changeButtonOnAirButton(false);

    var title = {title: "Humility - Offline"};
    var badgeText = {text: ""};
    var icon = {
        path: {
            "19": "/ressources/iconoff19.png",
            "38": "/ressources/iconoff38.png"
        }
    };
    setBrowserAction(title, badgeText, icon);
}

function setBrowserAction(title, badgeText, icon)
{
    browser.browserAction.setTitle(title);
    browser.browserAction.setBadgeText(badgeText);
    browser.browserAction.setIcon(icon);
}

/** ####### Partie Handler / Sender Message ####### */

/**
 * Change le bouton twitch de la popup (popup != notification)
 * @param changeOnAir
 */
function changeButtonOnAirButton(changeOnAir)
{
    // Change popup - On Air button
    var sending = browser.runtime.sendMessage({changeOnAir: changeOnAir});
    sending.then(handleResponse, handleError);
}

/**
 * @param message
 */
function handleResponse(message)
{
  console.log('Changement pris en compte');
}

/**
 * TODO : Refactor with all console.log(error)
 * @param error
 */
function handleError(error)
{
  console.log('Error: ' + error);
}

// Listener of message comes from popup.js
function handleMessage(request, sender, sendResponse)
{
    if(request.question === "onAir"){
        sendResponse({onAir: streamDatas.onAir});
    }
}