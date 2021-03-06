﻿var apiKey = "AIzaSyCO-ZxDMic7LcajlJtME2RPe8AzIXv66bs";
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
	},
	"paresseux": {
		"url": "/ressources/paresseux.jpg", "message_notif": "Eh ouai, j'ai pas changé le titre depuis mon dernier live. Un problème ?"
	}
};
var notifId = { live: 'isLive', video: 'newVideo'};
var delais = 14400000;

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
			type: chrome.notifications.TemplateType.IMAGE,
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
			chrome.tabs.create({ url: url.stream });
			chrome.notifications.clear(notif_id, function(){});
			break;
		case notifId.video:
			chrome.tabs.create({ url: url.video });
			chrome.notifications.clear(notif_id, function(){});
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
		case chrome.notifications.TemplateType.BASIC:
			chrome.notifications.create(args.notifId,{
				type: args.type,
				iconUrl: args.iconUrl,
				title: args.title,
				message: args.message,
			}, function(){});
			break;
		case chrome.notifications.TemplateType.IMAGE:
			chrome.notifications.create(args.notifId,{
				type: args.type,
				iconUrl: args.iconUrl,
				title: args.title,
				message: args.message,
				imageUrl: args.imageUrl
			}, function(){});
			break;
	}
}

checkVideos();
//check toutes les xheures
interval = setInterval(checkVideos, delais);