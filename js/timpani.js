/**
 * timpani.js
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
	 * Timpani (no pedals!) obj. Tuned to F1, A1#, D2, F2
	 */
	function Timpani(el) {
		this.el = el;
		this.drums = [].slice.call(this.el.querySelectorAll('.timpani__drum'));
		this.midiCode = 47; // Check http://www.ccarh.org/courses/253/handout/gminstruments/
		this._initEvents();
	}

	Timpani.prototype._initEvents = function() {
		var self = this;

		var isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup'
			},
			playSequence = function(note, drum) {
				self._play(note, 'on');

				clearTimeout(self.sequencePlaying);
				self.sequencePlaying = setTimeout(function() {
					playSequence(note, drum);
				}, 180);
			};

		this.drums.forEach(function(drum) {
			drum.addEventListener(evs.down, function(ev) {
				var note = self._getNote(drum);
				self.mdown = true;

				if( !isMobile ) {
					self.mouseLeaveFn = function(ev) {
						clearTimeout(self.sequencePlaying);
						self._play(note, 'off');
						self._changeKeyStatus(note);
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					drum.addEventListener('mouseleave', self.mouseLeaveFn);
				}
				
				playSequence(note, drum);
				self._changeKeyStatus(note);
			});

			drum.addEventListener(evs.up, function(ev) {
				if( !self.mdown && !isMobile ) {
					return false;
				}
				self.mdown = false;
				clearTimeout(self.sequencePlaying);
				
				var note = self._getNote(drum);
				if( !isMobile ) {
					this.removeEventListener('mouseleave', self.mouseLeaveFn);
				}
				self._play(note, 'off');
				self._changeKeyStatus(note);
			});

			if( !isMobile ) {
				drum.addEventListener('mouseenter', function(ev) {
					if( !self.mdown ) {
						return false;
					}

					var note = self._getNote(drum);
					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						clearTimeout(self.sequencePlaying);
						self._changeKeyStatus(note);
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					drum.addEventListener('mouseleave', self.mouseLeaveFn);
					
					playSequence(note, drum);
					self._changeKeyStatus(note);
				});
			}
		});

		if( !isMobile ) {
			this.el.addEventListener('mousedown', function(ev) { self.mdown = true; });
			this.el.addEventListener('mouseup', function(ev) { self.mdown = false; clearTimeout(self.sequencePlaying); });
			this.el.addEventListener('mouseleave', function(ev) { self.mdown = false; clearTimeout(self.sequencePlaying); });
		}
	};

	Timpani.prototype._getNote = function(drum) {
		return drum.getAttribute('note:id');
	};

	Timpani.prototype._play = function(note, status) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits
		
		MIDI.programChange(0, this.midiCode);

		if( status === 'on' ) {
			MIDI.noteOn(channel, note, velocity, delay);
		}
		else {
			MIDI.noteOff(channel, note, delay+4);
		}
	};

	Timpani.prototype._getDrumByNote = function(note) {
		var drumEl = this.drums[0];
		for(var i = 0, len = this.drums.length; i <= len-1; ++i) {
			if( this.drums[i].getAttribute('note:id') == note ) {
				drumEl = this.drums[i];
				break;
			}
		}
		return drumEl;
	};

	Timpani.prototype._changeKeyStatus = function(note) {
		var keyEl = this._getDrumByNote(note);
		if( keyEl.classList.contains('timpani__drum--active') ) {
			keyEl.classList.remove('timpani__drum--active');
		}
		else {
			keyEl.classList.add('timpani__drum--active');
		}
	};

	window.Timpani = Timpani;

})(window);