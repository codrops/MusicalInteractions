/**
 * tinyinstrument.js
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
	 * Instrument obj.
	 */
	function Instrument(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this.midiCode = this.options.midiCode;
		this._initEvents();
		// just some random notes
		this.notes = this.options.notes;
		this.currentNote = 0;
	}

	/**
	 * Instrument options.
	 */
	Instrument.prototype.options = {
		notes: [39],
		midiCode: 0,
		noteOffDelay: 1,
		onPlay: function() {return false;}
	};

	Instrument.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = { 
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup',
				move: isMobile ? 'touchmove' : 'mousemove' 
			};

		if( isMobile ) {
			this.el.addEventListener(evs.down, function(ev) { 
				self.isScrolling = false;
			});
			this.el.addEventListener(evs.move, function(ev) { 
				self.isScrolling = true;
			});
			this.el.addEventListener(evs.up, function(ev) { 
				if( !self.isScrolling ) {
					self._play();
				}
			});
		}
		else {
			this.el.addEventListener(evs.down, function(ev) { 
				self._play();
			});
		}
	};

	Instrument.prototype._play = function() {
		if( this.isPlaying ) return;
		this.isPlaying = true;
		var delay = 0, note = this.notes[this.currentNote];
		this.currentNote = this.currentNote < this.notes.length - 1 ? this.currentNote + 1 : 0;
		MIDI.programChange(0, this.midiCode);
		MIDI.noteOn(0, note + 21, 127, 0);
		MIDI.noteOff(0, note + 21, this.options.noteOffDelay/1000);
		this.options.onPlay(this);
	};

	window.Instrument = Instrument;

})(window);