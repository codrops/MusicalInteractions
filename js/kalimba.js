/**
 * kalimba.js
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
	 * Kalimba obj. Tuned to CMaj (C4..C5)
	 */
	function Kalimba(el, options) {
		this.el = el;
		this.tines = [].slice.call(this.el.querySelectorAll('.kalimba__tine'));
		this.midiCode = 108; // Check http://www.ccarh.org/courses/253/handout/gminstruments/
		this._initEvents();
	}

	Kalimba.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup'
			};

		this.tines.forEach(function(tine) {
			tine.addEventListener(evs.down, function(ev) {
				var note = self._getNote(tine);
				self.mdown = true;

				if( !isMobile ) {
					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					tine.addEventListener('mouseleave', self.mouseLeaveFn);
				}
				
				self._play(note, 'on', tine);
			});

			tine.addEventListener(evs.up, function(ev) {
				if( !self.mdown && !isMobile ) {
					return false;
				}
				self.mdown = false;
				var note = self._getNote(tine);
				
				if( !isMobile ) {
					this.removeEventListener('mouseleave', self.mouseLeaveFn);
				}
				self._play(note, 'off');
			});

			if( !isMobile ) {
				tine.addEventListener('mouseenter', function(ev) {
					if( !self.mdown ) {
						return false;
					}

					var note = self._getNote(tine);
					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					tine.addEventListener('mouseleave', self.mouseLeaveFn);
					
					self._play(note, 'on', tine);
				});
			}
		});
		
		if( !isMobile ) {
			this.el.addEventListener('mousedown', function(ev) { self.mdown = true; });
			this.el.addEventListener('mouseup', function(ev) { self.mdown = false; });
			this.el.addEventListener('mouseleave', function(ev) { self.mdown = false; });
		}
	};

	Kalimba.prototype._getNote = function(tine) {
		return tine.getAttribute('note:id');
	};

	Kalimba.prototype._play = function(note, status, tine) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits
		
		MIDI.programChange(0, this.midiCode);

		if( status === 'on' ) {
			MIDI.noteOn(channel, note, velocity, delay);
			
			anime({
				targets: tine,
				duration: 1500,
				easing: 'easeOutElastic',
				elasticity: 900,
				translateY: [-3,0]
			});
		}
		else {
			MIDI.noteOff(channel, note, delay+4);
		}
	};

	window.Kalimba = Kalimba;

})(window);