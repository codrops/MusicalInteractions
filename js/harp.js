/**
 * harp.js
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
	 * Harp obj. 47 strings (C1, ..., G7).
	 */
	function Harp(el, options) {
		this.el = el;
		this.strings = [].slice.call(this.el.querySelectorAll('.harp__string-hover'));
		this.midiCode = 46; // Check http://www.ccarh.org/courses/253/handout/gminstruments/
		this._initEvents();
	}

	Harp.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup'
			};

		this.strings.forEach(function(string, pos) {
			string.addEventListener(evs.down, function(ev) {
				self.mdown = true;

				var note = self._getNote(string, pos);
				
				if( !isMobile ) {
					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					string.addEventListener('mouseleave', self.mouseLeaveFn);
				}
				
				self._play(note, 'on', string);
			});

			string.addEventListener(evs.up, function(ev) {
				if( !self.mdown && !isMobile ) {
					return false;
				}
				self.mdown = false;
				var note = self._getNote(string, pos);
				if( !isMobile ) {
					this.removeEventListener('mouseleave', self.mouseLeaveFn);
				}
				self._play(note, 'off');
			});

			if( !isMobile ) {
				string.addEventListener('mouseenter', function(ev) {
					var note = self._getNote(string, pos);
					if( !self.mdown || parseInt(note) === self.currentNote ) {
						return false;
					}

					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					string.addEventListener('mouseleave', self.mouseLeaveFn);
					
					self._play(note, 'on', string);
				});
			}
		});
		
		if( !isMobile ) {
			this.el.addEventListener('mousedown', function(ev) { self.mdown = true; });
			this.el.addEventListener('mouseup', function(ev) { self.mdown = false; });
			this.el.addEventListener('mouseleave', function(ev) { self.mdown = false; });
		}
	};

	Harp.prototype._getNote = function(string) {
		return string.getAttribute('note:id');
	};

	Harp.prototype._play = function(note, status, string) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits
		
		MIDI.programChange(0, this.midiCode);
		
		if( status === 'on' ) {
			this.currentNote = note - 21;
			MIDI.noteOn(channel, note, velocity, delay);
			anime({
				targets: string.parentNode,
				duration: 2600,
				easing: 'easeOutElastic',
				elasticity: 1000,
				translateX: [-1,0]
			});
		}
		else {
			var self = this;
			setTimeout(function() {self.currentNote = -1;}, 100);
			MIDI.noteOff(channel, note, delay+4);
		}
	};

	window.Harp = Harp;

})(window);