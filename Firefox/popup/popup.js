var onAir = false;
var alertYt = false;
var keyLocalStorage = "alertYtHumi";

$(document).ready(function(){
	//Communique avec twitch.js
	var sending = browser.runtime.sendMessage({question: "onAir"});
	sending.then(handleResponseOnAir, handleErrorOnAir);

	$('#alert_yt').change(function(e){
		alertYt = $(e.currentTarget).prop('checked');
		localStorage.setItem(keyLocalStorage, alertYt);
		//Communique avec background.js
		var alertYtSending = browser.runtime.sendMessage({changeAlertYt: alertYt});
		alertYtSending.then(handleResponseAlertYt, handleErrorAlertYt);
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

function changeOnAir(){
	if (! onAir) {
		$('#img_on_air').hide();
		$('#twitch_live').removeClass('on-air').addClass('off-air');
	} else {
		$('#img_on_air').show();
		$('#twitch_live').removeClass('off-air').addClass('on-air');
	}
}

function handleResponseOnAir(message)
{
	onAir = message.onAir || false;
	changeOnAir();
}

function handleErrorOnAir(error)
{
	onAir = false;
    changeOnAir();
	console.log('Error : ' . error);
}

function handleResponseAlertYt(message)
{
	console.log("Mise à jour prise en compte");
}

//TODO : Refactor with all console.log(error)
function handleErrorAlertYt(error)
{
	console.log('Error : ' + error);
}

