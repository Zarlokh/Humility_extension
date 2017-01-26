/** Variables utiles */
var keyWordsFile = "/keyWords.json";
var apiTwitch = "https://api.twitch.tv/kraken/streams?channel=humilityfr";
var clientID = "f08e5f3ptwhchdmj1ey17ri9ynd1yy1";
var streamDatas = {isLive: false, title: ""};
var keyWords = "";
var defaultImages = {
	"default": {
		"url": "/ressources/logo128.png", "message_notif": "Humility vient de lancer un stream.           Rejoins-nous !"
	},
	"paresseux": {
		"url": "/ressources/paresseux.jpg", "message_notif": "Eh ouai, j'ai pas changé le titre depuis mon dernier live. Un problème ?"
	}
};
var keyLocalStorageTwitch = {"lastTitle": "lastTitle"};
var delais = 60000;
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

/** Fonction de lancement vérifiant si le live est on **/
function runInterval(){
	/** Check toutes les minutes */
	checkLive();
	setInterval(checkLive, delais);
}

/** Fonction chargant les mots clés et lancant @runInterval **/
function run_twitch_extension(){
	$.ajax({
		url: keyWordsFile,
		dataType: 'json'
	}).done(function(data){
		keyWords = data.images;
		runInterval();
	});
}

/**
* Param : title -> Titre du live 
* Fonction retournant l'url de l'image associé aux mot-clés **/
function getImageObject(title){
	//Tableau contenant les possibles url d'image en fonction des mots clés
	var res = [];
	var indexImage = 0;
	//Parcours toutes les images
	for(indexImage in keyWords){
		var imageObject = keyWords[indexImage];
		//Parcours les mots clés de l'image
		for(var indexKeyWords in imageObject.keyWords){
			var keyWord = imageObject.keyWords[indexKeyWords];
			//Si titre contient le mot clé
			if(title.toLowerCase().indexOf(keyWord.toLowerCase()) !== -1){
				//Ajout de l'objet image
				res.push(imageObject);
				//Sert plus à rien de chercher d'autres mots clés de l'image
				break;
			}
		}
	}

	//Si aucun mot clé correspondant -> image par défaut
	if(res.length === 0) return defaultImages.default;
	//Si qu'une seule correspondance -> retourne l'url de l'image
	if(res.length === 1) return res[0];
	//Si plusieurs correspondances -> Choisis une aléatoirement
	if(res.length > 1){
		var alea = Math.floor((res.length) * Math.random());
		return res[alea];
	}
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

function processCheckLive(data){
	/** Check islive */
	if(data.streams.length > 0){
		var stream = data.streams[0].channel;
		if(streamDatas.isLive && streamDatas.title === stream.status) return;

		/** Passage en ligne et mise à jour */
		streamDatas.isLive = true;
		streamDatas.title = stream.status;

		chrome.runtime.sendMessage({changeIsLive: true}, function(response){
			if(typeof response === 'undefined') return;
			//console.log(response.message || "Problème lors de la réception de la réponse");
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

		var lastTitle = localStorage.getItem(keyLocalStorageTwitch.lastTitle);
		/** Notification */
		chrome.notifications.create("isLive",{
			type: "basic",
			iconUrl: imageObject.url,
			title: streamDatas.title,
			message: imageObject.message_notif,
		}, function(){});
	}else{
		chrome.runtime.sendMessage({changeIsLive: false}, function(response){
			if(typeof response !== 'undefined'){
				//console.log(response.message || "Problème lors de la réception de la réponse");
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