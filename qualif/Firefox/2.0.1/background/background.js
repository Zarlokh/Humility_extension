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
var delais = 14400000;
localStorage.clear();

//Listener réception de requête inter-extension
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(typeof request.changeAlertYt !== 'undefined'){
			sendResponse({message: "Message received"});
			boolCheckVideos = request.changeAlertYt;
			clearInterval(interval);
			checkVideos();
			interval = setInterval(checkVideos, delais)
		}
	}
);

chrome.notifications.onClicked.addListener(function(notif_id){
	notificationClickCallback(notif_id);
});

var localStorageAlertYt = localStorage.getItem(keyLocalStorage.alertYt);
if(typeof localStorageAlertYt === 'undefined'){
	localStorage.setItem(keyLocalStorage.alertYt, false);
}
boolCheckVideos = (localStorageAlertYt === 'true') || boolCheckVideos;

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
		url: url.api,
		dataType: 'jsonp'
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
		chrome.notifications.create("newVideo",{
					type: chrome.notifications.TemplateType.IMAGE,
					imageUrl: urlImage,
					iconUrl: "/ressources/logo128.png",
					title: lastVideo.snippet.title,
					message: lastVideo.snippet.description
				}, function(){});
	}
}

function notificationClickCallback(notif_id){
	switch(notif_id){
		case 'isLive' :
			chrome.tabs.create({ url: url.stream });
			chrome.notifications.clear(notif_id, function(){});
			break;
		case 'newVideo':
			chrome.tabs.create({ url: url.video });
			chrome.notifications.clear(notif_id, function(){});
			break;
		default:
	}
}

checkVideos();
//check toutes les xheures
interval = setInterval(checkVideos, delais);