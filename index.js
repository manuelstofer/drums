/*global module, require, console*/

'use strict';

module.exports  = DrumMachine;

var extend      = require('extend'),
    map         = require('map'),
    range       = require('range'),
    bind        = require('bind'),
    each        = require('each'),
    loadSamples = require('load-samples'),

    defaults = {
        stepsPerMinute:     120,
        steps:              16,
        files:              []
    };

/**
 * Drum machine component
 * @param options
 * @constructor
 */
function DrumMachine(options) {
    extend(this, defaults, options);
    this.init();
}

DrumMachine.prototype = {

    init: function () {
        loadSamples(
            this.context,
            this.files,
            bind(this, this.setSamples)
        );
    },

    /**
     * Updates the samples and (re) sets the UI
     * @param samples audio
     */
    setSamples: function (samples) {
        this.samples = samples;
        this.render();
        this.updateBuffer();
        this.play();
    },

    /**
     * Start playing the drum loop
     */
    play: function () {
        var soundSource = this.context.createBufferSource();
        soundSource.loop = true;
        soundSource.buffer = this.getBuffer();
        soundSource.connect(this.destination);
        soundSource.noteOn(this.context.currentTime);
    },

    /**
     * Toggles an a drum sample
     * - Updates UI
     * - Recomputes the drum loop
     * @param event
     */
    toggleStep: function (event) {
        var step = event.target;
        if (1 === event.which) {
            if (!step.active) {
                step.style.backgroundColor = '#333';
                step.style.color = 'white';
                step.active = true;
            } else {
                step.style.backgroundColor = 'white';
                step.style.color = 'black';
                step.active = false;
            }
        }

        this.updateBuffer();
    },

    /**
     * Creates a buffer for the drum loop
     * @return {AudioBuffer}
     */
    getBuffer: function () {
        var beatLength  =  60 / this.stepsPerMinute;
        this.buffer     = this.buffer || this.context.createBuffer(
            2,
            this.steps * beatLength * this.context.sampleRate,
            this.context.sampleRate
        );
        return this.buffer;
    },

    /**
     * Computes the drum loop with selected samples
     */
    updateBuffer: function () {
        var buffer          = this.getBuffer(),
            leftChannel     = buffer.getChannelData(0),
            rightChannel    = buffer.getChannelData(1),
            bufferLength    = leftChannel.length;


        // resets the buffer for both channels
        for (var i = 0; i < buffer.length; i++) {
            leftChannel[i]  = 0;
            rightChannel[i] = 0;
        }

        // mixes the drum loop
        var sampleEls = this.element.querySelectorAll('.sample');
        each(sampleEls, bind(this, function (sampleEl, sampleIndex) {

            var beatEls = sampleEl.querySelectorAll('input');
            each(beatEls, bind(this, function (beatEl, beatIndex) {
                if (beatEl.active) {

                    var pos = bufferLength / this.steps * beatIndex,
                        sample = this.samples[sampleIndex].getChannelData(0);

                    for (var i = 0; i < sample.length; i++) {
                        leftChannel[pos]    += sample[i];
                        rightChannel[pos]   += sample[i];
                        pos = ++pos % bufferLength;
                    }
                }
            }));
        }));
    },

    /**
     * Wires up the event listeners for the UI elements
     */
    initEvents: function () {
        var inputs = this.element.querySelectorAll('input');
        each(inputs, bind(this, function (input) {
            input.addEventListener('mousedown', bind(this, this.toggleStep));
            input.addEventListener('mouseover', bind(this, this.toggleStep));
        }));
    },

    /**
     * Inserts the drum machines UI to the dom
     */
    render: function () {
        this.element.innerHTML = this.template();
        this.initEvents();
    },

    /**
     * Builds the HTML for the drum machine
     * @return {String}
     */
    template: function () {
        var html = map(
            this.samples,
            bind(this, function (buffer, sampleIndex) {

                var steps = map(range(0, this.steps), function (step) {
                    return '<input type="button"  class="step-' + step + '" value="' + step + '"/>';
                });

                return  '<div class="sample">' +
                            steps.join('') +
                            '<span>' + this.files[sampleIndex] + '</span>' +
                        '</div>';
            })
        ).join('');

        return '<div class="drum-wrapper">' + html + '</div>';
    }
};
