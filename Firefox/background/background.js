/* Background vars*/
var apiKey = "AIzaSyAHZgAMdAmnx_DMWy0rNUXn8DhuC1GYIRU";
var channelId = "UCAfaDiIGDsYgFXMY2IrJIjg";
var url = {
	'api' : "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&order=date&channelId=" + channelId + "&key=" + apiKey,
	'stream' : "http://www.twitch.tv/humilityfr",
	'video' : ''
};
var keyLocalStorage = {
	lastVideo: "lastVideoHumility",
	alertYt: 'alertYtHumi',
	lastCheck: 'lastCheck'
};
var boolCheckVideos = false;
var interval;
var defaultImages = {
	"default": {
		"url": "/ressources/logo128.png",
		"message_notif": "Humility vient de lancer un stream.\nRejoins-nous !"
	}
};
var notifId = {
	live: 'isLive',
	video: 'newVideo'
};
var delais = 900000;
var localStorageAlertYt = localStorage.getItem(keyLocalStorage.alertYt);
var popupIsLoad = false;

if(typeof localStorageAlertYt === 'undefined') {
    localStorage.setItem(keyLocalStorage.alertYt, false);
}
boolCheckVideos = (localStorageAlertYt === 'true') || boolCheckVideos;

//Listener réception de requête inter-extension
browser.runtime.onMessage.addListener(handleMessagePopup);

browser.notifications.onClicked.addListener(function(notif_id) {
	notificationClickCallback(notif_id);
});

// Look if new video is online on YouTube
checkVideos();
interval = setInterval(checkVideos, delais);

/* All Functions */

/**
* Take a look at YouTube api
* @return void
*/
function checkVideos() {
	if(boolCheckVideos === false) return;

	// See if last video already checked
	var lastCheckTmp = localStorage.getItem(keyLocalStorage.lastCheck);
	var isNew = false;

	if(typeof lastCheckTmp === 'undefined' || lastCheckTmp === null){
		localStorage.setItem(keyLocalStorage.lastCheck, Date.now());
		lastCheckTmp = localStorage.getItem(keyLocalStorage.lastCheck);
		isNew = true;
	}

	// Request YouTube api
	if(!isNew && Date.now() <= parseInt(lastCheckTmp) + delais - 10000) return;
	$.ajax({
		url: url.api
	}).done(function(data){
		localStorage.setItem(keyLocalStorage.lastCheck, Date.now());
		process(data.items[0]);
	});
}

/**
* Take a look at YouTube api
* @param lastVideo object YouTube
* @return void
*/
function process(lastVideo) {
	var localStorageLastVideo = localStorage.getItem(keyLocalStorage.lastVideo);
	var urlImage = lastVideo.snippet.thumbnails.high.url.replace("https:/", "http://");

	// Get last video information
	url.video = "https://youtube.com/watch?v=" + lastVideo.id.videoId;
	if(localStorageLastVideo === null || lastVideo.snippet.publishedAt > localStorageLastVideo){
		localStorage.setItem(keyLocalStorage.lastVideo, lastVideo.snippet.publishedAt);
		var args = {
			notifId: notifId.video,
			type: browser.notifications.TemplateType.IMAGE,
			imageUrl: urlImage,
			iconUrl: defaultImages.default.url,
			title: lastVideo.snippet.title,
			message: lastVideo.snippet.description
		};

		// Create Youtube notification
		createNotification(args);
	}
}

/**
* Get Notification click and create tab
* @return void
*/
function notificationClickCallback(notif_id) {
	switch(notif_id){
		case notifId.live :
			browser.tabs.create({ url: url.stream });
			browser.notifications.clear(notif_id, function(){});
			break;
		case notifId.video:
			browser.tabs.create({ url: url.video });
			browser.notifications.clear(notif_id, function(){});
			break;
		default:
			console.log("id unknow");
	}
}

/**
* Create notiication if parameters are good
* @param args object with popup parameters
*/
function checkImageIsOk(args) {
	$.ajax({
		url: args.iconUrl
	}).done(function(){
		createNotification(args);
	}).fail(function(){
		args.iconUrl = defaultImages.default.url;
		createNotification(args);
	});
}

/**
* Create notification with our arguments
* @param args object with popup parameters
*/
function createNotification(args){
	switch(args.type){
		default:
		case browser.notifications.TemplateType.BASIC:
			browser.notifications.create(args.notifId,{
				type: args.type,
				iconUrl: args.iconUrl,
				title: args.title,
				message: args.message,
			}, function(){});
			break;
		case browser.notifications.TemplateType.IMAGE:
			browser.notifications.create(args.notifId,{
				type: args.type,
				iconUrl: args.iconUrl,
				title: args.title,
				message: args.message,
				imageUrl: args.imageUrl
			}, function(){});
			break;
	}
}

/**
* Event handler : Wait message popup
*/
function handleMessagePopup(request, sender, sendResponse)
{
	if(typeof request.changeAlertYt !== 'undefined'){
		sendResponse({message: "Message received"});
		boolCheckVideos = request.changeAlertYt;
		clearInterval(interval);
		checkVideos();
		if (boolCheckVideos) {
            interval = setInterval(checkVideos, delais)
        } else {
			interval = null;
		}
	}

    if(typeof request.changeOnAir !== "undefined"){
        sendResponse({changeOnAir: streamDatas.changeOnAir});
    }

    if(typeof request.question !== "undefined" && request.question === "onAir"){
		popupIsLoad = true;
        sendResponse({onAir: streamDatas.onAir});
    }

	if (typeof request.unload !== "undefined" && request.unload) {
		popupIsLoad = false;
	}
}
