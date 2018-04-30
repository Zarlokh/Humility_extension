var apiKey = "AIzaSyAHZgAMdAmnx_DMWy0rNUXn8DhuC1GYIRU";
var channelId = "UCAfaDiIGDsYgFXMY2IrJIjg";
var url = {
	'api' : "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&order=date&channelId=" + channelId + "&key=" + apiKey,
	'stream' : "http://www.twitch.tv/humilityfr",
	'video' : ''
};
var keyLocalStorage = {lastVideo: "lastVideoHumility", alertYt: 'alertYtHumi', lastCheck: 'lastCheck'};
var boolCheckVideos = false;
var interval;
var defaultImages = {
	"default": {
		"url": "/ressources/logo128.png", "message_notif": "Humility vient de lancer un stream.           Rejoins-nous !"
	}
};
var notifId = { live: 'isLive', video: 'newVideo'};
var delais = 14400000;
var localStorageAlertYt = localStorage.getItem(keyLocalStorage.alertYt);
if(typeof localStorageAlertYt === 'undefined'){
    localStorage.setItem(keyLocalStorage.alertYt, false);
}
boolCheckVideos = (localStorageAlertYt === 'true') || boolCheckVideos;

//Listener réception de requête inter-extension
browser.runtime.onMessage.addListener(handleMessagePopup);

browser.notifications.onClicked.addListener(function(notif_id){
	notificationClickCallback(notif_id);
});

checkVideos();
//check toutes les xheures
interval = setInterval(checkVideos, delais);

/** ####### list of functions ####### */

function checkVideos(){
	if(boolCheckVideos === false) return;

	var lastCheckTmp = localStorage.getItem(keyLocalStorage.lastCheck);
	var isNew = false;

	if(typeof lastCheckTmp === 'undefined' || lastCheckTmp === null){
		localStorage.setItem(keyLocalStorage.lastCheck, Date.now());
		lastCheckTmp = localStorage.getItem(keyLocalStorage.lastCheck);
		isNew = true;
	}

	if(!isNew && Date.now() <= parseInt(lastCheckTmp) + delais - 10000) return;
	$.ajax({
		url: url.api
	}).done(function(data){
		localStorage.setItem(keyLocalStorage.lastCheck, Date.now());
		process(data.items[0]);
	});
}

function process(lastVideo){
	var localStorageLastVideo = localStorage.getItem(keyLocalStorage.lastVideo);
	var urlImage = lastVideo.snippet.thumbnails.high.url.replace("https:/", "http://");
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
		createNotification(args);
	}
}

function notificationClickCallback(notif_id){
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
			console.log("id inconnu");
	}
}

function checkImageIsOk(args){
	$.ajax({
		url: args.iconUrl
	}).done(function(){
		createNotification(args);
	}).fail(function(){
		args.iconUrl = defaultImages.default.url;
		createNotification(args);
	});
}

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

//Call only if switch alert yt is changed
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
}
