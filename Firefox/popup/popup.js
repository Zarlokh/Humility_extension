var isLive = false;
var alertYt = false;
var keyLocalStorage = "alertYtHumi";

$(document).ready(function(){
	browser.runtime.sendMessage({question: "isLive"}, function(response){
		isLive = response.isLive || false;
		changeIsLive();
	});

	browser.runtime.onMessage.addListener(
		function(request, sender, sendResponse){
			if(typeof request.changeIsLive !== 'undefined'){
				isLive = request.changeIsLive || false;
				sendResponse({message: "Message received"});
				changeIsLive();
			}
		}
	);

	$('#alert_yt').change(function(e){
		alertYt = $(e.currentTarget).prop('checked');
		localStorage.setItem(keyLocalStorage, alertYt);
		browser.runtime.sendMessage({changeAlertYt: alertYt}, function(response){
			if(typeof response !== "undefined"){
				console.log(response.message || 'Problème lors de la réception de la réponse');
			}
		});
	});

	start();
});

function start(){
	var localStorageYt = localStorage.getItem(keyLocalStorage);
	if(localStorageYt == undefined){
		localStorage.setItem(keyLocalStorage, false);
	}
	alertYt = (localStorageYt === 'true') || alertYt;
	$('#alert_yt').prop('checked', alertYt);
}

function changeIsLive(){
	if(!isLive){
		$('#img_on_air').hide();
		$('#twitch_live').removeClass('on-air').addClass('off-air');
	}else{
		$('#img_on_air').show();
		$('#twitch_live').removeClass('off-air').addClass('on-air');
	}
}
