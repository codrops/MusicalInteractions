/**
 * guitar.js
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
	 * Guitar obj. 5 strings (E2, A2, D3, G3, B3, E4).
	 */
	function Guitar(el) {
		this.el = el;
		this.strings = [].slice.call(this.el.querySelectorAll('.guitar__string-hover'));
		this.midiCode = 24; // Check http://www.ccarh.org/courses/253/handout/gminstruments/
		this.openChords = false;
		// Some random chords to choose from depending on the mouse position (x-axis) that the user starts to "drag".
		this.chords = [
			{ name: 'DMaj', scale: [0,0,0,2,3,2] },
			{ name: 'AMaj', scale: [0,0,2,2,2,0] },
			{ name: 'F#Maj', scale: [2,4,4,3,2,2] },
			{ name: 'A#Maj', scale: [0,1,3,3,3,1] },
			{ name: 'EMaj', scale: [0,2,2,1,0,0] },
			{ name: 'CMaj', scale: [0,3,2,0,1,0] },
			{ name: 'FMaj', scale: [1,3,3,2,1,1] },
			{ name: 'GMaj', scale: [3,2,0,0,0,3] },
			{ name: 'AMin', scale: [0,0,2,2,1,0] },
			{ name: 'BMaj', scale: [0,2,4,4,4,2] },
			{ name: 'DMin', scale: [0,0,0,2,3,1] },
			{ name: 'EMin', scale: [0,2,2,0,0,0] },
			{ name: 'FMin', scale: [1,3,3,1,1,1] },
			{ name: 'BMin', scale: [0,2,4,4,3,2] } 
		];
		this.chordsTotal = this.chords.length;
		this.currentChord = 0;
		this._initEvents();
	}

	Guitar.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup'
			};

		this.strings.forEach(function(string, pos) {
			string.addEventListener(evs.down, function(ev) {
				self.mdown = true;
				// Pick a different chord,
				self._changeChord(ev.pageX);
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
					if( !self.mdown ) {
						return false;
					}

					var note = self._getNote(string, pos);
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
			this.el.addEventListener('mousedown', function(ev) {
				if( !self.mdown ) {
					self.mdown = true;
					// Pick a different chord,
					self._changeChord(ev.pageX);
				}
			});
			this.el.addEventListener('mouseup', function(ev) { self.mdown = false; });
			this.el.addEventListener('mouseleave', function(ev) { self.mdown = false; });
		}
	};

	Guitar.prototype._changeChord = function(xPos) {
		var chord = Math.floor(xPos/(this.el.offsetWidth/this.chordsTotal));
		this.currentChord = chord;
	}

	Guitar.prototype._getNote = function(string, position) {
		var note;
		if( this.openChords ) {
			note = string.getAttribute('note:id');
		}
		else {
			var addon = this.chords[this.currentChord].scale[position];
			note = addon != null ? parseInt(string.getAttribute('note:id')) + addon : addon;
		}
		return note;
	};

	Guitar.prototype._play = function(note, status, string) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits
		
		MIDI.programChange(0, this.midiCode);
		
		if( status === 'on' ) {
			MIDI.noteOn(channel, note, velocity, delay);
			anime({
				targets: string.parentNode,
				duration: 2600,
				easing: 'easeOutElastic',
				elasticity: 1000,
				translateY: [-2,0]
			});
		}
		else {
			MIDI.noteOff(channel, note, delay+4);
		}
	};

	window.Guitar = Guitar;

})(window);