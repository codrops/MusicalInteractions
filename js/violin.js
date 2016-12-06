/**
 * violin.js
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
	 * Violin obj. For this demo the Violin will only play natural notes from C2 to C5.
	 */
	function Violin(el) {
		this.el = el;
		this.midiCode = 40;
		// Some random notes to choose from depending on the mouse position (x-axis).
		this.notes = [15,17,19,20,22,24,26,27,29,31,32,34,36,38,39,41,43,44,46,48,50,51];
		this.notesTotal = this.notes.length;
		this._initEvents();
	}

	Violin.prototype._initEvents = function() {
		var self = this,
			isMobile = mobilecheck(),
			evs = {
				down: isMobile ? 'touchstart' : 'mousedown',
				up: isMobile ? 'touchend' : 'mouseup',
				move: isMobile ? 'touchmove' : 'mousemove'
			};

		this.mousedownFn = function(ev) {
			self.mdown = true;
			var note = self._getNote(ev);
			self._play(note, 'on');
		};
		this.el.addEventListener(evs.down, this.mousedownFn);

		this.mouseupFn = function(ev) {
			if( !self.mdown ) {
				return false;
			}
			self.mdown = false;
			var note = self._getNote(ev);
			self._play(note, 'off');
		};
		this.el.addEventListener(evs.up, this.mouseupFn);

		this.mousemoveFn = function(ev) {
			if( !self.mdown ) {
				return false;
			}
			requestAnimationFrame(function() {
				var note = self._getNote(ev);
				if( note != self.currentNote ) {
					self._play(self.currentNote, 'off', 0);
					self._play(note, 'on');
				}
			});
		};
		this.el.addEventListener(evs.move, this.mousemoveFn);

		if( !isMobile ) {
			this.mouseleaveFn = function(ev) {
				if( self.mdown ) {
					self.mdown = false;
					self._play(self.currentNote, 'off', 0);
				}
			};
			this.el.addEventListener('mouseleave', this.mouseleaveFn);
		}
	};

	Violin.prototype._getNote = function(ev) {
		// Mouse position relative to the document.
		var mousepos = getMousePos(ev),
			elWidth = this.el.offsetWidth,
			// Document scrolls.
			docScrolls = {left : document.body.scrollLeft + document.documentElement.scrollLeft, top : document.body.scrollTop + document.documentElement.scrollTop},
			bounds = this.el.getBoundingClientRect(),
			// Mouse position relative to the main element (this.DOM.el).
			relmousepos = { x : mousepos.x - bounds.left - docScrolls.left, y : mousepos.y - bounds.top - docScrolls.top },
			note = this.notes[Math.floor((this.notesTotal-1)/elWidth*relmousepos.x)];

		return note;
	};

	Violin.prototype._play = function(note, status, offDelay) {
		var channel = 0,
			note = parseInt(note) + 21,
			delay = 0,
			velocity = 127; // how hard the note hits
		
		MIDI.programChange(0, this.midiCode);
		
		if( status === 'on' ) {
			this.currentNote = note - 21;
			MIDI.noteOn(channel, note, velocity, delay);
		}
		else {
			var self = this;
			offDelay = offDelay || .1;
			MIDI.noteOff(channel, note, offDelay);
		}
	};

	window.Violin = Violin;

})(window);