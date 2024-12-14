(function(){
    var script = {
 "class": "Player",
 "scripts": {
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "registerKey": function(key, value){  window[key] = value; },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "existsKey": function(key){  return key in window; },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "getKey": function(key){  return window[key]; },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "unregisterKey": function(key){  delete window[key]; },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } }
 },
 "paddingBottom": 0,
 "backgroundPreloadEnabled": true,
 "id": "rootPlayer",
 "desktopMipmappingEnabled": false,
 "start": "this.init(); this.syncPlaylists([this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA,this.mainPlayList])",
 "contentOpaque": false,
 "width": "100%",
 "children": [
  "this.MainViewer",
  {
   "class": "Container",
   "paddingBottom": 0,
   "left": 0,
   "verticalAlign": "bottom",
   "right": 0,
   "contentOpaque": false,
   "children": [
    {
     "class": "ThumbnailList",
     "itemVerticalAlign": "middle",
     "itemThumbnailShadowVerticalLength": 3,
     "paddingBottom": 10,
     "data": {
      "name": "ThumbnailList474"
     },
     "itemMode": "normal",
     "maxWidth": 800,
     "itemThumbnailScaleMode": "fit_outside",
     "itemThumbnailBorderRadius": 5,
     "maxHeight": 600,
     "itemLabelFontWeight": "normal",
     "playList": "this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA",
     "itemPaddingLeft": 3,
     "borderRadius": 5,
     "itemThumbnailWidth": 100,
     "itemHorizontalAlign": "center",
     "backgroundColorRatios": [
      0
     ],
     "selectedItemLabelFontWeight": "bold",
     "verticalAlign": "top",
     "itemThumbnailShadowBlurRadius": 4,
     "itemBackgroundOpacity": 0,
     "paddingLeft": 20,
     "itemBackgroundColorRatios": [],
     "scrollBarWidth": 10,
     "minHeight": 0,
     "itemPaddingBottom": 3,
     "itemThumbnailShadowSpread": 1,
     "itemPaddingTop": 3,
     "itemPaddingRight": 3,
     "scrollBarMargin": 2,
     "itemLabelFontSize": 14,
     "shadow": false,
     "itemThumbnailOpacity": 1,
     "borderSize": 0,
     "paddingTop": 10,
     "scrollBarOpacity": 0.5,
     "itemThumbnailShadow": true,
     "backgroundOpacity": 0.2,
     "minWidth": 0,
     "itemThumbnailShadowColor": "#000000",
     "backgroundColor": [
      "#000000"
     ],
     "itemBackgroundColor": [],
     "itemLabelFontFamily": "Arial",
     "itemLabelTextDecoration": "none",
     "propagateClick": false,
     "scrollBarVisible": "rollOver",
     "itemLabelFontStyle": "normal",
     "scrollBarColor": "#FFFFFF",
     "itemBorderRadius": 0,
     "itemThumbnailShadowHorizontalLength": 3,
     "itemThumbnailHeight": 75,
     "itemOpacity": 1,
     "itemThumbnailShadowOpacity": 0.8,
     "itemLabelPosition": "bottom",
     "horizontalAlign": "left",
     "itemLabelHorizontalAlign": "center",
     "itemLabelGap": 5,
     "layout": "horizontal",
     "itemBackgroundColorDirection": "vertical",
     "gap": 10,
     "backgroundColorDirection": "vertical",
     "paddingRight": 20,
     "itemLabelFontColor": "#FFFFFF"
    }
   ],
   "minHeight": 20,
   "paddingLeft": 0,
   "scrollBarWidth": 10,
   "scrollBarMargin": 2,
   "bottom": 0,
   "shadow": false,
   "borderSize": 0,
   "paddingTop": 0,
   "minWidth": 20,
   "height": 200,
   "backgroundOpacity": 0,
   "scrollBarOpacity": 0.5,
   "propagateClick": false,
   "scrollBarColor": "#000000",
   "horizontalAlign": "center",
   "overflow": "visible",
   "data": {
    "name": "Container473"
   },
   "scrollBarVisible": "rollOver",
   "paddingRight": 0,
   "gap": 10,
   "borderRadius": 0,
   "layout": "horizontal"
  },
  "this.veilPopupPanorama",
  "this.zoomImagePopupPanorama",
  "this.closeButtonPopupPanorama"
 ],
 "definitions": [{
 "borderRadius": 5,
 "paddingBottom": 0,
 "id": "window_D7B99791_C42A_9DB7_41E0_3838CB3AA7A8",
 "veilShowEffect": {
  "duration": 500,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "width": 500,
 "closeButtonPressedBackgroundColor": [
  "#3A1D1F"
 ],
 "veilColorRatios": [
  0,
  1
 ],
 "titleFontWeight": "normal",
 "verticalAlign": "middle",
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyBorderSize": 0,
 "headerBackgroundOpacity": 0.9,
 "titleFontStyle": "normal",
 "modal": true,
 "shadowOpacity": 0.5,
 "shadowVerticalLength": 0,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "closeButtonIconWidth": 12,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "scrollBarWidth": 10,
 "headerBackgroundColorDirection": "vertical",
 "height": 600,
 "closeButtonIconLineWidth": 2,
 "scrollBarOpacity": 0.5,
 "headerBorderColor": "#000000",
 "backgroundColor": [],
 "borderSize": 0,
 "shadowBlurRadius": 6,
 "title": "",
 "backgroundOpacity": 1,
 "closeButtonBorderRadius": 11,
 "closeButtonIconHeight": 12,
 "titleFontSize": "1.29vmin",
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "closeButtonPressedIconColor": "#FFFFFF",
 "closeButtonRollOverBackgroundColor": [
  "#C13535"
 ],
 "footerBorderColor": "#000000",
 "scrollBarVisible": "rollOver",
 "footerBorderSize": 0,
 "veilColorDirection": "horizontal",
 "footerBackgroundColorDirection": "vertical",
 "backgroundColorDirection": "vertical",
 "veilHideEffect": {
  "duration": 500,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "bodyBackgroundOpacity": 1,
 "titlePaddingRight": 5,
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "paddingRight": 0,
 "layout": "vertical",
 "headerPaddingBottom": 10,
 "class": "Window",
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "veilOpacity": 0.4,
 "hideEffect": {
  "duration": 500,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "children": [
  "this.container_D0839E1E_C416_AF18_41DA_E2F1F5D51274",
  "this.htmlText_D7BFC79A_C42A_9DB5_41BA_C990C473B463"
 ],
 "shadowColor": "#000000",
 "titleTextDecoration": "none",
 "headerBorderSize": 0,
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "backgroundColorRatios": [],
 "footerHeight": 5,
 "closeButtonBackgroundColorRatios": [],
 "titlePaddingTop": 5,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "footerBackgroundOpacity": 1,
 "minHeight": 20,
 "closeButtonRollOverIconColor": "#FFFFFF",
 "titleFontColor": "#000000",
 "scrollBarMargin": 2,
 "bodyBackgroundColorDirection": "vertical",
 "shadow": true,
 "paddingTop": 0,
 "minWidth": 20,
 "headerVerticalAlign": "middle",
 "bodyPaddingRight": 5,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "headerPaddingRight": 10,
 "headerPaddingLeft": 10,
 "propagateClick": false,
 "closeButtonIconColor": "#000000",
 "close": "this.playList_D0802E1C_C416_AF18_41E8_0A6C78E491C5.set('selectedIndex', -1);",
 "overflow": "scroll",
 "bodyBorderColor": "#000000",
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "titleFontFamily": "Arial",
 "bodyPaddingTop": 5,
 "bodyPaddingLeft": 5,
 "shadowHorizontalLength": 3,
 "showEffect": {
  "duration": 500,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "gap": 10,
 "closeButtonBackgroundColor": [],
 "bodyPaddingBottom": 0,
 "headerPaddingTop": 10,
 "data": {
  "name": "Window12852"
 },
 "titlePaddingBottom": 5
},
{
 "items": [
  {
   "media": "this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE",
   "player": "this.MainViewerPhotoAlbumPlayer",
   "class": "PhotoAlbumPlayListItem"
  }
 ],
 "id": "playList_D084EE30_C416_AF28_41DC_E07CDADF64E2",
 "class": "PlayList"
},
{
 "mouseControlMode": "drag_acceleration",
 "class": "PanoramaPlayer",
 "touchControlMode": "drag_rotation",
 "displayPlaybackBar": true,
 "id": "MainViewerPanoramaPlayer",
 "gyroscopeVerticalDraggingEnabled": true,
 "viewerArea": "this.MainViewer"
},
{
 "class": "Panorama",
 "thumbnailUrl": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_t.jpg",
 "id": "panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55",
 "vfov": 180,
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591",
   "class": "AdjacentPanorama"
  }
 ],
 "partial": false,
 "hfovMax": 130,
 "overlays": [
  "this.overlay_B819BA94_AC1F_D560_4190_F3D9139220C2",
  "this.panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_tcap0"
 ],
 "pitch": 0,
 "label": "IMG_3140",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "top": {
    "levels": [
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "back": {
    "levels": [
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_t.jpg",
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "front": {
    "levels": [
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   }
  }
 ],
 "hfovMin": "135%",
 "hfov": 360
},
{
 "class": "PlayList",
 "change": "this.showComponentsWhileMouseOver(this.container_D0FA6E15_C416_AEEB_41B3_6DB4A3D0CF3A, [this.htmltext_D0FCBE17_C416_AF17_41E7_8D77F40CD2BB,this.component_D080FE1B_C416_AF18_41DC_B2618CD7CDEC,this.component_D0808E1B_C416_AF18_41DA_6F000406971E], 2000)",
 "items": [
  "this.albumitem_D0FABE14_C416_AEE9_41E1_50D7C1659C68"
 ],
 "id": "playList_D0FAEE0D_C416_AEF8_41E0_51BDD9166041"
},
{
 "class": "Panorama",
 "thumbnailUrl": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_t.jpg",
 "id": "panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352",
 "vfov": 180,
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55",
   "class": "AdjacentPanorama"
  }
 ],
 "partial": false,
 "hfovMax": 130,
 "overlays": [
  "this.overlay_BD275DAD_AC1C_2EA3_41A2_D6FF12B79088",
  "this.panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_tcap0"
 ],
 "pitch": 0,
 "label": "IMG_3141",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "top": {
    "levels": [
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "back": {
    "levels": [
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_t.jpg",
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "front": {
    "levels": [
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   }
  }
 ],
 "hfovMin": "135%",
 "hfov": 360
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_1_t.jpg",
 "id": "album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_1",
 "width": 2016,
 "label": "Coffee Meetup",
 "image": {
  "levels": [
   {
    "url": "media/album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_1.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 1512
},
{
 "borderRadius": 5,
 "paddingBottom": 0,
 "id": "window_D7B7A9C0_C41D_95B5_41E1_105E26EB10EA",
 "veilShowEffect": {
  "duration": 500,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "width": 500,
 "closeButtonPressedBackgroundColor": [
  "#3A1D1F"
 ],
 "veilColorRatios": [
  0,
  1
 ],
 "titleFontWeight": "normal",
 "verticalAlign": "middle",
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyBorderSize": 0,
 "headerBackgroundOpacity": 1,
 "titleFontStyle": "normal",
 "modal": true,
 "shadowOpacity": 0.5,
 "shadowVerticalLength": 0,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "closeButtonIconWidth": 12,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "scrollBarWidth": 10,
 "headerBackgroundColorDirection": "vertical",
 "height": 600,
 "closeButtonIconLineWidth": 2,
 "scrollBarOpacity": 0.5,
 "headerBorderColor": "#000000",
 "backgroundColor": [],
 "borderSize": 0,
 "shadowBlurRadius": 6,
 "title": "Coffee Meetup",
 "backgroundOpacity": 1,
 "closeButtonBorderRadius": 11,
 "closeButtonIconHeight": 12,
 "titleFontSize": "1.29vmin",
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "closeButtonPressedIconColor": "#FFFFFF",
 "closeButtonRollOverBackgroundColor": [
  "#C13535"
 ],
 "footerBorderColor": "#000000",
 "scrollBarVisible": "rollOver",
 "footerBorderSize": 0,
 "veilColorDirection": "horizontal",
 "footerBackgroundColorDirection": "vertical",
 "backgroundColorDirection": "vertical",
 "veilHideEffect": {
  "duration": 500,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "bodyBackgroundOpacity": 1,
 "titlePaddingRight": 5,
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "paddingRight": 0,
 "layout": "vertical",
 "headerPaddingBottom": 10,
 "class": "Window",
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "veilOpacity": 0.4,
 "hideEffect": {
  "duration": 500,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "children": [
  "this.container_D0856E25_C416_AF28_41DE_E4D55D061683",
  "this.htmlText_D7B5E9C7_C41D_95BB_41E0_E2DCDDD71E36"
 ],
 "shadowColor": "#000000",
 "titleTextDecoration": "none",
 "headerBorderSize": 0,
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "backgroundColorRatios": [],
 "footerHeight": 5,
 "closeButtonBackgroundColorRatios": [],
 "titlePaddingTop": 5,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "footerBackgroundOpacity": 1,
 "minHeight": 20,
 "closeButtonRollOverIconColor": "#FFFFFF",
 "titleFontColor": "#000000",
 "scrollBarMargin": 2,
 "bodyBackgroundColorDirection": "vertical",
 "shadow": true,
 "paddingTop": 0,
 "minWidth": 20,
 "headerVerticalAlign": "middle",
 "bodyPaddingRight": 5,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "headerPaddingRight": 10,
 "headerPaddingLeft": 10,
 "propagateClick": false,
 "closeButtonIconColor": "#000000",
 "close": "this.playList_D085EE23_C416_AF2F_41E7_F65EBF8DCD42.set('selectedIndex', -1);",
 "overflow": "scroll",
 "bodyBorderColor": "#000000",
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "titleFontFamily": "Arial",
 "bodyPaddingTop": 5,
 "bodyPaddingLeft": 5,
 "shadowHorizontalLength": 3,
 "showEffect": {
  "duration": 500,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "gap": 10,
 "closeButtonBackgroundColor": [],
 "bodyPaddingBottom": 0,
 "headerPaddingTop": 10,
 "data": {
  "name": "Window17728"
 },
 "titlePaddingBottom": 5
},
{
 "initialPosition": {
  "yaw": -5.22,
  "class": "PanoramaCameraPosition",
  "pitch": -5.22
 },
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_camera"
},
{
 "borderRadius": 5,
 "paddingBottom": 0,
 "id": "window_D51DD127_C436_92BD_41D8_A4230738FA81",
 "veilShowEffect": {
  "duration": 500,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "width": 500,
 "closeButtonPressedBackgroundColor": [
  "#3A1D1F"
 ],
 "veilColorRatios": [
  0,
  1
 ],
 "titleFontWeight": "normal",
 "verticalAlign": "middle",
 "bodyBackgroundColor": [
  "#FFFFFF",
  "#DDDDDD",
  "#FFFFFF"
 ],
 "bodyBorderSize": 0,
 "headerBackgroundOpacity": 1,
 "titleFontStyle": "normal",
 "modal": true,
 "shadowOpacity": 0.5,
 "shadowVerticalLength": 0,
 "closeButtonPressedBackgroundColorRatios": [
  0
 ],
 "closeButtonIconWidth": 12,
 "paddingLeft": 0,
 "shadowSpread": 1,
 "scrollBarWidth": 10,
 "headerBackgroundColorDirection": "vertical",
 "height": 600,
 "closeButtonIconLineWidth": 2,
 "scrollBarOpacity": 0.5,
 "headerBorderColor": "#000000",
 "backgroundColor": [],
 "borderSize": 0,
 "shadowBlurRadius": 6,
 "title": "",
 "backgroundOpacity": 1,
 "closeButtonBorderRadius": 11,
 "closeButtonIconHeight": 12,
 "titleFontSize": "1.29vmin",
 "footerBackgroundColorRatios": [
  0,
  0.9,
  1
 ],
 "closeButtonPressedIconColor": "#FFFFFF",
 "closeButtonRollOverBackgroundColor": [
  "#C13535"
 ],
 "footerBorderColor": "#000000",
 "scrollBarVisible": "rollOver",
 "footerBorderSize": 0,
 "veilColorDirection": "horizontal",
 "footerBackgroundColorDirection": "vertical",
 "backgroundColorDirection": "vertical",
 "veilHideEffect": {
  "duration": 500,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "bodyBackgroundOpacity": 0.8,
 "titlePaddingRight": 5,
 "closeButtonRollOverBackgroundColorRatios": [
  0
 ],
 "paddingRight": 0,
 "layout": "vertical",
 "headerPaddingBottom": 10,
 "class": "Window",
 "headerBackgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "veilOpacity": 0.4,
 "hideEffect": {
  "duration": 500,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "children": [
  "this.container_D0FA6E15_C416_AEEB_41B3_6DB4A3D0CF3A",
  "this.htmlText_D51C0128_C436_92B3_41E2_3B4BE85DEE18"
 ],
 "shadowColor": "#000000",
 "titleTextDecoration": "none",
 "headerBorderSize": 0,
 "contentOpaque": false,
 "titlePaddingLeft": 5,
 "backgroundColorRatios": [],
 "footerHeight": 5,
 "closeButtonBackgroundColorRatios": [],
 "titlePaddingTop": 5,
 "veilColor": [
  "#000000",
  "#000000"
 ],
 "footerBackgroundOpacity": 1,
 "minHeight": 20,
 "closeButtonRollOverIconColor": "#FFFFFF",
 "titleFontColor": "#000000",
 "scrollBarMargin": 2,
 "bodyBackgroundColorDirection": "vertical",
 "shadow": true,
 "paddingTop": 0,
 "minWidth": 20,
 "headerVerticalAlign": "middle",
 "bodyPaddingRight": 5,
 "bodyBackgroundColorRatios": [
  0,
  0.5,
  1
 ],
 "headerBackgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "headerPaddingRight": 10,
 "headerPaddingLeft": 10,
 "propagateClick": false,
 "closeButtonIconColor": "#000000",
 "close": "this.playList_D0FAEE0D_C416_AEF8_41E0_51BDD9166041.set('selectedIndex', -1);",
 "overflow": "scroll",
 "bodyBorderColor": "#000000",
 "scrollBarColor": "#000000",
 "horizontalAlign": "center",
 "titleFontFamily": "Arial",
 "bodyPaddingTop": 5,
 "bodyPaddingLeft": 5,
 "shadowHorizontalLength": 3,
 "showEffect": {
  "duration": 500,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "footerBackgroundColor": [
  "#FFFFFF",
  "#EEEEEE",
  "#DDDDDD"
 ],
 "gap": 10,
 "closeButtonBackgroundColor": [],
 "bodyPaddingBottom": 0,
 "headerPaddingTop": 10,
 "data": {
  "name": "Window10104"
 },
 "titlePaddingBottom": 5
},
{
 "initialPosition": {
  "yaw": -9.61,
  "class": "PanoramaCameraPosition",
  "pitch": -10.98
 },
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_camera"
},
{
 "items": [
  {
   "media": "this.panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_camera"
  },
  {
   "media": "this.panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_camera"
  },
  {
   "media": "this.panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_camera"
  },
  {
   "media": "this.panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_camera"
  },
  {
   "media": "this.panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_camera"
  },
  {
   "media": "this.panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55",
   "end": "this.trigger('tourEnded')",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_camera"
  }
 ],
 "id": "mainPlayList",
 "class": "PlayList"
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/album_D5340915_C437_92B0_41DA_EFB9D499751C_2_t.jpg",
 "id": "album_D5340915_C437_92B0_41DA_EFB9D499751C_2",
 "width": 1080,
 "label": "Founder Academy Guest",
 "image": {
  "levels": [
   {
    "url": "media/album_D5340915_C437_92B0_41DA_EFB9D499751C_2.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 810
},
{
 "initialPosition": {
  "yaw": -10.43,
  "class": "PanoramaCameraPosition",
  "pitch": -7.41
 },
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_camera"
},
{
 "class": "Panorama",
 "thumbnailUrl": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_t.jpg",
 "id": "panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B",
 "vfov": 180,
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA",
   "class": "AdjacentPanorama"
  }
 ],
 "partial": false,
 "hfovMax": 130,
 "overlays": [
  "this.overlay_BE48E842_AC24_35E5_41D7_6E2B4B745147",
  "this.overlay_D5495BA7_C436_75B0_41E2_61017A144767",
  "this.overlay_D09D1A0B_C435_9695_41A9_676167C69BFD",
  "this.panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_tcap0"
 ],
 "pitch": 0,
 "label": "IMG_3144",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "top": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "back": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_t.jpg",
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "front": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   }
  }
 ],
 "hfovMin": "135%",
 "hfov": 360
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/album_D032CC50_C415_935F_41C2_BC5556378C34_1_t.jpg",
 "id": "album_D032CC50_C415_935F_41C2_BC5556378C34_1",
 "width": 2048,
 "label": "Coffee Meetup",
 "image": {
  "levels": [
   {
    "url": "media/album_D032CC50_C415_935F_41C2_BC5556378C34_1.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 1536
},
{
 "id": "ImageResource_D16F890E_C477_B2D4_41CA_69165E1CDEEB",
 "levels": [
  {
   "url": "media/popup_D7D98D7F_C475_AD35_41C5_7A71145FC61E_0_0.jpg",
   "width": 2048,
   "class": "ImageResourceLevel",
   "height": 1536
  },
  {
   "url": "media/popup_D7D98D7F_C475_AD35_41C5_7A71145FC61E_0_1.jpg",
   "width": 1024,
   "class": "ImageResourceLevel",
   "height": 768
  },
  {
   "url": "media/popup_D7D98D7F_C475_AD35_41C5_7A71145FC61E_0_2.jpg",
   "width": 512,
   "class": "ImageResourceLevel",
   "height": 384
  }
 ],
 "class": "ImageResource"
},
{
 "initialPosition": {
  "yaw": -4.67,
  "class": "PanoramaCameraPosition",
  "pitch": -6.59
 },
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_camera"
},
{
 "class": "PlayList",
 "change": "this.showComponentsWhileMouseOver(this.container_D0839E1E_C416_AF18_41DA_E2F1F5D51274, [this.htmltext_D0836E1E_C416_AF19_41C7_377759D46B90,this.component_D082DE1F_C416_AF17_41E7_3BA346521063,this.component_D082EE1F_C416_AF17_41E5_B5C010C2F934], 2000)",
 "items": [
  "this.albumitem_D083EE1D_C416_AF18_41D2_E264A7DA7593"
 ],
 "id": "playList_D0802E1C_C416_AF18_41E8_0A6C78E491C5"
},
{
 "class": "Panorama",
 "thumbnailUrl": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_t.jpg",
 "id": "panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591",
 "vfov": 180,
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B",
   "class": "AdjacentPanorama"
  }
 ],
 "partial": false,
 "hfovMax": 130,
 "overlays": [
  "this.overlay_BD0893F9_AC24_5A9A_41D0_1029E708FDCA",
  "this.panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0"
 ],
 "pitch": 0,
 "label": "IMG_3145",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "top": {
    "levels": [
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "back": {
    "levels": [
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_t.jpg",
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "front": {
    "levels": [
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   }
  }
 ],
 "hfovMin": "135%",
 "hfov": 360
},
{
 "class": "PhotoAlbum",
 "thumbnailUrl": "media/album_D032CC50_C415_935F_41C2_BC5556378C34_t.png",
 "id": "album_D032CC50_C415_935F_41C2_BC5556378C34",
 "playList": "this.album_D032CC50_C415_935F_41C2_BC5556378C34_AlbumPlayList",
 "label": "Photo Album 1720942769405"
},
{
 "showDuration": 500,
 "class": "PopupPanoramaOverlay",
 "rotationZ": 0,
 "popupMaxHeight": "95%",
 "rotationY": 0,
 "id": "popup_D7D98D7F_C475_AD35_41C5_7A71145FC61E",
 "rotationX": 0,
 "popupMaxWidth": "95%",
 "hfov": 5.3,
 "showEasing": "cubic_in",
 "image": {
  "levels": [
   {
    "url": "media/popup_D7D98D7F_C475_AD35_41C5_7A71145FC61E_0_1.jpg",
    "width": 1024,
    "class": "ImageResourceLevel",
    "height": 768
   }
  ],
  "class": "ImageResource"
 },
 "pitch": -5.39,
 "hideDuration": 500,
 "yaw": -55.43,
 "popupDistance": 100,
 "hideEasing": "cubic_out"
},
{
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "path": "shortest",
    "class": "TargetPanoramaCameraMovement",
    "yawSpeed": 33.25,
    "targetPitch": -16.8,
    "easing": "cubic_in_out",
    "targetYaw": 7.24,
    "pitchSpeed": 17.05
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "initialPosition": {
  "yaw": -101.39,
  "class": "PanoramaCameraPosition",
  "pitch": -16.88
 },
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_camera"
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/photo_D5D8497D_C43A_9575_41D4_D20462ACEA5C_t.jpg",
 "id": "photo_D5D8497D_C43A_9575_41D4_D20462ACEA5C",
 "width": 1080,
 "label": "Founder Academy Immersion Session",
 "image": {
  "levels": [
   {
    "url": "media/photo_D5D8497D_C43A_9575_41D4_D20462ACEA5C.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 810
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_0_t.jpg",
 "id": "album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_0",
 "width": 2016,
 "label": "Coffee Meetup",
 "image": {
  "levels": [
   {
    "url": "media/album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_0.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 1512
},
{
 "class": "Panorama",
 "thumbnailUrl": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_t.jpg",
 "id": "panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA",
 "vfov": 180,
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F",
   "class": "AdjacentPanorama"
  }
 ],
 "partial": false,
 "hfovMax": 130,
 "overlays": [
  "this.overlay_BCCF0CB0_AC24_2EA3_41E1_78E11CAEE89D",
  "this.panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_tcap0"
 ],
 "pitch": 0,
 "label": "IMG_3143",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "top": {
    "levels": [
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "back": {
    "levels": [
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_t.jpg",
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "front": {
    "levels": [
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   }
  }
 ],
 "hfovMin": "135%",
 "hfov": 360
},
{
 "items": [
  {
   "media": "this.album_D032CC50_C415_935F_41C2_BC5556378C34",
   "player": "this.MainViewerPhotoAlbumPlayer",
   "class": "PhotoAlbumPlayListItem"
  }
 ],
 "id": "playList_D0848E30_C416_AF28_418E_D82D30F4F688",
 "class": "PlayList"
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/album_D5340915_C437_92B0_41DA_EFB9D499751C_0_t.jpg",
 "id": "album_D5340915_C437_92B0_41DA_EFB9D499751C_0",
 "width": 1080,
 "label": "Founder Acadmey Immersion Session",
 "image": {
  "levels": [
   {
    "url": "media/album_D5340915_C437_92B0_41DA_EFB9D499751C_0.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 810
},
{
 "class": "PhotoAlbum",
 "thumbnailUrl": "media/album_D5340915_C437_92B0_41DA_EFB9D499751C_t.png",
 "id": "album_D5340915_C437_92B0_41DA_EFB9D499751C",
 "playList": "this.album_D5340915_C437_92B0_41DA_EFB9D499751C_AlbumPlayList",
 "label": "Photo Album WhatsApp Image 2024-12-13 at 15.22.17_4bd91a25"
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/album_D5340915_C437_92B0_41DA_EFB9D499751C_1_t.jpg",
 "id": "album_D5340915_C437_92B0_41DA_EFB9D499751C_1",
 "width": 1080,
 "label": "Founder Academy Immersion Session",
 "image": {
  "levels": [
   {
    "url": "media/album_D5340915_C437_92B0_41DA_EFB9D499751C_1.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 810
},
{
 "class": "Panorama",
 "thumbnailUrl": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_t.jpg",
 "id": "panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F",
 "vfov": 180,
 "adjacentPanoramas": [
  {
   "panorama": "this.panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352",
   "class": "AdjacentPanorama"
  }
 ],
 "partial": false,
 "hfovMax": 130,
 "overlays": [
  "this.overlay_BCE5B4D1_AC24_5EE5_41D0_7F6EAC2A425F",
  "this.overlay_D6D42537_C41E_B2DD_41C1_485B7CF6CA69",
  "this.overlay_D01F00C8_C46B_9359_41A4_B45CA7815F33",
  "this.popup_D7D98D7F_C475_AD35_41C5_7A71145FC61E",
  "this.panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_tcap0"
 ],
 "pitch": 0,
 "label": "IMG_3142",
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "top": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "right": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "back": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "thumbnailUrl": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_t.jpg",
   "bottom": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "front": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   },
   "left": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 4,
      "colCount": 4,
      "width": 2048,
      "height": 2048,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 2,
      "colCount": 2,
      "width": 1024,
      "height": 1024,
      "tags": "ondemand"
     },
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "rowCount": 1,
      "colCount": 1,
      "width": 512,
      "height": 512,
      "tags": [
       "ondemand",
       "preload"
      ]
     }
    ],
    "class": "ImageResource"
   }
  }
 ],
 "hfovMin": "135%",
 "hfov": 360
},
{
 "duration": 5000,
 "class": "Photo",
 "thumbnailUrl": "media/album_D032CC50_C415_935F_41C2_BC5556378C34_0_t.jpg",
 "id": "album_D032CC50_C415_935F_41C2_BC5556378C34_0",
 "width": 2048,
 "label": "Coffee Meetup",
 "image": {
  "levels": [
   {
    "url": "media/album_D032CC50_C415_935F_41C2_BC5556378C34_0.jpg",
    "class": "ImageResourceLevel"
   }
  ],
  "class": "ImageResource"
 },
 "height": 1407
},
{
 "class": "PhotoAlbum",
 "thumbnailUrl": "media/album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_t.png",
 "id": "album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE",
 "playList": "this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_AlbumPlayList",
 "label": "Photo Album 1732438955165"
},
{
 "id": "MainViewerPhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "viewerArea": "this.MainViewer"
},
{
 "class": "PlayList",
 "change": "this.showComponentsWhileMouseOver(this.container_D0856E25_C416_AF28_41DE_E4D55D061683, [this.htmltext_D0853E27_C416_AF37_41E7_93935E4DE11B,this.component_D084AE2A_C416_AF39_41D6_6D0549C10FCF,this.component_D084BE2A_C416_AF39_41E6_257184DE42E4], 2000)",
 "items": [
  "this.albumitem_D0854E23_C416_AF2F_41D3_02955A138C8B"
 ],
 "id": "playList_D085EE23_C416_AF2F_41E7_F65EBF8DCD42"
},
{
 "items": [
  {
   "media": "this.panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA, 0, 1)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_camera"
  },
  {
   "media": "this.panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA, 1, 2)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_camera"
  },
  {
   "media": "this.panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA, 2, 3)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_camera"
  },
  {
   "media": "this.panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA, 3, 4)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_camera"
  },
  {
   "media": "this.panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA, 4, 5)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_camera"
  },
  {
   "media": "this.panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55",
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA, 5, 0)",
   "player": "this.MainViewerPanoramaPlayer",
   "camera": "this.panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_camera"
  }
 ],
 "id": "playList_B8244DE5_AC1C_2EA1_41E0_EF6FBD4438CA",
 "class": "PlayList"
},
{
 "initialPosition": {
  "yaw": -17.85,
  "class": "PanoramaCameraPosition",
  "pitch": -10.16
 },
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "id": "panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_camera"
},
{
 "items": [
  {
   "media": "this.album_D5340915_C437_92B0_41DA_EFB9D499751C",
   "player": "this.MainViewerPhotoAlbumPlayer",
   "class": "PhotoAlbumPlayListItem"
  }
 ],
 "id": "playList_D0875E2F_C416_AF38_41A1_53717225C185",
 "class": "PlayList"
},
{
 "paddingBottom": 0,
 "transitionDuration": 500,
 "id": "MainViewer",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipTextShadowBlurRadius": 3,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "progressOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "paddingLeft": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipBorderColor": "#767676",
 "borderSize": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipPaddingBottom": 4,
 "height": "100%",
 "toolTipBackgroundColor": "#F6F6F6",
 "playbackBarHeadShadow": true,
 "firstTransitionDuration": 0,
 "toolTipTextShadowOpacity": 0,
 "vrPointerSelectionTime": 2000,
 "progressBottom": 0,
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBackgroundColorDirection": "vertical",
 "progressHeight": 10,
 "playbackBarLeft": 0,
 "progressBackgroundOpacity": 1,
 "progressBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarProgressBorderColor": "#000000",
 "paddingRight": 0,
 "playbackBarBottom": 5,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "class": "ViewerArea",
 "toolTipBorderRadius": 3,
 "toolTipPaddingTop": 4,
 "vrPointerColor": "#FFFFFF",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarHeadHeight": 15,
 "progressBarOpacity": 1,
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressLeft": 0,
 "toolTipFontWeight": "normal",
 "playbackBarHeight": 10,
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "progressBorderSize": 0,
 "minHeight": 50,
 "playbackBarHeadWidth": 6,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "toolTipBorderSize": 1,
 "toolTipDisplayTime": 600,
 "shadow": false,
 "toolTipPaddingLeft": 6,
 "displayTooltipInTouchScreens": true,
 "playbackBarBackgroundColorDirection": "vertical",
 "minWidth": 100,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "paddingTop": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "toolTipPaddingRight": 6,
 "playbackBarHeadOpacity": 1,
 "progressBarBorderSize": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowColor": "#333333",
 "progressBarBorderColor": "#000000",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipShadowVerticalLength": 0,
 "data": {
  "name": "Main Viewer"
 },
 "toolTipFontSize": "1.11vmin",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipFontFamily": "Arial",
 "progressBarBorderRadius": 0,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "UIComponent",
 "paddingBottom": 0,
 "id": "veilPopupPanorama",
 "left": 0,
 "right": 0,
 "showEffect": {
  "duration": 350,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "paddingLeft": 0,
 "top": 0,
 "backgroundColor": [
  "#000000"
 ],
 "bottom": 0,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "backgroundOpacity": 0.55,
 "propagateClick": false,
 "backgroundColorDirection": "vertical",
 "data": {
  "name": "UIComponent22855"
 },
 "paddingRight": 0,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "ZoomImage",
 "paddingBottom": 0,
 "id": "zoomImagePopupPanorama",
 "left": 0,
 "right": 0,
 "backgroundColorRatios": [],
 "minHeight": 0,
 "paddingLeft": 0,
 "top": 0,
 "backgroundColor": [],
 "bottom": 0,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "backgroundOpacity": 1,
 "propagateClick": false,
 "backgroundColorDirection": "vertical",
 "scaleMode": "custom",
 "data": {
  "name": "ZoomImage22856"
 },
 "paddingRight": 0,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "CloseButton",
 "layout": "horizontal",
 "paddingBottom": 5,
 "id": "closeButtonPopupPanorama",
 "showEffect": {
  "duration": 350,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "fontFamily": "Arial",
 "right": 10,
 "shadowColor": "#000000",
 "backgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "iconHeight": 20,
 "verticalAlign": "middle",
 "iconBeforeLabel": true,
 "fontColor": "#FFFFFF",
 "iconColor": "#000000",
 "minHeight": 0,
 "paddingLeft": 5,
 "shadowSpread": 1,
 "top": 10,
 "borderColor": "#000000",
 "backgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "iconLineWidth": 5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 5,
 "minWidth": 0,
 "mode": "push",
 "backgroundOpacity": 0.3,
 "shadowBlurRadius": 6,
 "rollOverIconColor": "#666666",
 "propagateClick": false,
 "pressedIconColor": "#888888",
 "label": "",
 "backgroundColorDirection": "vertical",
 "fontStyle": "normal",
 "fontSize": "1.29vmin",
 "textDecoration": "none",
 "horizontalAlign": "center",
 "paddingRight": 5,
 "fontWeight": "normal",
 "iconWidth": 20,
 "cursor": "hand",
 "borderRadius": 0,
 "data": {
  "name": "CloseButton22857"
 },
 "gap": 5
},
{
 "class": "Container",
 "paddingBottom": 0,
 "id": "container_D0839E1E_C416_AF18_41DA_E2F1F5D51274",
 "contentOpaque": false,
 "width": "100%",
 "children": [
  "this.viewer_uidD083CE1D_C416_AF18_41C6_5886F09A919A",
  {
   "class": "Container",
   "paddingBottom": 0,
   "left": 0,
   "verticalAlign": "bottom",
   "right": 0,
   "contentOpaque": true,
   "children": [
    "this.htmltext_D0836E1E_C416_AF19_41C7_377759D46B90"
   ],
   "backgroundColorRatios": [],
   "minHeight": 20,
   "paddingLeft": 0,
   "scrollBarWidth": 7,
   "scrollBarMargin": 2,
   "backgroundColor": [],
   "bottom": 0,
   "shadow": false,
   "borderSize": 0,
   "paddingTop": 0,
   "minWidth": 20,
   "backgroundOpacity": 0.3,
   "scrollBarOpacity": 0.5,
   "propagateClick": false,
   "scrollBarColor": "#FFFFFF",
   "backgroundColorDirection": "vertical",
   "overflow": "scroll",
   "data": {
    "name": "Container22845"
   },
   "scrollBarVisible": "rollOver",
   "height": "30%",
   "horizontalAlign": "left",
   "paddingRight": 0,
   "gap": 10,
   "borderRadius": 0,
   "layout": "vertical"
  },
  "this.component_D082DE1F_C416_AF17_41E7_3BA346521063",
  "this.component_D082EE1F_C416_AF17_41E5_B5C010C2F934"
 ],
 "backgroundColorRatios": [],
 "verticalAlign": "top",
 "minHeight": 20,
 "paddingLeft": 0,
 "scrollBarMargin": 2,
 "backgroundColor": [],
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 20,
 "backgroundOpacity": 0.3,
 "scrollBarWidth": 10,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "backgroundColorDirection": "vertical",
 "overflow": "scroll",
 "data": {
  "name": "Container22844"
 },
 "scrollBarVisible": "rollOver",
 "height": "50%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "gap": 10,
 "borderRadius": 0,
 "layout": "absolute"
},
{
 "class": "HTMLText",
 "paddingBottom": 10,
 "id": "htmlText_D7BFC79A_C42A_9DB5_41BA_C990C473B463",
 "width": "100%",
 "scrollBarWidth": 10,
 "minHeight": 0,
 "paddingLeft": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 10,
 "minWidth": 0,
 "height": "50%",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:justify;\"><SPAN STYLE=\"letter-spacing:0px;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:14px;\">The vibrant atmosphere of our coffee meetup an essential moment for fostering connections and sharing ideas in a relaxed setting.</SPAN></SPAN></DIV></div>",
 "data": {
  "name": "HTMLText12853"
 },
 "scrollBarVisible": "rollOver",
 "paddingRight": 10,
 "borderRadius": 0
},
{
 "maps": [
  {
   "hfov": 11.56,
   "yaw": -2.21,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_1_HS_0_0_0_map.gif",
      "width": 29,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -9.04
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_B81AEE03_AC1C_2D61_41D0_882BB6AD353D",
   "pitch": -9.04,
   "yaw": -2.21,
   "hfov": 11.56,
   "distance": 50
  }
 ],
 "enabledInCardboard": true,
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 0)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_B819BA94_AC1F_D560_4190_F3D9139220C2",
 "data": {
  "label": "Arrow 06a Left-Up"
 }
},
{
 "hfov": 43.5,
 "inertia": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "image": {
  "levels": [
   {
    "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0.jpg",
    "width": 640,
    "class": "ImageResourceLevel",
    "height": 640
   }
  ],
  "class": "ImageResource"
 },
 "rotate": false,
 "id": "panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_tcap0",
 "distance": 50
},
{
 "media": "this.album_D5340915_C437_92B0_41DA_EFB9D499751C",
 "class": "PhotoAlbumPlayListItem",
 "begin": "this.updateMediaLabelFromPlayList(this.album_D5340915_C437_92B0_41DA_EFB9D499751C_AlbumPlayList, this.htmltext_D0FCBE17_C416_AF17_41E7_8D77F40CD2BB, this.albumitem_D0FABE14_C416_AEE9_41E1_50D7C1659C68); this.loopAlbum(this.playList_D0FAEE0D_C416_AEF8_41E0_51BDD9166041, 0)",
 "player": "this.viewer_uidD0FA9E13_C416_AEEF_41E2_0D015A777694PhotoAlbumPlayer",
 "id": "albumitem_D0FABE14_C416_AEE9_41E1_50D7C1659C68"
},
{
 "maps": [
  {
   "hfov": 16.79,
   "yaw": -20.24,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -17.97
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_B81D6E03_AC1C_2D61_41D2_B58CE548A150",
   "pitch": -17.97,
   "yaw": -20.24,
   "hfov": 16.79,
   "distance": 100
  }
 ],
 "enabledInCardboard": true,
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 5)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_BD275DAD_AC1C_2EA3_41A2_D6FF12B79088",
 "data": {
  "label": "Arrow 04b"
 }
},
{
 "hfov": 43.5,
 "inertia": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "image": {
  "levels": [
   {
    "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0.jpg",
    "width": 640,
    "class": "ImageResourceLevel",
    "height": 640
   }
  ],
  "class": "ImageResource"
 },
 "rotate": false,
 "id": "panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_tcap0",
 "distance": 50
},
{
 "class": "Container",
 "paddingBottom": 0,
 "id": "container_D0856E25_C416_AF28_41DE_E4D55D061683",
 "contentOpaque": false,
 "width": "100%",
 "children": [
  "this.viewer_uidD0858E23_C416_AF2F_41E0_006E4DDE1A65",
  {
   "class": "Container",
   "paddingBottom": 0,
   "left": 0,
   "verticalAlign": "bottom",
   "right": 0,
   "contentOpaque": true,
   "children": [
    "this.htmltext_D0853E27_C416_AF37_41E7_93935E4DE11B"
   ],
   "backgroundColorRatios": [],
   "minHeight": 20,
   "paddingLeft": 0,
   "scrollBarWidth": 7,
   "scrollBarMargin": 2,
   "backgroundColor": [],
   "bottom": 0,
   "shadow": false,
   "borderSize": 0,
   "paddingTop": 0,
   "minWidth": 20,
   "backgroundOpacity": 0.3,
   "scrollBarOpacity": 0.5,
   "propagateClick": false,
   "scrollBarColor": "#FFFFFF",
   "backgroundColorDirection": "vertical",
   "overflow": "scroll",
   "data": {
    "name": "Container22851"
   },
   "scrollBarVisible": "rollOver",
   "height": "30%",
   "horizontalAlign": "left",
   "paddingRight": 0,
   "gap": 10,
   "borderRadius": 0,
   "layout": "vertical"
  },
  "this.component_D084AE2A_C416_AF39_41D6_6D0549C10FCF",
  "this.component_D084BE2A_C416_AF39_41E6_257184DE42E4"
 ],
 "backgroundColorRatios": [],
 "verticalAlign": "top",
 "minHeight": 20,
 "paddingLeft": 0,
 "scrollBarMargin": 2,
 "backgroundColor": [],
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 20,
 "backgroundOpacity": 0.3,
 "scrollBarWidth": 10,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "backgroundColorDirection": "vertical",
 "overflow": "scroll",
 "data": {
  "name": "Container22850"
 },
 "scrollBarVisible": "rollOver",
 "height": "50%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "gap": 10,
 "borderRadius": 0,
 "layout": "absolute"
},
{
 "class": "HTMLText",
 "paddingBottom": 10,
 "id": "htmlText_D7B5E9C7_C41D_95BB_41E0_E2DCDDD71E36",
 "width": "100%",
 "scrollBarWidth": 10,
 "minHeight": 0,
 "paddingLeft": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 10,
 "minWidth": 0,
 "height": "50%",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:justify;\"><SPAN STYLE=\"letter-spacing:0px;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:14px;\">This is where The Disruptors Den organizes its engaging coffee meetups, hosted at ALX. The space is designed to encourage open dialogue and idea-sharing, making it the perfect setting for entrepreneurs and innovators to connect. With its relaxed ambiance and collaborative vibe, it has become a hub for fostering meaningful conversations and inspiring new ideas within the startup community.</SPAN></SPAN></DIV></div>",
 "data": {
  "name": "HTMLText17729"
 },
 "scrollBarVisible": "rollOver",
 "paddingRight": 10,
 "borderRadius": 0
},
{
 "class": "Container",
 "paddingBottom": 0,
 "id": "container_D0FA6E15_C416_AEEB_41B3_6DB4A3D0CF3A",
 "contentOpaque": false,
 "width": "100%",
 "children": [
  "this.viewer_uidD0FA9E13_C416_AEEF_41E2_0D015A777694",
  {
   "class": "Container",
   "paddingBottom": 0,
   "left": 0,
   "verticalAlign": "bottom",
   "right": 0,
   "contentOpaque": true,
   "children": [
    "this.htmltext_D0FCBE17_C416_AF17_41E7_8D77F40CD2BB"
   ],
   "backgroundColorRatios": [],
   "minHeight": 20,
   "paddingLeft": 0,
   "scrollBarWidth": 7,
   "scrollBarMargin": 2,
   "backgroundColor": [],
   "bottom": 0,
   "shadow": false,
   "borderSize": 0,
   "paddingTop": 0,
   "minWidth": 20,
   "backgroundOpacity": 0.3,
   "scrollBarOpacity": 0.5,
   "propagateClick": false,
   "scrollBarColor": "#FFFFFF",
   "backgroundColorDirection": "vertical",
   "overflow": "scroll",
   "data": {
    "name": "Container22839"
   },
   "scrollBarVisible": "rollOver",
   "height": "30%",
   "horizontalAlign": "left",
   "paddingRight": 0,
   "gap": 10,
   "borderRadius": 0,
   "layout": "vertical"
  },
  "this.component_D080FE1B_C416_AF18_41DC_B2618CD7CDEC",
  "this.component_D0808E1B_C416_AF18_41DA_6F000406971E"
 ],
 "backgroundColorRatios": [],
 "verticalAlign": "top",
 "minHeight": 20,
 "paddingLeft": 0,
 "scrollBarMargin": 2,
 "backgroundColor": [],
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 20,
 "backgroundOpacity": 0.3,
 "scrollBarWidth": 10,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "backgroundColorDirection": "vertical",
 "overflow": "scroll",
 "data": {
  "name": "Container22838"
 },
 "scrollBarVisible": "rollOver",
 "height": "50%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "gap": 10,
 "borderRadius": 0,
 "layout": "absolute"
},
{
 "class": "HTMLText",
 "paddingBottom": 10,
 "id": "htmlText_D51C0128_C436_92B3_41E2_3B4BE85DEE18",
 "width": "100%",
 "scrollBarWidth": 10,
 "minHeight": 0,
 "paddingLeft": 10,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 10,
 "minWidth": 0,
 "height": "50%",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:justify;\"><SPAN STYLE=\"letter-spacing:0px;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:14px;\">Step into the heart of entrepreneurial growth and collaboration! This space hosted our transformative Founder Academy training sessions, where bright minds gathered to explore innovative ideas and tackle real-world challenges. Industry Experience shared during a memorable guest interview, where an accomplished entrepreneur inspired us with their journey and insights.</SPAN></SPAN></DIV></div>",
 "data": {
  "name": "HTMLText10105"
 },
 "scrollBarVisible": "rollOver",
 "paddingRight": 10,
 "borderRadius": 0
},
{
 "maps": [
  {
   "hfov": 16.88,
   "yaw": -12.83,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -16.94
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_B81C4E01_AC1C_2D61_41D7_EA5B70E0BD9A",
   "pitch": -16.94,
   "yaw": -12.83,
   "hfov": 16.88,
   "distance": 100
  }
 ],
 "enabledInCardboard": true,
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 2)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_BE48E842_AC24_35E5_41D7_6E2B4B745147",
 "data": {
  "label": "Arrow 04b"
 }
},
{
 "maps": [
  {
   "hfov": 4.67,
   "yaw": -54.45,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0_HS_2_0_0_map.gif",
      "width": 17,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -19.76
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.67,
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0_HS_2_0.png",
      "width": 83,
      "class": "ImageResourceLevel",
      "height": 78
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -19.76,
   "yaw": -54.45
  }
 ],
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.showWindow(this.window_D51DD127_C436_92BD_41D8_A4230738FA81, null, false); this.playList_D0FAEE0D_C416_AEF8_41E0_51BDD9166041.set('selectedIndex', 0); ",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_D5495BA7_C436_75B0_41E2_61017A144767",
 "data": {
  "label": "Image"
 }
},
{
 "maps": [
  {
   "hfov": 5.53,
   "yaw": -56.61,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0_HS_3_0_0_map.gif",
      "width": 22,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0.51
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.53,
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0_HS_3_0.png",
      "width": 93,
      "class": "ImageResourceLevel",
      "height": 66
     }
    ],
    "class": "ImageResource"
   },
   "pitch": 0.51,
   "yaw": -56.61
  }
 ],
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.showWindow(this.window_D7B99791_C42A_9DB7_41E0_3838CB3AA7A8, null, false); this.playList_D0802E1C_C416_AF18_41E8_0A6C78E491C5.set('selectedIndex', 0); ",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_D09D1A0B_C435_9695_41A9_676167C69BFD",
 "data": {
  "label": "Image"
 }
},
{
 "hfov": 43.5,
 "inertia": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "image": {
  "levels": [
   {
    "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0.jpg",
    "width": 640,
    "class": "ImageResourceLevel",
    "height": 640
   }
  ],
  "class": "ImageResource"
 },
 "rotate": false,
 "id": "panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_tcap0",
 "distance": 50
},
{
 "media": "this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE",
 "class": "PhotoAlbumPlayListItem",
 "begin": "this.updateMediaLabelFromPlayList(this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_AlbumPlayList, this.htmltext_D0836E1E_C416_AF19_41C7_377759D46B90, this.albumitem_D083EE1D_C416_AF18_41D2_E264A7DA7593); this.loopAlbum(this.playList_D0802E1C_C416_AF18_41E8_0A6C78E491C5, 0)",
 "player": "this.viewer_uidD083CE1D_C416_AF18_41C6_5886F09A919APhotoAlbumPlayer",
 "id": "albumitem_D083EE1D_C416_AF18_41D2_E264A7DA7593"
},
{
 "maps": [
  {
   "hfov": 15.87,
   "yaw": 9.61,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_1_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -25.93
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_B81E8DF6_AC1C_2EA3_41DB_515FF477381D",
   "pitch": -25.93,
   "yaw": 9.61,
   "hfov": 15.87,
   "distance": 100
  }
 ],
 "enabledInCardboard": true,
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 1)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_BD0893F9_AC24_5A9A_41D0_1029E708FDCA",
 "data": {
  "label": "Arrow 04b"
 }
},
{
 "hfov": 43.5,
 "inertia": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "image": {
  "levels": [
   {
    "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0.jpg",
    "width": 640,
    "class": "ImageResourceLevel",
    "height": 640
   }
  ],
  "class": "ImageResource"
 },
 "rotate": false,
 "id": "panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0",
 "distance": 50
},
{
 "items": [
  {
   "media": "this.album_D032CC50_C415_935F_41C2_BC5556378C34_0",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.30",
     "class": "PhotoCameraPosition",
     "y": "0.72",
     "zoomFactor": 1.1
    },
    "easing": "linear",
    "initialPosition": {
     "x": "0.50",
     "class": "PhotoCameraPosition",
     "y": "0.50",
     "zoomFactor": 1
    },
    "scaleMode": "fit_outside"
   }
  },
  {
   "media": "this.album_D032CC50_C415_935F_41C2_BC5556378C34_1",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.48",
     "class": "PhotoCameraPosition",
     "y": "0.47",
     "zoomFactor": 1.1
    },
    "easing": "linear",
    "initialPosition": {
     "x": "0.50",
     "class": "PhotoCameraPosition",
     "y": "0.50",
     "zoomFactor": 1
    },
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_D032CC50_C415_935F_41C2_BC5556378C34_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "maps": [
  {
   "hfov": 16.84,
   "yaw": -5.76,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -17.42
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_B81C1E02_AC1C_2D63_41DD_DEE406ABDB00",
   "pitch": -17.42,
   "yaw": -5.76,
   "hfov": 16.84,
   "distance": 100
  }
 ],
 "enabledInCardboard": true,
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 3)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_BCCF0CB0_AC24_2EA3_41E1_78E11CAEE89D",
 "data": {
  "label": "Arrow 04b"
 }
},
{
 "hfov": 43.5,
 "inertia": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "image": {
  "levels": [
   {
    "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0.jpg",
    "width": 640,
    "class": "ImageResourceLevel",
    "height": 640
   }
  ],
  "class": "ImageResource"
 },
 "rotate": false,
 "id": "panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_tcap0",
 "distance": 50
},
{
 "items": [
  {
   "media": "this.album_D5340915_C437_92B0_41DA_EFB9D499751C_0",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.65",
     "class": "PhotoCameraPosition",
     "y": "0.75",
     "zoomFactor": 1.1
    },
    "easing": "linear",
    "initialPosition": {
     "x": "0.50",
     "class": "PhotoCameraPosition",
     "y": "0.50",
     "zoomFactor": 1
    },
    "scaleMode": "fit_outside"
   }
  },
  {
   "media": "this.album_D5340915_C437_92B0_41DA_EFB9D499751C_1",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.35",
     "class": "PhotoCameraPosition",
     "y": "0.68",
     "zoomFactor": 1.1
    },
    "easing": "linear",
    "initialPosition": {
     "x": "0.50",
     "class": "PhotoCameraPosition",
     "y": "0.50",
     "zoomFactor": 1
    },
    "scaleMode": "fit_outside"
   }
  },
  {
   "media": "this.album_D5340915_C437_92B0_41DA_EFB9D499751C_2",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.63",
     "class": "PhotoCameraPosition",
     "y": "0.30",
     "zoomFactor": 1.1
    },
    "easing": "linear",
    "initialPosition": {
     "x": "0.50",
     "class": "PhotoCameraPosition",
     "y": "0.50",
     "zoomFactor": 1
    },
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_D5340915_C437_92B0_41DA_EFB9D499751C_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "maps": [
  {
   "hfov": 17.01,
   "yaw": -8.71,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0_HS_0_0_0_map.gif",
      "width": 27,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -15.43
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_B81DAE02_AC1C_2D63_41E4_2D96A971B136",
   "pitch": -15.43,
   "yaw": -8.71,
   "hfov": 17.01,
   "distance": 100
  }
 ],
 "enabledInCardboard": true,
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.mainPlayList.set('selectedIndex', 4)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_BCE5B4D1_AC24_5EE5_41D0_7F6EAC2A425F",
 "data": {
  "label": "Arrow 04b"
 }
},
{
 "maps": [
  {
   "hfov": 5.3,
   "yaw": 64.55,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0_HS_1_0_0_map.gif",
      "width": 16,
      "class": "ImageResourceLevel",
      "height": 17
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -14.11
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.3,
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0_HS_1_0.png",
      "width": 92,
      "class": "ImageResourceLevel",
      "height": 100
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -14.11,
   "yaw": 64.55
  }
 ],
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.showWindow(this.window_D7B7A9C0_C41D_95B5_41E1_105E26EB10EA, null, false); this.playList_D085EE23_C416_AF2F_41E7_F65EBF8DCD42.set('selectedIndex', 0); ",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_D6D42537_C41E_B2DD_41C1_485B7CF6CA69",
 "data": {
  "label": "Image"
 }
},
{
 "maps": [
  {
   "hfov": 5.3,
   "yaw": -55.43,
   "class": "HotspotPanoramaOverlayMap",
   "image": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0_HS_2_0_0_map.gif",
      "width": 18,
      "class": "ImageResourceLevel",
      "height": 16
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -5.39
  }
 ],
 "rollOverDisplay": false,
 "class": "HotspotPanoramaOverlay",
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.3,
   "distance": 50,
   "image": {
    "levels": [
     {
      "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0_HS_2_0.png",
      "width": 89,
      "class": "ImageResourceLevel",
      "height": 76
     }
    ],
    "class": "ImageResource"
   },
   "pitch": -5.39,
   "yaw": -55.43
  }
 ],
 "enabledInCardboard": true,
 "useHandCursor": true,
 "areas": [
  {
   "click": "this.showPopupPanoramaOverlay(this.popup_D7D98D7F_C475_AD35_41C5_7A71145FC61E, {'rollOverIconColor':'#666666','paddingBottom':5,'backgroundOpacity':0.3,'pressedIconWidth':20,'pressedBackgroundColorRatios':[0,0.09803921568627451,1],'pressedIconHeight':20,'borderSize':0,'pressedBackgroundOpacity':0.3,'rollOverBackgroundOpacity':0.3,'rollOverIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'pressedBorderColor':'#000000','pressedIconLineWidth':5,'pressedIconColor':'#888888','backgroundColorRatios':[0,0.09803921568627451,1],'backgroundColorDirection':'vertical','iconColor':'#000000','paddingTop':5,'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'iconHeight':20,'rollOverBorderColor':'#000000','rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'borderColor':'#000000','rollOverBackgroundColorDirection':'vertical','pressedBorderSize':0,'rollOverBorderSize':0,'paddingLeft':5,'paddingRight':5,'rollOverIconWidth':20,'rollOverIconHeight':20,'pressedBackgroundColorDirection':'vertical','backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconLineWidth':5,'iconWidth':20}, this.ImageResource_D16F890E_C477_B2D4_41CA_69165E1CDEEB, null, null, null, null, false)",
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea"
  }
 ],
 "id": "overlay_D01F00C8_C46B_9359_41A4_B45CA7815F33",
 "data": {
  "label": "Image"
 }
},
{
 "hfov": 43.5,
 "inertia": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "image": {
  "levels": [
   {
    "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_tcap0.jpg",
    "width": 640,
    "class": "ImageResourceLevel",
    "height": 640
   }
  ],
  "class": "ImageResource"
 },
 "rotate": false,
 "id": "panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_tcap0",
 "distance": 50
},
{
 "items": [
  {
   "media": "this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_0",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.48",
     "class": "PhotoCameraPosition",
     "y": "0.42",
     "zoomFactor": 1.1
    },
    "easing": "linear",
    "initialPosition": {
     "x": "0.50",
     "class": "PhotoCameraPosition",
     "y": "0.50",
     "zoomFactor": 1
    },
    "scaleMode": "fit_outside"
   }
  },
  {
   "media": "this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_1",
   "class": "PhotoPlayListItem",
   "camera": {
    "duration": 5000,
    "class": "MovementPhotoCamera",
    "targetPosition": {
     "x": "0.68",
     "class": "PhotoCameraPosition",
     "y": "0.38",
     "zoomFactor": 1.1
    },
    "easing": "linear",
    "initialPosition": {
     "x": "0.50",
     "class": "PhotoCameraPosition",
     "y": "0.50",
     "zoomFactor": 1
    },
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_AlbumPlayList",
 "class": "PhotoPlayList"
},
{
 "media": "this.album_D032CC50_C415_935F_41C2_BC5556378C34",
 "class": "PhotoAlbumPlayListItem",
 "begin": "this.updateMediaLabelFromPlayList(this.album_D032CC50_C415_935F_41C2_BC5556378C34_AlbumPlayList, this.htmltext_D0853E27_C416_AF37_41E7_93935E4DE11B, this.albumitem_D0854E23_C416_AF2F_41D3_02955A138C8B); this.loopAlbum(this.playList_D085EE23_C416_AF2F_41E7_F65EBF8DCD42, 0)",
 "player": "this.viewer_uidD0858E23_C416_AF2F_41E0_006E4DDE1A65PhotoAlbumPlayer",
 "id": "albumitem_D0854E23_C416_AF2F_41D3_02955A138C8B"
},
{
 "paddingBottom": 0,
 "transitionDuration": 500,
 "id": "viewer_uidD083CE1D_C416_AF18_41C6_5886F09A919A",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipTextShadowBlurRadius": 3,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "progressOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "paddingLeft": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipBorderColor": "#767676",
 "borderSize": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipPaddingBottom": 4,
 "height": "100%",
 "toolTipBackgroundColor": "#F6F6F6",
 "playbackBarHeadShadow": true,
 "firstTransitionDuration": 0,
 "toolTipTextShadowOpacity": 0,
 "vrPointerSelectionTime": 2000,
 "progressBottom": 2,
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBackgroundColorDirection": "vertical",
 "progressHeight": 10,
 "playbackBarLeft": 0,
 "progressBackgroundOpacity": 1,
 "progressBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarProgressBorderColor": "#000000",
 "paddingRight": 0,
 "playbackBarBottom": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "class": "ViewerArea",
 "toolTipBorderRadius": 3,
 "toolTipPaddingTop": 4,
 "vrPointerColor": "#FFFFFF",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarHeadHeight": 15,
 "progressBarOpacity": 1,
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressLeft": 0,
 "toolTipFontWeight": "normal",
 "playbackBarHeight": 10,
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "progressBorderSize": 0,
 "minHeight": 50,
 "playbackBarHeadWidth": 6,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "toolTipBorderSize": 1,
 "toolTipDisplayTime": 600,
 "shadow": false,
 "toolTipPaddingLeft": 6,
 "displayTooltipInTouchScreens": true,
 "playbackBarBackgroundColorDirection": "vertical",
 "minWidth": 100,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "paddingTop": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "toolTipPaddingRight": 6,
 "playbackBarHeadOpacity": 1,
 "progressBarBorderSize": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowColor": "#333333",
 "progressBarBorderColor": "#000000",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipShadowVerticalLength": 0,
 "data": {
  "name": "ViewerArea22843"
 },
 "toolTipFontSize": "1.11vmin",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipFontFamily": "Arial",
 "progressBarBorderRadius": 0,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "HTMLText",
 "paddingBottom": 5,
 "id": "htmltext_D0836E1E_C416_AF19_41C7_377759D46B90",
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "paddingLeft": 10,
 "scrollBarMargin": 2,
 "backgroundColor": [
  "#000000"
 ],
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 5,
 "minWidth": 0,
 "backgroundOpacity": 0.7,
 "scrollBarWidth": 10,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "backgroundColorDirection": "vertical",
 "html": "",
 "data": {
  "name": "HTMLText22846"
 },
 "scrollBarVisible": "rollOver",
 "paddingRight": 10,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "IconButton",
 "paddingBottom": 0,
 "id": "component_D082DE1F_C416_AF17_41E7_3BA346521063",
 "left": 10,
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "iconURL": "skin/album_left.png",
 "verticalAlign": "middle",
 "transparencyActive": false,
 "borderRadius": 0,
 "minHeight": 0,
 "paddingLeft": 0,
 "top": "45%",
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "mode": "push",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "click": "this.loadFromCurrentMediaPlayList(this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_AlbumPlayList, -1)",
 "horizontalAlign": "center",
 "data": {
  "name": "IconButton22847"
 },
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "paddingRight": 0,
 "cursor": "hand"
},
{
 "visible": false,
 "class": "IconButton",
 "paddingBottom": 0,
 "id": "component_D082EE1F_C416_AF17_41E5_B5C010C2F934",
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "right": 10,
 "transparencyActive": false,
 "iconURL": "skin/album_right.png",
 "verticalAlign": "middle",
 "borderRadius": 0,
 "minHeight": 0,
 "paddingLeft": 0,
 "top": "45%",
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "mode": "push",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "click": "this.loadFromCurrentMediaPlayList(this.album_D6BE0EA4_C42A_AF9F_41D6_5546C99495AE_AlbumPlayList, 1)",
 "horizontalAlign": "center",
 "data": {
  "name": "IconButton22848"
 },
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "paddingRight": 0,
 "cursor": "hand"
},
{
 "class": "AnimatedImageResource",
 "frameCount": 24,
 "colCount": 4,
 "id": "AnimatedImageResource_B81AEE03_AC1C_2D61_41D0_882BB6AD353D",
 "levels": [
  {
   "url": "media/panorama_A64880E9_AC1C_769B_41DB_6AA897BCEF55_1_HS_0_0.png",
   "width": 520,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "rowCount": 6,
 "frameDuration": 41
},
{
 "id": "viewer_uidD0FA9E13_C416_AEEF_41E2_0D015A777694PhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "viewerArea": "this.viewer_uidD0FA9E13_C416_AEEF_41E2_0D015A777694"
},
{
 "class": "AnimatedImageResource",
 "frameCount": 21,
 "colCount": 4,
 "id": "AnimatedImageResource_B81D6E03_AC1C_2D61_41D2_B58CE548A150",
 "levels": [
  {
   "url": "media/panorama_A64A12BA_AC1C_3AFE_41D9_ED2CDB08B352_0_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "rowCount": 6,
 "frameDuration": 41
},
{
 "paddingBottom": 0,
 "transitionDuration": 500,
 "id": "viewer_uidD0858E23_C416_AF2F_41E0_006E4DDE1A65",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipTextShadowBlurRadius": 3,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "progressOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "paddingLeft": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipBorderColor": "#767676",
 "borderSize": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipPaddingBottom": 4,
 "height": "100%",
 "toolTipBackgroundColor": "#F6F6F6",
 "playbackBarHeadShadow": true,
 "firstTransitionDuration": 0,
 "toolTipTextShadowOpacity": 0,
 "vrPointerSelectionTime": 2000,
 "progressBottom": 2,
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBackgroundColorDirection": "vertical",
 "progressHeight": 10,
 "playbackBarLeft": 0,
 "progressBackgroundOpacity": 1,
 "progressBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarProgressBorderColor": "#000000",
 "paddingRight": 0,
 "playbackBarBottom": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "class": "ViewerArea",
 "toolTipBorderRadius": 3,
 "toolTipPaddingTop": 4,
 "vrPointerColor": "#FFFFFF",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarHeadHeight": 15,
 "progressBarOpacity": 1,
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressLeft": 0,
 "toolTipFontWeight": "normal",
 "playbackBarHeight": 10,
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "progressBorderSize": 0,
 "minHeight": 50,
 "playbackBarHeadWidth": 6,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "toolTipBorderSize": 1,
 "toolTipDisplayTime": 600,
 "shadow": false,
 "toolTipPaddingLeft": 6,
 "displayTooltipInTouchScreens": true,
 "playbackBarBackgroundColorDirection": "vertical",
 "minWidth": 100,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "paddingTop": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "toolTipPaddingRight": 6,
 "playbackBarHeadOpacity": 1,
 "progressBarBorderSize": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowColor": "#333333",
 "progressBarBorderColor": "#000000",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipShadowVerticalLength": 0,
 "data": {
  "name": "ViewerArea22849"
 },
 "toolTipFontSize": "1.11vmin",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipFontFamily": "Arial",
 "progressBarBorderRadius": 0,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "HTMLText",
 "paddingBottom": 5,
 "id": "htmltext_D0853E27_C416_AF37_41E7_93935E4DE11B",
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "paddingLeft": 10,
 "scrollBarMargin": 2,
 "backgroundColor": [
  "#000000"
 ],
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 5,
 "minWidth": 0,
 "backgroundOpacity": 0.7,
 "scrollBarWidth": 10,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "backgroundColorDirection": "vertical",
 "html": "",
 "data": {
  "name": "HTMLText22852"
 },
 "scrollBarVisible": "rollOver",
 "paddingRight": 10,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "IconButton",
 "paddingBottom": 0,
 "id": "component_D084AE2A_C416_AF39_41D6_6D0549C10FCF",
 "left": 10,
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "iconURL": "skin/album_left.png",
 "verticalAlign": "middle",
 "transparencyActive": false,
 "borderRadius": 0,
 "minHeight": 0,
 "paddingLeft": 0,
 "top": "45%",
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "mode": "push",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "click": "this.loadFromCurrentMediaPlayList(this.album_D032CC50_C415_935F_41C2_BC5556378C34_AlbumPlayList, -1)",
 "horizontalAlign": "center",
 "data": {
  "name": "IconButton22853"
 },
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "paddingRight": 0,
 "cursor": "hand"
},
{
 "visible": false,
 "class": "IconButton",
 "paddingBottom": 0,
 "id": "component_D084BE2A_C416_AF39_41E6_257184DE42E4",
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "right": 10,
 "transparencyActive": false,
 "iconURL": "skin/album_right.png",
 "verticalAlign": "middle",
 "borderRadius": 0,
 "minHeight": 0,
 "paddingLeft": 0,
 "top": "45%",
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "mode": "push",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "click": "this.loadFromCurrentMediaPlayList(this.album_D032CC50_C415_935F_41C2_BC5556378C34_AlbumPlayList, 1)",
 "horizontalAlign": "center",
 "data": {
  "name": "IconButton22854"
 },
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "paddingRight": 0,
 "cursor": "hand"
},
{
 "paddingBottom": 0,
 "transitionDuration": 500,
 "id": "viewer_uidD0FA9E13_C416_AEEF_41E2_0D015A777694",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "toolTipTextShadowBlurRadius": 3,
 "width": "100%",
 "playbackBarBorderRadius": 0,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "playbackBarHeadBorderColor": "#000000",
 "playbackBarHeadShadowVerticalLength": 0,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "progressOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "progressBackgroundColorRatios": [
  0
 ],
 "transitionMode": "blending",
 "paddingLeft": 0,
 "vrPointerSelectionColor": "#FF6600",
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipBorderColor": "#767676",
 "borderSize": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipPaddingBottom": 4,
 "height": "100%",
 "toolTipBackgroundColor": "#F6F6F6",
 "playbackBarHeadShadow": true,
 "firstTransitionDuration": 0,
 "toolTipTextShadowOpacity": 0,
 "vrPointerSelectionTime": 2000,
 "progressBottom": 2,
 "playbackBarHeadShadowHorizontalLength": 0,
 "progressBackgroundColorDirection": "vertical",
 "progressHeight": 10,
 "playbackBarLeft": 0,
 "progressBackgroundOpacity": 1,
 "progressBorderColor": "#000000",
 "playbackBarOpacity": 1,
 "playbackBarProgressBorderColor": "#000000",
 "paddingRight": 0,
 "playbackBarBottom": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "class": "ViewerArea",
 "toolTipBorderRadius": 3,
 "toolTipPaddingTop": 4,
 "vrPointerColor": "#FFFFFF",
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarHeadHeight": 15,
 "progressBarOpacity": 1,
 "toolTipOpacity": 1,
 "toolTipShadowSpread": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipShadowBlurRadius": 3,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "progressLeft": 0,
 "toolTipFontWeight": "normal",
 "playbackBarHeight": 10,
 "toolTipShadowHorizontalLength": 0,
 "playbackBarProgressOpacity": 1,
 "playbackBarBorderSize": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "progressBorderSize": 0,
 "minHeight": 50,
 "playbackBarHeadWidth": 6,
 "progressBorderRadius": 0,
 "toolTipFontColor": "#606060",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "toolTipBorderSize": 1,
 "toolTipDisplayTime": 600,
 "shadow": false,
 "toolTipPaddingLeft": 6,
 "displayTooltipInTouchScreens": true,
 "playbackBarBackgroundColorDirection": "vertical",
 "minWidth": 100,
 "playbackBarBackgroundOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "playbackBarRight": 0,
 "playbackBarProgressBorderSize": 0,
 "paddingTop": 0,
 "progressBarBackgroundColorRatios": [
  0
 ],
 "propagateClick": false,
 "toolTipPaddingRight": 6,
 "playbackBarHeadOpacity": 1,
 "progressBarBorderSize": 0,
 "toolTipShadowOpacity": 1,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowColor": "#333333",
 "progressBarBorderColor": "#000000",
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipShadowVerticalLength": 0,
 "data": {
  "name": "ViewerArea22837"
 },
 "toolTipFontSize": "1.11vmin",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipFontFamily": "Arial",
 "progressBarBorderRadius": 0,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "HTMLText",
 "paddingBottom": 5,
 "id": "htmltext_D0FCBE17_C416_AF17_41E7_8D77F40CD2BB",
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "minHeight": 0,
 "paddingLeft": 10,
 "scrollBarMargin": 2,
 "backgroundColor": [
  "#000000"
 ],
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 5,
 "minWidth": 0,
 "backgroundOpacity": 0.7,
 "scrollBarWidth": 10,
 "propagateClick": false,
 "scrollBarColor": "#000000",
 "backgroundColorDirection": "vertical",
 "html": "",
 "data": {
  "name": "HTMLText22840"
 },
 "scrollBarVisible": "rollOver",
 "paddingRight": 10,
 "borderRadius": 0
},
{
 "visible": false,
 "class": "IconButton",
 "paddingBottom": 0,
 "id": "component_D080FE1B_C416_AF18_41DC_B2618CD7CDEC",
 "left": 10,
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "iconURL": "skin/album_left.png",
 "verticalAlign": "middle",
 "transparencyActive": false,
 "borderRadius": 0,
 "minHeight": 0,
 "paddingLeft": 0,
 "top": "45%",
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "mode": "push",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "click": "this.loadFromCurrentMediaPlayList(this.album_D5340915_C437_92B0_41DA_EFB9D499751C_AlbumPlayList, -1)",
 "horizontalAlign": "center",
 "data": {
  "name": "IconButton22841"
 },
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "paddingRight": 0,
 "cursor": "hand"
},
{
 "visible": false,
 "class": "IconButton",
 "paddingBottom": 0,
 "id": "component_D0808E1B_C416_AF18_41DA_6F000406971E",
 "hideEffect": {
  "duration": 250,
  "class": "FadeOutEffect",
  "easing": "cubic_in_out"
 },
 "right": 10,
 "transparencyActive": false,
 "iconURL": "skin/album_right.png",
 "verticalAlign": "middle",
 "borderRadius": 0,
 "minHeight": 0,
 "paddingLeft": 0,
 "top": "45%",
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 0,
 "mode": "push",
 "backgroundOpacity": 0,
 "propagateClick": false,
 "click": "this.loadFromCurrentMediaPlayList(this.album_D5340915_C437_92B0_41DA_EFB9D499751C_AlbumPlayList, 1)",
 "horizontalAlign": "center",
 "data": {
  "name": "IconButton22842"
 },
 "showEffect": {
  "duration": 250,
  "class": "FadeInEffect",
  "easing": "cubic_in_out"
 },
 "paddingRight": 0,
 "cursor": "hand"
},
{
 "class": "AnimatedImageResource",
 "frameCount": 21,
 "colCount": 4,
 "id": "AnimatedImageResource_B81C4E01_AC1C_2D61_41D7_EA5B70E0BD9A",
 "levels": [
  {
   "url": "media/panorama_A64AC54F_AC1C_FF96_41D0_0201A5F6108B_0_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "rowCount": 6,
 "frameDuration": 41
},
{
 "id": "viewer_uidD083CE1D_C416_AF18_41C6_5886F09A919APhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "viewerArea": "this.viewer_uidD083CE1D_C416_AF18_41C6_5886F09A919A"
},
{
 "class": "AnimatedImageResource",
 "frameCount": 21,
 "colCount": 4,
 "id": "AnimatedImageResource_B81E8DF6_AC1C_2EA3_41DB_515FF477381D",
 "levels": [
  {
   "url": "media/panorama_A7349E10_AC1C_2D8A_41BC_0E3D4414C591_1_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "rowCount": 6,
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "frameCount": 21,
 "colCount": 4,
 "id": "AnimatedImageResource_B81C1E02_AC1C_2D63_41DD_DEE406ABDB00",
 "levels": [
  {
   "url": "media/panorama_A659D50D_AC1C_3F9A_41E0_EA40AD7791BA_0_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "rowCount": 6,
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "frameCount": 21,
 "colCount": 4,
 "id": "AnimatedImageResource_B81DAE02_AC1C_2D63_41E4_2D96A971B136",
 "levels": [
  {
   "url": "media/panorama_A651C4CF_AC1C_5E96_41D9_E84A4B93E29F_0_HS_0_0.png",
   "width": 480,
   "class": "ImageResourceLevel",
   "height": 420
  }
 ],
 "rowCount": 6,
 "frameDuration": 41
},
{
 "id": "viewer_uidD0858E23_C416_AF2F_41E0_006E4DDE1A65PhotoAlbumPlayer",
 "class": "PhotoAlbumPlayer",
 "viewerArea": "this.viewer_uidD0858E23_C416_AF2F_41E0_006E4DDE1A65"
}],
 "defaultVRPointer": "laser",
 "verticalAlign": "top",
 "vrPolyfillScale": 0.5,
 "mobileMipmappingEnabled": false,
 "minHeight": 20,
 "paddingLeft": 0,
 "scrollBarMargin": 2,
 "scrollBarOpacity": 0.5,
 "shadow": false,
 "borderSize": 0,
 "paddingTop": 0,
 "minWidth": 20,
 "scrollBarWidth": 10,
 "propagateClick": false,
 "mouseWheelEnabled": true,
 "scrollBarColor": "#000000",
 "overflow": "visible",
 "data": {
  "name": "Player471"
 },
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "horizontalAlign": "left",
 "downloadEnabled": false,
 "paddingRight": 0,
 "gap": 10,
 "borderRadius": 0,
 "layout": "absolute"
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
