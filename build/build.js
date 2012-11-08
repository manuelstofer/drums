/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(p, parent, orig){
  var path = require.resolve(p)
    , mod = require.modules[path];

  // lookup failed
  if (null == path) {
    orig = orig || p;
    parent = parent || 'root';
    throw new Error('failed to require "' + orig + '" from "' + parent + '"');
  }

  // perform real require()
  // by invoking the module's
  // registered function
  if (!mod.exports) {
    mod.exports = {};
    mod.client = mod.component = true;
    mod.call(mod.exports, mod, mod.exports, require.relative(path));
  }

  return mod.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path){
  var orig = path
    , reg = path + '.js'
    , regJSON = path + '.json'
    , index = path + '/index.js'
    , indexJSON = path + '/index.json';

  return require.modules[reg] && reg
    || require.modules[regJSON] && regJSON
    || require.modules[index] && index
    || require.modules[indexJSON] && indexJSON
    || require.modules[orig] && orig
    || null;
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  // foo
  if ('.' != path[0]) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `fn`.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

require.register = function(path, fn){
  require.modules[path] = fn;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to){
  var fn = require.modules[from];
  if (!fn) throw new Error('failed to alias "' + from + '", it does not exist');
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * The relative require() itself.
   */

  function fn(path){
    var orig = path;
    path = fn.resolve(path);
    var alias = require.aliases[path + '/index.js'];
    if (alias) path = alias;
    return require(path, parent, orig);
  }

  /**
   * Resolve relative to the parent.
   */

  fn.resolve = function(path){
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path[0]) {
      var segs = parent.split('/');
      var i = segs.lastIndexOf('deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  fn.exists = function(path){
    return !! require.modules[fn.resolve(path)];
  };

  return fn;
};require.register("manuelstofer-load-samples/index.js", function(module, exports, require){
/*global XMLHttpRequest, require, module, alert*/

'use strict';

var each = require('each');

module.exports = loadSamples;

function loadSamples(context, urls, fn) {
    var missingSamples = urls.length,
        buffers = [];

    each(urls, function (url, index) {

        var request = new XMLHttpRequest();

        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.addEventListener('load', function () {
            missingSamples--;
            buffers[index] = context.createBuffer(request.response, true);

            if (missingSamples === 0) {
                fn(buffers);
            }
        });

        request.addEventListener('error', function () {
            alert('Bad news: The samples failed load');
        });

        request.send();
    });
}

});
require.register("manuelstofer-extend/index.js", function(module, exports, require){
"use strict";
var each = require('each'),
    slice = [].slice;

// Extend a given object with all the properties in passed-in object(s).
module.exports = function (obj) {
    each(slice.call(arguments, 1), function (source) {
        for (var prop in source) {
            obj[prop] = source[prop];
        }
    });
    return obj;
};

});
require.register("manuelstofer-each/index.js", function(module, exports, require){
"use strict";

var nativeForEach = [].forEach;

// Underscore's each function
module.exports = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
};

});
require.register("component-to-function/index.js", function(module, exports, require){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch (typeof obj) {
    case 'function':
      return obj;
    case 'string':
      return stringToFunction(obj);
    default:
      throw new TypeError('invalid callback "' + obj + '"');
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  var props = str.split('.');
  return function(obj){
    for (var i = 0; i < props.length; ++i) {
      if (null == obj) return;
      obj = obj[props[i]];
    }
    return obj;
  }
}
});
require.register("component-map/index.js", function(module, exports, require){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Map the given `arr` with callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  var ret = [];
  fn = toFunction(fn);
  for (var i = 0; i < arr.length; ++i) {
    ret.push(fn(arr[i], i));
  }
  return ret;
};
});
require.register("component-range/index.js", function(module, exports, require){

module.exports = function(from, to, inclusive){
  var ret = [];
  if (inclusive) to++;

  for (var n = from; n < to; ++n) {
    ret.push(n);
  }

  return ret;
}
});
require.register("component-bind/index.js", function(module, exports, require){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, slice.call(arguments).concat(args));
  }
};
});
require.register("drums/index.js", function(module, exports, require){
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

});
require.alias("manuelstofer-load-samples/index.js", "drums/deps/load-samples/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-load-samples/deps/each/index.js");

require.alias("manuelstofer-extend/index.js", "drums/deps/extend/index.js");
require.alias("manuelstofer-each/index.js", "manuelstofer-extend/deps/each/index.js");

require.alias("manuelstofer-each/index.js", "drums/deps/each/index.js");

require.alias("component-map/index.js", "drums/deps/map/index.js");
require.alias("component-to-function/index.js", "component-map/deps/to-function/index.js");

require.alias("component-range/index.js", "drums/deps/range/index.js");

require.alias("component-bind/index.js", "drums/deps/bind/index.js");
