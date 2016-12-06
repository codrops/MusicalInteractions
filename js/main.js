/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2016, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	var pianoEl = document.querySelector('.content--instrument > .piano'),
		guitarEl = document.querySelector('.content--instrument > .guitar'),
		kalimbaEl = document.querySelector('.content--instrument > .kalimba'),
		chimesEl = document.querySelector('.content--instrument > .chime'),
		timpaniEl = document.querySelector('.content--instrument > .timpani'),
		harpEl = document.querySelector('.content--instrument > .harp'),
		xylophoneEl = document.querySelector('.content--instrument > .xylophone'),
		saxEl = document.querySelector('.content--instrument .tiny-instrument--sax'),
		tubaEl = document.querySelector('.content--instrument .tiny-instrument--tuba'),
		panfluteEl = document.querySelector('.content--instrument .tiny-instrument--flute'),
		micAreaEl = document.querySelector('.content--bg-mic'),
		violinAreaEl = document.querySelector('.content--bg-violin'),
		tinyChimesEl = document.querySelector('.chime--tiny'), 
		tinyChimes,
		isMobile = mobilecheck();

	function init() {
		// The canvas animation for the wave.
		// https://github.com/caffeinalab/siriwavejs
		var siriWave = new SiriWave({
			container: document.getElementById('wavebg'),
			//cover: true,
			speed: 0.01,
			color: '#4d61c5',
			frequency: 3,
			amplitude: 0.5,
			autostart: true
		});

		// Preload all sounds and initialize the instruments.
		MIDI.loadPlugin({
			soundfontUrl: './soundfont/',
			instruments: ['acoustic_grand_piano', 'acoustic_guitar_nylon', 'tubular_bells', 'kalimba', 'timpani', 'orchestral_harp', 'xylophone', 'alto_sax', 'tuba', 'pan_flute', 'violin'],
			onsuccess: function() {
				document.body.classList.remove('loading');
				// Initialize the Piano.
				new Piano(pianoEl);
				// Initialize the Guitar.
				new Guitar(guitarEl);
				// Initialize the Kalimba.
				new Kalimba(kalimbaEl);
				// Initialize the Chimes.
				new Chimes(chimesEl);
				// Initialize the Timpani.
				new Timpani(timpaniEl);
				// Initialize the Harp.
				new Harp(harpEl);
				// Initialize the Xylophone.
				new Xylophone(xylophoneEl);
				// Initialize the Sax.
				new Instrument(saxEl, {
					notes: [32,33,35,36,39,40],
					midiCode: 65,
					noteOffDelay: 1500,
					onPlay: function(instance) {
						anime.remove(instance.el);
						anime({
							targets: instance.el,
							duration: 500,
							easing: 'easeOutCirc',
							translateY: 5,
							rotateZ: 10,
							complete: function() {
								anime({
									targets: instance.el,
									duration: 500,
									delay: 1000,
									easing: 'easeOutExpo',
									translateY: [5,0],
									rotateZ: [10,0],
								});	
							}
						});
						setTimeout(function() {instance.isPlaying = false;}, 1500);
					}
				});
				// Initialize the Tuba.
				new Instrument(tubaEl, {
					notes: [13,15,17,18,20,22,24,25,24,22,20,18,17,15],
					midiCode: 58,
					noteOffDelay: 500,
					onPlay: function(instance) {
						anime.remove(instance.el);
						anime({
							targets: instance.el,
							duration: 500,
							easing: 'easeOutCirc',
							translateY: 5,
							rotateZ: 5,
							complete: function() {
								anime({
									targets: instance.el,
									duration: 500,
									delay: 200,
									easing: 'easeOutExpo',
									translateY: [5,0],
									rotateZ: [5,0],
								});	
							}
						});
						setTimeout(function() {instance.isPlaying = false;}, 500);
					}
				});
				// Initialize the PanFlute.
				new Instrument(panfluteEl, {
					notes: [65,69,64,67,64,67],
					midiCode: 75,
					noteOffDelay: 1500,
					onPlay: function(instance) {
						anime.remove(instance.el);
						anime({
							targets: instance.el,
							duration: 500,
							easing: 'easeOutCirc',
							translateY: -5,
							rotateZ: -10,
							complete: function() {
								anime({
									targets: instance.el,
									duration: 500,
									delay: 1000,
									easing: 'easeOutExpo',
									translateY: [-5,0],
									rotateZ: [-10,0],
								});	
							}
						});
						setTimeout(function() {instance.isPlaying = false;}, 1500);
					}
				});
				// Initialize the microphone effect.
				new Mic(micAreaEl);
				// Initialize the violin effect.
				new Violin(violinAreaEl);
				// Initialize the tiny Chimes.
				tinyChimes = new Chimes(tinyChimesEl, { triggeredOnHover: true });
				initEvents();
			}
		});
	}

	function initEvents() {
		if( isMobile ) {
			tinyChimesEl.addEventListener('touchstart', function() {
				tinyChimes.playSequence();
			});
		}
	}

	init();

})(window);