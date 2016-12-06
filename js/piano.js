/**
 * piano.js
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
	 * Piano obj. 88 keys piano (52 natural + 36 flat).
	 */
	function Piano(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this.keyboard = this.el.querySelector('svg.piano__inner');
		this.naturalKeys = [].slice.call(this.keyboard.querySelectorAll('.piano__keys--natural > rect'));
		this.flatKeys = [].slice.call(this.keyboard.querySelectorAll('.piano__keys--flat > rect'));
		this.allkeys = this.naturalKeys.concat(this.flatKeys);
		// 52 natural keys and 36 flat/sharp keys
		this.naturalKeysTotal = this.naturalKeys.length;
		this.flatKeysTotal = this.flatKeys.length;
		this.midiCode = 0; // Check http://www.ccarh.org/courses/253/handout/gminstruments/
		this._init();
	}

	/**
	 * Piano options.
	 */
	Piano.prototype.options = {
		layouts: {
			// keys go from 1 (inclusive) to 52 (inclusive). These are the "white" keys!
			// keyboardMapping go from 0 (inclusive) to 87 (inclusive).
			
			// The different layouts:
			keys: {
				// the "default" label should not be changed!
				'default': {
					keys: [1, 52],
					keyboardMapping: {
						// white/natural keys:
						'q' : 15,
						'w' : 17,
						'e' : 19,
						'r' : 20,
						't' : 22,
						'y' : 24,
						'u' : 26,
						'i' : 27,
						'o' : 29,
						'p' : 31,
						'a' : 32,
						's' : 34,
						'd' : 36,
						'f' : 38,
						'g' : 39,
						'h' : 41,
						'j' : 43,
						'k' : 44,
						'l' : 46,
						'z' : 48,
						'x' : 50,
						'c' : 51,
						'v' : 53,
						'b' : 55,
						'n' : 56,
						'm' : 58,
						',' : 60,
						'.' : 62,
						'-' : 63,
						// black/flat/sharp keys:
						'1' : 16,
						'2' : 18,
						'3' : 21,
						'4' : 23,
						'5' : 25,
						'6' : 28,
						'7' : 30,
						'8' : 33,
						'9' : 35,
						'0' : 37,
						'\'' : 40
					}
				},
				'large': {
					keys: [24, 45],
					keyboardMapping: {
						// white/natural keys:
						'y' : 39,
						'u' : 41,
						'i' : 43,
						'o' : 44,
						'p' : 46,
						'a' : 48,
						's' : 50,
						'd' : 51,
						'f' : 53,
						'g' : 55,
						'h' : 56,
						'j' : 58,
						'k' : 60,
						'l' : 62,
						'z' : 63,
						'x' : 65,
						'c' : 67,
						'v' : 68,
						'b' : 70,
						'n' : 72,
						'm' : 74,
						',' : 75,
						// black/flat/sharp keys:
						'1' : 40,
						'2' : 42,
						'3' : 45,
						'4' : 47,
						'5' : 49,
						'6' : 52,
						'7' : 54,
						'8' : 57,
						'9' : 59,
						'0' : 61,
						'\'' : 64,
						'q' : 66,
						'w' : 69,
						'e' : 71,
						'r' : 73,
						't' : 76
					}
				},
				'medium': {
					keys: [24, 38],
					keyboardMapping: {
						// white/natural keys:
						'q' : 39,
						'w' : 41,
						'e' : 43,
						'r' : 44,
						't' : 46,
						'y' : 48,
						'u' : 50,
						'i' : 51,
						'o' : 53,
						'p' : 55,
						'a' : 56,
						's' : 58,
						'd' : 60,
						'f' : 62,
						'g' : 63,
						// black/flat/sharp keys:
						'1' : 40,
						'2' : 42,
						'3' : 45,
						'4' : 47,
						'5' : 49,
						'6' : 52,
						'7' : 54,
						'8' : 57,
						'9' : 59,
						'0' : 61,
						'\'' : 64
					}
				},
				'small': {
					keys: [24, 31],
					keyboardMapping: {
						// white/natural keys:
						'q' : 39,
						'w' : 41,
						'e' : 43,
						'r' : 44,
						't' : 46,
						'y' : 48,
						'u' : 50,
						'i' : 51,
						// black/flat/sharp keys:
						// black/flat/sharp keys:
						'1' : 40,
						'2' : 42,
						'3' : 45,
						'4' : 47,
						'5' : 49,
						'6' : 52
					}
				}
			},
			// Assign the different layouts depending on the screen size.
			mediaQueries: [
				{ key: 'screen and (min-width:120em)', type: 'default' },
				{ key: 'screen and (min-width:50em) and (max-width:120em)', type: 'large' },
				{ key: 'screen and (min-width:30em) and (max-width:50em)', type: 'medium' },
				{ key: 'screen and (min-width:0) and (max-width:30em)', type: 'small' }
			]
		}
	};

	/**
	 * Init.
	 */
	Piano.prototype._init = function() {
		var self = this;
		this.keysRange = this.options.layouts.keys['default'].keys;
		this.keyboardMapping = this.options.layouts.keys['default'].keyboardMapping;
		this._assignKeyboard();

		for(var i = 0, len = this.options.layouts.mediaQueries.length; i <= len-1; ++i) {
			var key = this.options.layouts.mediaQueries[i].key,
				type = this.options.layouts.mediaQueries[i].type;

			(function(i, key, type) {
				enquire.register(key, { 
					match: function() {
						self.keysRange = self.options.layouts.keys[type].keys;
						self._validateKeysRange();
						self._resetKeyboardMappingEv(self.options.layouts.keys[type].keyboardMapping);
					}
				});
			})(i, key, type);
		}

		this._validateKeysRange();
		this._layout();
		this._initEvents();
	};

	Piano.prototype._validateKeysRange = function() {
		// First check if the options.keys interval is valid
		this.keysInterval = {from : this.keysRange[0], to : this.keysRange[1]};
		if( this.keysInterval.from < 1 || this.keysInterval.from > this.naturalKeysTotal ) {
			this.keysInterval.from = 1;
		}
		if( this.keysInterval.to < 1 || this.keysInterval.to > this.naturalKeysTotal ) {
			this.keysInterval.to = this.naturalKeysTotal;
		}
	};

	/**
	 * Show the piano keys defined in options.keys.
	 */
	Piano.prototype._layout = function() {
		this.dimensions = {width: this.el.offsetWidth, height: this.el.offsetHeight};

		// Set both width and left of the keyboard element.
		var displayKeys = this.keysInterval.to - this.keysInterval.from + 1,
			w = this.naturalKeysTotal * this.dimensions.width/(this.keysInterval.to - this.keysInterval.from + 1),
			l = -1 * (this.keysInterval.from - 1) * this.dimensions.width/displayKeys;

		this.keyboard.style.width = w + 'px';
		this.keyboard.style.left = l + 'px';
	};

	Piano.prototype._initEvents = function() {
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
				
				self._play(note, 'on');
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
					
					self._play(note, 'on');
					self._changeKeyStatus(note);
				});
			}
		});
		
		if( !isMobile ) {
			this.el.addEventListener('mouseleave', function(ev) {
				self.mdown = false;
			});
		}

		// Window resize.
		this.debounceResize = debounce(function(ev) {
			self._layout();
		}, 10);
		window.addEventListener('resize', this.debounceResize);
	};

	Piano.prototype._resetKeyboardMappingEv = function(keyboardMapping) {
		Mousetrap.reset();
		this.keyboardMapping = keyboardMapping;
		this._assignKeyboard();
	};

	Piano.prototype._assignKeyboard = function() {
		var self = this;

		// https://github.com/ccampbell/mousetrap
		var activekeys = [];
		for(var key in this.keyboardMapping) {
			var note = this.keyboardMapping[key];

			(function(note) {
				var keydownFn = function(ev) {
					var keyname = ev.key.toLowerCase();
					if( !activekeys[keyname] ) {
						activekeys[keyname] = true; 
						self._play(note, 'on');
						self._changeKeyStatus(note);
					}
				};
				Mousetrap.bind(key, keydownFn, 'keydown');
			})(note);

			(function(note) {
				var keyupFn = function(ev) {
					var keyname = ev.key.toLowerCase();
					if( activekeys[keyname] ) {
						activekeys[keyname] = false; 
						self._play(note, 'off');
						self._changeKeyStatus(note);
					}
				};
				Mousetrap.bind(key, keyupFn, 'keyup');
			})(note);
		}
	};

	Piano.prototype._play = function(note, status) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits

		MIDI.programChange(0, this.midiCode);
		
		if( status === 'on' ) {
			MIDI.noteOn(channel, note, velocity, delay);
		}
		else {
			MIDI.noteOff(channel, note, delay+.5);
		}
	};

	Piano.prototype._getKeyByNote = function(note) {
		var keyEl = this.allkeys[0];
		for(var i = 0, len = this.allkeys.length; i <= len-1; ++i) {
			if( this.allkeys[i].getAttribute('note:id') == note ) {
				keyEl = this.allkeys[i];
				break;
			}
		}
		return keyEl;
	};

	Piano.prototype._changeKeyStatus = function(note) {
		var keyEl = this._getKeyByNote(note);
		if( keyEl.classList.contains('piano__key--active') ) {
			keyEl.classList.remove('piano__key--active');
		}
		else {
			keyEl.classList.add('piano__key--active');
		}
	};

	window.Piano = Piano;

})(window);