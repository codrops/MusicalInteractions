/**
 * xylophone.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {
	
	/**
	 * Xylophone obj. 44 keys (26 natural + 18 flat).
	 */
	function Xylophone(el) {
		this.el = el;
		this.keyboard = this.el.querySelector('svg.xylophone__inner');
		this.naturalKeys = [].slice.call(this.keyboard.querySelectorAll('.xylophone__keys--natural > rect'));
		this.flatKeys = [].slice.call(this.keyboard.querySelectorAll('.xylophone__keys--flat > rect'));
		this.allkeys = this.naturalKeys.concat(this.flatKeys);
		this.midiCode = 13; // Check http://www.ccarh.org/courses/253/handout/gminstruments/
		
		this._initEvents();
	}

	Xylophone.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup'
			};

		this.allkeys.forEach(function(key) {	
			key.addEventListener(evs.down, function(ev) {
				var note = ev.target.getAttribute('note:id');
				self.mdown = true;
				
				if( !isMobile ) {
					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						self._changeKeyStatus(note);
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					key.addEventListener('mouseleave', self.mouseLeaveFn);
				}
				
				self._play(note, 'on', key);
				self._changeKeyStatus(note);
			});

			key.addEventListener(evs.up, function(ev) {
				if( !self.mdown && !isMobile ) {
					return false;
				}
				self.mdown = false;
				
				var note = ev.target.getAttribute('note:id');
				if( !isMobile ) {
					this.removeEventListener('mouseleave', self.mouseLeaveFn);
				}
				self._play(note, 'off');
				self._changeKeyStatus(note);
			});

			if( !isMobile ) {
				key.addEventListener('mouseenter', function(ev) {
					if( !self.mdown ) {
						return false;
					}

					var note = ev.target.getAttribute('note:id');

					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						self._changeKeyStatus(note);
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					key.addEventListener('mouseleave', self.mouseLeaveFn);
					
					self._play(note, 'on', key);
					self._changeKeyStatus(note);
				});
			}
		});
		
		if( !isMobile ) {
			this.el.addEventListener('mousedown', function(ev) { self.mdown = true; });
			this.el.addEventListener('mouseup', function(ev) { self.mdown = false; });
			this.el.addEventListener('mouseleave', function(ev) { self.mdown = false; });
		}
	};

	Xylophone.prototype._play = function(note, status, key) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits

		MIDI.programChange(0, this.midiCode);
		
		if( status === 'on' ) {
			MIDI.noteOn(channel, note, velocity, delay);

			anime({
				targets: key,
				duration: 1000,
				easing: 'easeOutElastic',
				elasticity: 800,
				translateX: [1,0]
			});
		}
		else {
			MIDI.noteOff(channel, note, delay+.5);
		}
	};

	Xylophone.prototype._getKeyByNote = function(note) {
		var keyEl = this.allkeys[0];
		for(var i = 0, len = this.allkeys.length; i <= len-1; ++i) {
			if( this.allkeys[i].getAttribute('note:id') == note ) {
				keyEl = this.allkeys[i];
				break;
			}
		}
		return keyEl;
	};

	Xylophone.prototype._changeKeyStatus = function(note) {
		var keyEl = this._getKeyByNote(note);
		if( keyEl.classList.contains('xylophone__key--active') ) {
			keyEl.classList.remove('xylophone__key--active');
		}
		else {
			keyEl.classList.add('xylophone__key--active');
		}
	};

	window.Xylophone = Xylophone;

})(window);