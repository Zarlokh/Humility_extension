/** Variables utiles */
var apiTwitch = "https://api.twitch.tv/kraken/streams?channel=humilityfr";
var clientID = "f08e5f3ptwhchdmj1ey17ri9ynd1yy1";
var streamDatas = {isLive: false, title: ""};
var delaisTwitch = 60000;

/** Icon config */
chrome.browserAction.setBadgeBackgroundColor({color:"#B1CA20"});

//Listener réception de requête inter-extension
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.question === "isLive"){
			sendResponse({isLive: streamDatas.isLive});
		}
	}
);

/** Fonction chargant les mots clés et lancant @runInterval **/
function run_twitch_extension(){
	checkLive();
	setInterval(checkLive, delaisTwitch);
}

/** Fonction : vérifie l'état du live */
function checkLive(){
	$.ajax({
		url: apiTwitch,
		headers: {
			'Client-ID': clientID
		}
	}).done(function(data){
		processCheckLive(data);
	});
}

/** Check islive */
function processCheckLive(data){
	if(data.streams.length > 0){
		var stream = data.streams[0].channel;
		if(streamDatas.isLive && streamDatas.title === stream.status) return;

		/** Passage en ligne et mise à jour */
		streamDatas.isLive = true;
		streamDatas.title = stream.status;

		chrome.runtime.sendMessage({changeIsLive: true}, function(response){
			if(typeof response === 'undefined') return;
			console.log(response.message || "Problème lors de la réception de la réponse");
		});

		/** Icones */
		chrome.browserAction.setTitle({title: streamDatas.title});
		chrome.browserAction.setBadgeText({text:"ON"});
		chrome.browserAction.setIcon({
			path:{
				"19":"/ressources/icon19.png",
				"38":"/ressources/icon38.png"
			}
		});

		var imageObject = defaultImages.default;
		var args = {
			notifId: notifId.live,
			type: chrome.notifications.TemplateType.BASIC,
			iconUrl: imageObject.url,
			title: streamDatas.title,
			message: imageObject.message_notif
		};
		checkImageIsOk(args);

	}else{
		chrome.runtime.sendMessage({changeIsLive: false}, function(response){
			if(typeof response !== 'undefined'){
				console.log(response.message || "Problème lors de la réception de la réponse");
			}
		});

		streamDatas.isLive = false;
		streamDatas.title = "";
		chrome.browserAction.setTitle({title: "Humility - Offline"});
		chrome.browserAction.setIcon({
			path:{
				"19":"/ressources/iconoff19.png",
				"38":"/ressources/iconoff38.png"
			}
		});
		chrome.browserAction.setBadgeText({text:""});
	}
}
