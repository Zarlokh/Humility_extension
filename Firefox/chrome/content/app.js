/** Déclaraion des Variables */
	var StreamURL = "http://www.twitch.tv/humilityfr";
	var streamDatasOW = {live: false, title: ""};
	 
	/** Fonction : vérifie l'état du live */
	function getLiveOW(){
		/** Requête GET */
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "https://api.twitch.tv/kraken/streams?channel=humilityfr", true);
		xhr.setRequestHeader("Client-ID", "f08e5f3ptwhchdmj1ey17ri9ynd1yy1");
		xhr.onload = function(){
			if(xhr.status >= 200 && xhr.status < 400){
				var data = JSON.parse(xhr.responseText);
				var btn = document.getElementById("owButton");
				/** Check islive */
				if(data.streams.length > 0){
					var stream = data.streams[0].channel;
					var bodystream = "Humility vient de lancer un stream.               Rejoins-nous !";
					if(streamDatasOW.live){
						if(streamDatasOW.title == stream.status) return;
						var bodystream = "Humility vient de lancer un stream.               Rejoins-nous !";
					}
					/** Passage en ligne et mise à jour */
					streamDatasOW.live = true;
					streamDatasOW.title = stream.status;
					/** Icone */
					btn.classList.add("online");
					btn.setAttribute("tooltiptext", streamDatasOW.title);
					/** Notification */
					Notification.requestPermission(function(status){
						var n = new Notification(streamDatasOW.title ,{
							body: bodystream,
							icon: "chrome://Humility/content/ressources/logo128.png",
							tag: "owLive"
						});
						n.onclick = function(){ redirectOW(); }
					});
				}else{
					streamDatasOW.live = false;
					streamDatasOW.title = "";
					btn.classList.remove("online");
					btn.setAttribute("tooltiptext", "Humility Dofus - Offline");
				}
			}
		};
		xhr.onerror = function(e){};
		xhr.send(null);
	}
	 
	/** Check toutes les minutes si Humility est en ligne */
	var timerOW = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
	timerOW.init(function(){ getLiveOW(); }, 60000, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
	getLiveOW();
	 
	/** Gestion clic sur le logo */
	function redirectOW(){
		var win = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('navigator:browser');
		win.gBrowser.selectedTab = win.gBrowser.addTab(StreamURL);
	}
	 
	/** Installation du bouton */
	function installButtonOW(toolbarId, id) {
	    if(!document.getElementById(id)) {
	        var toolbar = document.getElementById(toolbarId);
	        var before = null;
	        toolbar.insertItem(id, before);
	        toolbar.setAttribute("currentset", toolbar.currentSet);
	        document.persist(toolbar.id, "currentset");
	        if(toolbarId == "addon-bar") toolbar.collapsed = false;
	    }
	}
	 
	/** Installation du bouton si pas déjà installé */
	installButtonOW("nav-bar", "owButton");
	installButtonOW("addon-bar", "owButton");