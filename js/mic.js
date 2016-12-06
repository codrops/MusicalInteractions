/**
 * mic.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	// From https://www.html5rocks.com/en/tutorials/webaudio/intro/
	function BufferLoader(context, urlList, callback) {
		this.context = context;
		this.urlList = urlList;
		this.onload = callback;
		this.bufferList = new Array();
		this.loadCount = 0;
	}

	BufferLoader.prototype.loadBuffer = function(url, index) {
		// Load buffer asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "arraybuffer";

		var loader = this;

		request.onload = function() {
			// Asynchronously decode the audio file data in request.response
			loader.context.decodeAudioData(request.response, function(buffer) {
				if (!buffer) {
					return;
				}
				loader.bufferList[index] = buffer;
				if (++loader.loadCount == loader.urlList.length) {
					loader.onload(loader.bufferList);
				}
			}, 
			function(error) {
				console.error('decodeAudioData error', error);
			});
		}

		request.onerror = function() {
			console.log('BufferLoader: XHR error');
		}

		request.send();
	}

	BufferLoader.prototype.load = function() {
		for (var i = 0; i < this.urlList.length; ++i)
			this.loadBuffer(this.urlList[i], i);
	}

	/**
	 * Mic obj.
	 */
	function Mic(el) {
		this.el = el;
		this.audioCtx = new AudioContext();
		this._init();
	}

	Mic.prototype._init = function() {
		this.bufferLoader = new BufferLoader(this.audioCtx, ['./sounds/testingvoice.mp3'], this._finishedLoading.bind(this));
		this.bufferLoader.load();
	};

	Mic.prototype._finishedLoading = function(bufferList) {
		this.buffer = bufferList[0];
		this.gainNode = this.audioCtx.createGain();
		this.gainNode.gain.value = 0;
		this.gainNode.connect(this.audioCtx.destination);		
		this.gainNodeOscillator = this.audioCtx.createGain();
		this.gainNodeOscillator.gain.value = 0.5;
		this.gainNodeOscillator.connect(this.audioCtx.destination);	
		this._initEvents();
	};

	Mic.prototype._start = function() {
		this.source = this.audioCtx.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.connect(this.gainNode);
		this.source.start(0);
		var self = this;
		this.sourceEnded = function() {
			if( self.mdown ) {
				self._start();
			}
		};
		this.source.onended = this.sourceEnded;
	};

	Mic.prototype._startOscillator = function() {
		this.oscillator = this.audioCtx.createOscillator();
		this.oscillator.connect(this.gainNodeOscillator);
		this.oscillator.type = 'sine';
		this.oscillator.frequency.value = 1000;
		this.oscillator.start();
	};

	Mic.prototype._stop = function() {
		this.source.stop(0);
		this.gainNode.gain.value = 0;
		this.gainNodeOscillator.gain.value = 0;
		this.oscillator.disconnect(this.gainNodeOscillator);
	};

	Mic.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup',
				move: isMobile ? 'touchmove' : 'mousemove'
			};

		this.mousedownFn = function(ev) {
			self.mdown = true;
			var gainVal = self._getGain(ev); 
			self.gainNode.gain.value = gainVal < 0 ? 0 : gainVal;
			self._start();

			self.gainNodeOscillator.gain.value = gainVal < 0.7 ? 0 : 0.1/0.1*gainVal-0.7;
			self._startOscillator();
		};
		this.el.addEventListener(evs.down, this.mousedownFn);

		this.mouseupFn = function(ev) {
			if( !self.mdown && !isMobile ) {
				return false;
			}
			self.mdown = false;
			self._stop();
		};
		this.el.addEventListener(evs.up, this.mouseupFn);

		this.mousemoveFn = function(ev) {
			if( !self.mdown ) {
				return;
			}
			requestAnimationFrame(function() {
				var gainVal = self._getGain(ev); 
				self.gainNode.gain.value = gainVal < 0 ? 0 : gainVal;

				self.gainNodeOscillator.gain.value = gainVal < 0.7 ? 0 : 0.1/0.1*gainVal-0.7;
			});
		};
		this.el.addEventListener(evs.move, this.mousemoveFn);

		if( !isMobile ) {
			this.mouseleaveFn = function(ev) {
				if( self.mdown ) {
					self.mdown = false;
					self._stop();
				}
			};
			this.el.addEventListener('mouseleave', this.mouseleaveFn);
		}
	};

	Mic.prototype._getGain = function(ev) {
		// Mouse position relative to the document.
		var mousepos = getMousePos(ev),
			elWidth = this.el.offsetWidth,
			elHeight = this.el.offsetHeight,
			// Document scrolls.
			docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop},
			bounds = this.el.getBoundingClientRect(),
			// Mouse position relative to the main element (this.DOM.el).
			relmousepos = { x : mousepos.x - bounds.left - docScrolls.left, y : mousepos.y - bounds.top - docScrolls.top },
			micPoint = {x: elWidth/2, y: elHeight/4},
			areaHypotenuse = Math.floor(Math.sqrt(Math.pow(elWidth,2)+ Math.pow(elHeight,2)))/2,
			d = Math.sqrt(Math.pow(micPoint.x-relmousepos.x,2) + Math.pow(micPoint.y-relmousepos.y,2)),
			gainVal = -1/areaHypotenuse*d +1;

		return gainVal;
	};

	window.Mic = Mic;
	window.AudioContext = window.AudioContext||window.webkitAudioContext;

})(window);