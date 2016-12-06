/**
 * chimes.js
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
	 * Chimes obj. Large Chimes is tuned to (B4 ... B5#) and small to B5, D6, E6, G6flat, B6.
	 */
	function Chimes(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this.tubes = [].slice.call(this.el.querySelectorAll('.chime__pipe'));
		this.midiCode = 14; // Check http://www.ccarh.org/courses/253/handout/gminstruments/
		this._initEvents();
	}

	/**
	 * Chimes options.
	 */
	Chimes.prototype.options = {
		triggeredOnHover: false
	};

	Chimes.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup'
			};

		this.tubes.forEach(function(tube) {
			if( !self.options.triggeredOnHover ) {
				tube.addEventListener(evs.down, function(ev) {
					var note = self._getNote(tube);
					self.mdown = true;

					if( !isMobile ) {
						self.mouseLeaveFn = function(ev) {
							self._play(note, 'off');
							this.removeEventListener('mouseleave', self.mouseLeaveFn);
						};
						tube.addEventListener('mouseleave', self.mouseLeaveFn);
					}
					
					self._play(note, 'on', tube);
				});

				tube.addEventListener(evs.up, function(ev) {
					if( !self.mdown && !isMobile ) {
						return false;
					}
					self.mdown = false;
					
					var note = self._getNote(tube);
					if( !isMobile ) {
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					}
					self._play(note, 'off');
				});
			}

			if( !isMobile ) {
				tube.addEventListener('mouseenter', function(ev) {
					if( !self.mdown && !self.options.triggeredOnHover ) {
						return false;
					}

					var note = self._getNote(tube);
					self.mouseLeaveFn = function(ev) {
						self._play(note, 'off');
						this.removeEventListener('mouseleave', self.mouseLeaveFn);
					};
					
					tube.addEventListener('mouseleave', self.mouseLeaveFn);
					self._play(note, 'on', tube);
				});
			}
		});
		
		if( !isMobile && !self.options.triggeredOnHover ) {
			this.el.addEventListener('mousedown', function(ev) { self.mdown = true; });
			this.el.addEventListener('mouseup', function(ev) { self.mdown = false; });
			this.el.addEventListener('mouseleave', function(ev) { self.mdown = false; });
		}
	};

	Chimes.prototype._getNote = function(tube) {
		return tube.getAttribute('note:id');
	};

	Chimes.prototype._play = function(note, status, tube) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits
		
		MIDI.programChange(0, this.midiCode);

		if( status === 'on' ) {
			MIDI.noteOn(channel, note, velocity, delay);
			
			anime({
				targets: tube,
				duration: 1500,
				easing: 'easeOutElastic',
				elasticity: 600,
				rotateZ: [-1.7,0]
			});
			anime({
				targets: tube.previousElementSibling,
				duration: 1500,
				easing: 'easeOutElastic',
				elasticity: 600,
				rotateZ: [-6,0]
			});
		}
		else {
			MIDI.noteOff(channel, note, delay+4);
		}
	};

	Chimes.prototype.playSequence = function(sequence) {
		sequence = sequence || [74,69,67,65,62];
		var delay = 0;

		for( var i = 0, len = sequence.length; i <= len -1; ++i ) {
			MIDI.programChange(0, this.midiCode);
			MIDI.noteOn(0, sequence[i]+21, 127, delay);
			MIDI.noteOff(0, sequence[i]+21, 127, delay+4);
			delay+=.05;
		}
	};

	window.Chimes = Chimes;

})(window);