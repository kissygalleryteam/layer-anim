/**
 * @fileoverview 分层动画组件 - 动画
 * @author 阿古<agu.hc@taobao.com>
 * @module layer-anim
 * @date 2014-12-12
 */
/*!
 * TweenLite, TweenMax
 * VERSION: beta 1.10.0
 * DATE: 2013-07-03
 * JavaScript (ActionScript 3 and 2 also available)
 * UPDATES AND DOCS AT: http://www.greensock.com
 *
 * @license Copyright (c) 2008-2013, GreenSock. All rights reserved.
 * This work is subject to the terms in http://www.greensock.com/terms_of_use.html or for 
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */

KISSY.add(function()
{
    "use strict";

    var _globals = window.GreenSockGlobals = {},  // agu.hc: using custom namespace
        _namespace = function(ns) {
            var a = ns.split("."), 
                p = _globals, i;
            for (i = 0; i < a.length; i++) {
                p[a[i]] = p = p[a[i]] || {};
            }
            return p;
        },
        gs = _namespace("com.greensock"),
        _slice = [].slice,
        _emptyFunc = function() {},
        a, i, p, _ticker, _tickerActive,
        _defLookup = {},

    /**
     * @constructor
     * Defines a GreenSock class, optionally with an array of dependencies that must be instantiated first and passed into the definition.
     * This allows users to load GreenSock JS files in any order even if they have interdependencies (like CSSPlugin extends TweenPlugin which is
     * inside TweenLite.js, but if CSSPlugin is loaded first, it should wait to run its code until TweenLite.js loads and instantiates TweenPlugin
     * and then pass TweenPlugin to CSSPlugin's definition). This is all done automatically and internally.
     *
     * Every definition will be added to a "com.greensock" global object (typically window, but if a window.GreenSockGlobals object is found,
     * it will go there as of v1.7). For example, TweenLite will be found at window.com.greensock.TweenLite and since it's a global class that should be available anywhere,
     * it is ALSO referenced at window.TweenLite. However some classes aren't considered global, like the base com.greensock.core.Animation class, so
     * those will only be at the package like window.com.greensock.core.Animation. Again, if you define a GreenSockGlobals object on the window, everything
     * gets tucked neatly inside there instead of on the window directly. This allows you to do advanced things like load multiple versions of GreenSock
     * files and put them into distinct objects (imagine a banner ad uses a newer version but the main site uses an older one). In that case, you could
     * sandbox the banner one like:
     *
     * <script>
     *     var gs = window.GreenSockGlobals = {}; //the newer version we're about to load could now be referenced in a "gs" object, like gs.TweenLite.to(...). Use whatever alias you want as long as it's unique, "gs" or "banner" or whatever.
     * </script>
     * <script src="js/greensock/v1.7/TweenMax.js"></script>
     * <script>
     *     window.GreenSockGlobals = null; //reset it back to null so that the next load of TweenMax affects the window and we can reference things directly like TweenLite.to(...)
     * </script>
     * <script src="js/greensock/v1.6/TweenMax.js"></script>
     * <script>
     *     gs.TweenLite.to(...); //would use v1.7
     *     TweenLite.to(...); //would use v1.6
     * </script>
     *
     * @param {!string} ns The namespace of the class definition, leaving off "com.greensock." as that's assumed. For example, "TweenLite" or "plugins.CSSPlugin" or "easing.Back".
     * @param {!Array.<string>} dependencies An array of dependencies (described as their namespaces minus "com.greensock." prefix). For example ["TweenLite","plugins.TweenPlugin","core.Animation"]
     * @param {!function():Object} func The function that should be called and passed the resolved dependencies which will return the actual class for this definition.
     * @param {boolean=} global If true, the class will be added to the global scope (typically window unless you define a window.GreenSockGlobals object)
     */
    Definition = function(ns, dependencies, func, global) {
        this.sc = (_defLookup[ns]) ? _defLookup[ns].sc : []; //subclasses
        _defLookup[ns] = this;
        this.gsClass = null;
        this.func = func;
        var _classes = [];
        this.check = function(init) {
            var i = dependencies.length,
                missing = i,
                cur, a, n, cl;
            while (--i > -1) {
                if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
                    _classes[i] = cur.gsClass;
                    missing--;
                } else if (init) {
                    cur.sc.push(this);
                }
            }
            if (missing === 0 && func) {
                a = ("com.greensock." + ns).split(".");
                n = a.pop();
                cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);

                //exports to multiple environments
                if (global) {
                    _globals[n] = cl; //provides a way to avoid global namespace pollution. By default, the main classes like TweenLite, Power1, Strong, etc. are added to window unless a GreenSockGlobals is defined. So if you want to have things added to a custom object instead, just do something like window.GreenSockGlobals = {} before loading any GreenSock files. You can even set up an alias like window.GreenSockGlobals = windows.gs = {} so that you can access everything like gs.TweenLite. Also remember that ALL classes are added to the window.com.greensock object (in their respective packages, like com.greensock.easing.Power1, com.greensock.TweenLite, etc.)
                    if (typeof(define) === "function" && define.amd){ //AMD
                        define((window.GreenSockAMDPath ? window.GreenSockAMDPath + "/" : "") + ns.split(".").join("/"), [], function() { return cl; });
                    } else if (typeof(module) !== "undefined" && module.exports){ //node
                        module.exports = cl;
                    }
                }
                for (i = 0; i < this.sc.length; i++) {
                    this.sc[i].check();
                }
            }
        };
        this.check(true);
    },

    //used to create Definition instances (which basically registers a class that has dependencies).
    _gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
        return new Definition(ns, dependencies, func, global);
    },

    //a quick way to create a class that doesn't have any dependencies. Returns the class, but first registers it in the GreenSock namespace so that other classes can grab it (other classes might be dependent on the class).
    _class = gs._class = function(ns, func, global) {
        func = func || function() {};
        _gsDefine(ns, [], function(){ return func; }, global);
        return func;
    };

    _gsDefine.globals = _globals;

    
    /*
    * ----------------------------------------------------------------
    * Ease
    * ----------------------------------------------------------------
    */
    var _baseParams = [0, 0, 1, 1],
        _blankArray = [],
        Ease = _class("easing.Ease", function(func, extraParams, type, power) {
            this._func = func;
            this._type = type || 0;
            this._power = power || 0;
            this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
        }, true),
        _easeMap = Ease.map = {},
        _easeReg = Ease.register = function(ease, names, types, create) {
            var na = names.split(","),
                i = na.length,
                ta = (types || "easeIn,easeOut,easeInOut").split(","),
                e, name, j, type;
            while (--i > -1) {
                name = na[i];
                e = create ? _class("easing."+name, null, true) : gs.easing[name] || {};
                j = ta.length;
                while (--j > -1) {
                    type = ta[j];
                    _easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
                }
            }
        };
    
    p = Ease.prototype;
    p._calcEnd = false;
    p.getRatio = function(p) {
        if (this._func) {
            this._params[0] = p;
            return this._func.apply(null, this._params);
        }
        var t = this._type,
            pw = this._power,
            r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
        if (pw === 1) {
            r *= r;
        } else if (pw === 2) {
            r *= r * r;
        } else if (pw === 3) {
            r *= r * r * r;
        } else if (pw === 4) {
            r *= r * r * r * r;
        }
        return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
    };

    //create all the standard eases like Linear, Quad, Cubic, Quart, Quint, Strong, Power0, Power1, Power2, Power3, and Power4 (each with easeIn, easeOut, and easeInOut)
    a = ["Linear","Quad","Cubic","Quart","Quint,Strong"];
    i = a.length;
    while (--i > -1) {
        p = a[i]+",Power"+i;
        _easeReg(new Ease(null,null,1,i), p, "easeOut", true);
        _easeReg(new Ease(null,null,2,i), p, "easeIn" + ((i === 0) ? ",easeNone" : ""));
        _easeReg(new Ease(null,null,3,i), p, "easeInOut");
    }
    _easeMap.linear = gs.easing.Linear.easeIn;
    _easeMap.swing = gs.easing.Quad.easeInOut; //for jQuery folks


    /*
    * ----------------------------------------------------------------
    * EventDispatcher
    * ----------------------------------------------------------------
    */
    var EventDispatcher = _class("events.EventDispatcher", function(target) {
        this._listeners = {};
        this._eventTarget = target || this;
    });
    p = EventDispatcher.prototype;

    p.addEventListener = function(type, callback, scope, useParam, priority) {
        priority = priority || 0;
        var list = this._listeners[type],
            index = 0,
            listener, i;
        if (list == null) {
            this._listeners[type] = list = [];
        }
        i = list.length;
        while (--i > -1) {
            listener = list[i];
            if (listener.c === callback && listener.s === scope) {
                list.splice(i, 1);
            } else if (index === 0 && listener.pr < priority) {
                index = i + 1;
            }
        }
        list.splice(index, 0, {c:callback, s:scope, up:useParam, pr:priority});
        if (this === _ticker && !_tickerActive) {
            _ticker.wake();
        }
    };
    
    p.removeEventListener = function(type, callback) {
        var list = this._listeners[type], i;
        if (list) {
            i = list.length;
            while (--i > -1) {
                if (list[i].c === callback) {
                    list.splice(i, 1);
                    return;
                }
            }
        }
    };
    
    p.dispatchEvent = function(type) {
        var list = this._listeners[type],
            i, t, listener;
        if (list) {
            i = list.length;
            t = this._eventTarget;
            while (--i > -1) {
                listener = list[i];
                if (listener.up) {
                    listener.c.call(listener.s || t, {type:type, target:t});
                } else {
                    listener.c.call(listener.s || t);
                }
            }
        }
    };


    /*
    * ----------------------------------------------------------------
    * Ticker
    * ----------------------------------------------------------------
    */
    var _reqAnimFrame = window.requestAnimationFrame, 
        _cancelAnimFrame = window.cancelAnimationFrame, 
        _getTime = Date.now || function() {return new Date().getTime();};
    
    //now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setTimeout()/clearTimeout() polyfill.
    a = ["ms","moz","webkit","o"];
    i = a.length;
    while (--i > -1 && !_reqAnimFrame) {
        _reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
        _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
    }

    _class("Ticker", function(fps, useRAF) {
        var _self = this,
            _startTime = _getTime(),
            _useRAF = (useRAF !== false && _reqAnimFrame),
            _fps, _req, _id, _gap, _nextTime,
            _tick = function(manual) {
                _self.time = (_getTime() - _startTime) / 1000;
                var id = _id,
                    overlap = _self.time - _nextTime;
                if (!_fps || overlap > 0 || manual === true) {
                    _self.frame++;
                    _nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
                    _self.dispatchEvent("tick");
                }
                if (manual !== true && id === _id) { //make sure the ids match in case the "tick" dispatch triggered something that caused the ticker to shut down or change _useRAF or something like that.
                    _id = _req(_tick);
                }
            };

        EventDispatcher.call(_self);
        this.time = this.frame = 0;
        this.tick = function() {
            _tick(true);
        };

        this.sleep = function() {
            if (_id == null) {
                return;
            }
            if (!_useRAF || !_cancelAnimFrame) {
                clearTimeout(_id);
            } else {
                _cancelAnimFrame(_id);
            }
            _req = _emptyFunc;
            _id = null;
            if (_self === _ticker) {
                _tickerActive = false;
            }
        };

        this.wake = function() {
            if (_id !== null) {
                _self.sleep();
            }
            _req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function(f) { return setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0); } : _reqAnimFrame;
            if (_self === _ticker) {
                _tickerActive = true;
            }
            _tick(2);
        };

        this.fps = function(value) {
            if (!arguments.length) {
                return _fps;
            }
            _fps = value;
            _gap = 1 / (_fps || 60);
            _nextTime = this.time + _gap;
            _self.wake();
        };

        this.useRAF = function(value) {
            if (!arguments.length) {
                return _useRAF;
            }
            _self.sleep();
            _useRAF = value;
            _self.fps(_fps);
        };
        _self.fps(fps);

        //a bug in iOS 6 Safari occasionally prevents the requestAnimationFrame from working initially, so we use a 1.5-second timeout that automatically falls back to setTimeout() if it senses this condition.
        setTimeout(function() {
            if (_useRAF && (!_id || _self.frame < 5)) {
                _self.useRAF(false);
            }
        }, 1500);
    });
    
    p = gs.Ticker.prototype = new gs.events.EventDispatcher();
    p.constructor = gs.Ticker;


    /*
    * ----------------------------------------------------------------
    * Animation
    * ----------------------------------------------------------------
    */
    var Animation = _class("core.Animation", function(duration, vars) {
            this.vars = vars || {};
            this._duration = this._totalDuration = duration || 0;
            this._delay = Number(this.vars.delay) || 0;
            this._timeScale = 1;
            this._active = (this.vars.immediateRender === true);
            this.data = this.vars.data;
            this._reversed = (this.vars.reversed === true);
            
            if (!_rootTimeline) {
                return;
            }
            if (!_tickerActive) {
                _ticker.wake();
            }

            var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
            tl.add(this, tl._time);
            
            if (this.vars.paused) {
                this.paused(true);
            }
        });

    _ticker = Animation.ticker = new gs.Ticker();
    p = Animation.prototype;
    p._dirty = p._gc = p._initted = p._paused = false;
    p._totalTime = p._time = 0;
    p._rawPrevTime = -1;
    p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
    p._paused = false;
    
    p.play = function(from, suppressEvents) {
        if (arguments.length) {
            this.seek(from, suppressEvents);
        }
        return this.reversed(false).paused(false);
    };
    
    p.pause = function(atTime, suppressEvents) {
        if (arguments.length) {
            this.seek(atTime, suppressEvents);
        }
        return this.paused(true);
    };
    
    p.resume = function(from, suppressEvents) {
        if (arguments.length) {
            this.seek(from, suppressEvents);
        }
        return this.paused(false);
    };
    
    p.seek = function(time, suppressEvents) {
        return this.totalTime(Number(time), suppressEvents !== false);
    };
    
    p.restart = function(includeDelay, suppressEvents) {
        return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, (suppressEvents !== false), true);
    };
    
    p.reverse = function(from, suppressEvents) {
        if (arguments.length) {
            this.seek((from || this.totalDuration()), suppressEvents);
        }
        return this.reversed(true).paused(false);
    };
    
    p.render = function() {
        
    };
    
    p.invalidate = function() {
        return this;
    };
    
    p._enabled = function (enabled, ignoreTimeline) {
        if (!_tickerActive) {
            _ticker.wake();
        }
        this._gc = !enabled; 
        this._active = (enabled && !this._paused && this._totalTime > 0 && this._totalTime < this._totalDuration);
        if (ignoreTimeline !== true) {
            if (enabled && !this.timeline) {
                this._timeline.add(this, this._startTime - this._delay);
            } else if (!enabled && this.timeline) {
                this._timeline._remove(this, true);
            }
        }
        return false;
    };

    
    p._kill = function(vars, target) {
        return this._enabled(false, false);
    };
    
    p.kill = function(vars, target) {
        this._kill(vars, target);
        return this;
    };
    
    p._uncache = function(includeSelf) {
        var tween = includeSelf ? this : this.timeline;
        while (tween) {
            tween._dirty = true;
            tween = tween.timeline;
        }
        return this;
    };

    //----Animation getters/setters --------------------------------------------------------
    
    p.eventCallback = function(type, callback, params, scope) {
        if (type == null) {
            return null;
        } else if (type.substr(0,2) === "on") {
            var v = this.vars,
                i;
            if (arguments.length === 1) {
                return v[type];
            }
            if (callback == null) {
                delete v[type];
            } else {
                v[type] = callback;
                v[type + "Params"] = params;
                v[type + "Scope"] = scope;
                if (params) {
                    i = params.length;
                    while (--i > -1) {
                        if (params[i] === "{self}") {
                            params = v[type + "Params"] = params.concat(); //copying the array avoids situations where the same array is passed to multiple tweens/timelines and {self} doesn't correctly point to each individual instance.
                            params[i] = this;
                        }
                    }
                }
            }
            if (type === "onUpdate") {
                this._onUpdate = callback;
            }
        }
        return this;
    };
    
    p.delay = function(value) {
        if (!arguments.length) {
            return this._delay;
        }
        if (this._timeline.smoothChildTiming) {
            this.startTime( this._startTime + value - this._delay );
        }
        this._delay = value;
        return this;
    };
    
    p.duration = function(value) {
        if (!arguments.length) {
            this._dirty = false;
            return this._duration;
        }
        this._duration = this._totalDuration = value;
        this._uncache(true); //true in case it's a TweenMax or TimelineMax that has a repeat - we'll need to refresh the totalDuration. 
        if (this._timeline.smoothChildTiming) if (this._time > 0) if (this._time < this._duration) if (value !== 0) {
            this.totalTime(this._totalTime * (value / this._duration), true);
        }
        return this;
    };
    
    p.totalDuration = function(value) {
        this._dirty = false;
        return (!arguments.length) ? this._totalDuration : this.duration(value);
    };
    
    p.time = function(value, suppressEvents) {
        if (!arguments.length) {
            return this._time;
        }
        if (this._dirty) {
            this.totalDuration();
        }
        return this.totalTime((value > this._duration) ? this._duration : value, suppressEvents);
    };
    
    p.totalTime = function(time, suppressEvents, uncapped) {
        if (!_tickerActive) {
            _ticker.wake();
        }
        if (!arguments.length) {
            return this._totalTime;
        }
        if (this._timeline) {
            if (time < 0 && !uncapped) {
                time += this.totalDuration();
            }
            if (this._timeline.smoothChildTiming) {
                if (this._dirty) {
                    this.totalDuration();
                }
                var totalDuration = this._totalDuration,
                    tl = this._timeline;
                if (time > totalDuration && !uncapped) {
                    time = totalDuration;
                }
                this._startTime = (this._paused ? this._pauseTime : tl._time) - ((!this._reversed ? time : totalDuration - time) / this._timeScale);
                if (!tl._dirty) { //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
                    this._uncache(false);
                }
                //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The startTime of that child would get pushed out, but one of the ancestors may have completed.
                if (tl._timeline) {
                    while (tl._timeline) {
                        if (tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale) {
                            tl.totalTime(tl._totalTime, true);
                        }
                        tl = tl._timeline;
                    }
                }
            }
            if (this._gc) {
                this._enabled(true, false);
            }
            if (this._totalTime !== time) {
                this.render(time, suppressEvents, false);
            }
        }
        return this;
    };
    
    p.startTime = function(value) {
        if (!arguments.length) {
            return this._startTime;
        }
        if (value !== this._startTime) {
            this._startTime = value;
            if (this.timeline) if (this.timeline._sortChildren) {
                this.timeline.add(this, value - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
            }
        }
        return this;
    };
    
    p.timeScale = function(value) {
        if (!arguments.length) {
            return this._timeScale;
        }
        value = value || 0.000001; //can't allow zero because it'll throw the math off
        if (this._timeline && this._timeline.smoothChildTiming) {
            var pauseTime = this._pauseTime,
                t = (pauseTime || pauseTime === 0) ? pauseTime : this._timeline.totalTime();
            this._startTime = t - ((t - this._startTime) * this._timeScale / value);
        }
        this._timeScale = value;
        return this._uncache(false);
    };
    
    p.reversed = function(value) {
        if (!arguments.length) {
            return this._reversed;
        }
        if (value != this._reversed) {
            this._reversed = value;
            this.totalTime(this._totalTime, true);
        }
        return this;
    };
    
    p.paused = function(value) {
        if (!arguments.length) {
            return this._paused;
        }
        if (value != this._paused) if (this._timeline) {
            if (!_tickerActive && !value) {
                _ticker.wake();
            }
            var tl = this._timeline,
                raw = tl.rawTime(),
                elapsed = raw - this._pauseTime;
            if (!value && tl.smoothChildTiming) {
                this._startTime += elapsed;
                this._uncache(false);
            }
            this._pauseTime = value ? raw : null;
            this._paused = value;
            this._active = (!value && this._totalTime > 0 && this._totalTime < this._totalDuration);
            if (!value && elapsed !== 0 && this._duration !== 0) {
                this.render((tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale), true, true); //in case the target's properties changed via some other tween or manual update by the user, we should force a render.
            }
        }
        if (this._gc && !value) {
            this._enabled(true, false);
        }
        return this;
    };


    /*
    * ----------------------------------------------------------------
    * SimpleTimeline
    * ----------------------------------------------------------------
    */
    var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
        Animation.call(this, 0, vars);
        this.autoRemoveChildren = this.smoothChildTiming = true;
    });
    
    p = SimpleTimeline.prototype = new Animation();
    p.constructor = SimpleTimeline;
    p.kill()._gc = false;
    p._first = p._last = null;
    p._sortChildren = false;

    p.add = p.insert = function(child, position, align, stagger) {
        var prevTween, st;
        child._startTime = Number(position || 0) + child._delay;
        if (child._paused) if (this !== child._timeline) { //we only adjust the _pauseTime if it wasn't in this timeline already. Remember, sometimes a tween will be inserted again into the same timeline when its startTime is changed so that the tweens in the TimelineLite/Max are re-ordered properly in the linked list (so everything renders in the proper order).
            child._pauseTime = child._startTime + ((this.rawTime() - child._startTime) / child._timeScale);
        }
        if (child.timeline) {
            child.timeline._remove(child, true); //removes from existing timeline so that it can be properly added to this one.
        }
        child.timeline = child._timeline = this;
        if (child._gc) {
            child._enabled(true, true);
        }
        prevTween = this._last;
        if (this._sortChildren) {
            st = child._startTime;
            while (prevTween && prevTween._startTime > st) {
                prevTween = prevTween._prev;
            }
        }
        if (prevTween) {
            child._next = prevTween._next;
            prevTween._next = child;
        } else {
            child._next = this._first;
            this._first = child;
        }
        if (child._next) {
            child._next._prev = child;
        } else {
            this._last = child;
        }
        child._prev = prevTween;
        if (this._timeline) {
            this._uncache(true);
        }
        return this;
    };
    
    p._remove = function(tween, skipDisable) {
        if (tween.timeline === this) {
            if (!skipDisable) {
                tween._enabled(false, true);
            }
            tween.timeline = null;
            
            if (tween._prev) {
                tween._prev._next = tween._next;
            } else if (this._first === tween) {
                this._first = tween._next;
            }
            if (tween._next) {
                tween._next._prev = tween._prev;
            } else if (this._last === tween) {
                this._last = tween._prev;
            }
            
            if (this._timeline) {
                this._uncache(true);
            }
        }
        return this;
    };
    
    p.render = function(time, suppressEvents, force) {
        var tween = this._first, 
            next;
        this._totalTime = this._time = this._rawPrevTime = time;
        while (tween) {
            next = tween._next; //record it here because the value could change after rendering...
            if (tween._active || (time >= tween._startTime && !tween._paused)) {
                if (!tween._reversed) {
                    tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
                } else {
                    tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
                }
            }
            tween = next;
        }
    };
            
    p.rawTime = function() {
        if (!_tickerActive) {
            _ticker.wake();
        }
        return this._totalTime;         
    };


    /*
    * ----------------------------------------------------------------
    * TweenLite
    * ----------------------------------------------------------------
    */
    var TweenLite = _class("TweenLite", function(target, duration, vars) {
            Animation.call(this, duration, vars);

            if (target == null) {
                throw "Cannot tween a null target.";
            }

            this.target = target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;

            var isSelector = (target.jquery || (target.length && target !== window && target[0] && (target[0] === window || (target[0].nodeType && target[0].style && !target.nodeType)))),
                overwrite = this.vars.overwrite,
                i, targ, targets;

            this._overwrite = overwrite = (overwrite == null) ? _overwriteLookup[TweenLite.defaultOverwrite] : (typeof(overwrite) === "number") ? overwrite >> 0 : _overwriteLookup[overwrite];

            if ((isSelector || target instanceof Array) && typeof(target[0]) !== "number") {
                this._targets = targets = _slice.call(target, 0);
                this._propLookup = [];
                this._siblings = [];
                for (i = 0; i < targets.length; i++) {
                    targ = targets[i];
                    if (!targ) {
                        targets.splice(i--, 1);
                        continue;
                    } else if (typeof(targ) === "string") {
                        targ = targets[i--] = TweenLite.selector(targ); //in case it's an array of strings
                        if (typeof(targ) === "string") {
                            targets.splice(i+1, 1); //to avoid an endless loop (can't imagine why the selector would return a string, but just in case)
                        }
                        continue;
                    } else if (targ.length && targ !== window && targ[0] && (targ[0] === window || (targ[0].nodeType && targ[0].style && !targ.nodeType))) { //in case the user is passing in an array of selector objects (like jQuery objects), we need to check one more level and pull things out if necessary. Also note that <select> elements pass all the criteria regarding length and the first child having style, so we must also check to ensure the target isn't an HTML node itself.
                        targets.splice(i--, 1);
                        this._targets = targets = targets.concat(_slice.call(targ, 0));
                        continue;
                    }
                    this._siblings[i] = _register(targ, this, false);
                    if (overwrite === 1) if (this._siblings[i].length > 1) {
                        _applyOverwrite(targ, this, null, 1, this._siblings[i]);
                    }
                }

            } else {
                this._propLookup = {};
                this._siblings = _register(target, this, false);
                if (overwrite === 1) if (this._siblings.length > 1) {
                    _applyOverwrite(target, this, null, 1, this._siblings);
                }
            }
            if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender !== false)) {
                this.render(-this._delay, false, true);
            }
        }, true),
        _isSelector = function(v) {
            return (v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType))); //we cannot check "nodeType" if the target is window from within an iframe, otherwise it will trigger a security error in some browsers like Firefox.
        },
        _autoCSS = function(vars, target) {
            var css = {},
                p;
            for (p in vars) {
                if (!_reservedProps[p] && (!(p in target) || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || (_plugins[p] && _plugins[p]._autoCSS))) { //note: <img> elements contain read-only "x" and "y" properties. We should also prioritize editing css width/height rather than the element's properties.
                    css[p] = vars[p];
                    delete vars[p];
                }
            }
            vars.css = css;
        };

    p = TweenLite.prototype = new Animation();
    p.constructor = TweenLite;
    p.kill()._gc = false;

//----TweenLite defaults, overwrite management, and root updates ----------------------------------------------------

    p.ratio = 0;
    p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
    p._notifyPluginsOfEnabled = false;
    
    TweenLite.version = "1.10.0";
    TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
    TweenLite.defaultOverwrite = "auto";
    TweenLite.ticker = _ticker;
    TweenLite.autoSleep = true;
    TweenLite.selector = window.$ || window.jQuery || function(e) { if (window.$) { TweenLite.selector = window.$; return window.$(e); } return window.document ? window.document.getElementById((e.charAt(0) === "#") ? e.substr(1) : e) : e; };

    var _internals = TweenLite._internals = {}, //gives us a way to expose certain private values to other GreenSock classes without contaminating tha main TweenLite object.
        _plugins = TweenLite._plugins = {},
        _tweenLookup = TweenLite._tweenLookup = {}, 
        _tweenLookupNum = 0,
        _reservedProps = _internals.reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1, autoCSS:1},
        _overwriteLookup = {none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0},
        _rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(), 
        _rootTimeline = Animation._rootTimeline = new SimpleTimeline();
        
    _rootTimeline._startTime = _ticker.time;
    _rootFramesTimeline._startTime = _ticker.frame;
    _rootTimeline._active = _rootFramesTimeline._active = true;
    
    Animation._updateRoot = function() {
            _rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
            _rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
            if (!(_ticker.frame % 120)) { //dump garbage every 120 frames...
                var i, a, p;
                for (p in _tweenLookup) {
                    a = _tweenLookup[p].tweens;
                    i = a.length;
                    while (--i > -1) {
                        if (a[i]._gc) {
                            a.splice(i, 1);
                        }
                    }
                    if (a.length === 0) {
                        delete _tweenLookup[p];
                    }
                }
                //if there are no more tweens in the root timelines, or if they're all paused, make the _timer sleep to reduce load on the CPU slightly
                p = _rootTimeline._first;
                if (!p || p._paused) if (TweenLite.autoSleep && !_rootFramesTimeline._first && _ticker._listeners.tick.length === 1) {
                    while (p && p._paused) {
                        p = p._next;
                    }
                    if (!p) {
                        _ticker.sleep();
                    }
                }
            }
        };
    
    _ticker.addEventListener("tick", Animation._updateRoot);
    
    var _register = function(target, tween, scrub) {
            var id = target._gsTweenID, a, i;
            if (!_tweenLookup[id || (target._gsTweenID = id = "t" + (_tweenLookupNum++))]) {
                _tweenLookup[id] = {target:target, tweens:[]};
            }
            if (tween) {
                a = _tweenLookup[id].tweens;
                a[(i = a.length)] = tween;
                if (scrub) {
                    while (--i > -1) {
                        if (a[i] === tween) {
                            a.splice(i, 1);
                        }
                    }
                }
            }
            return _tweenLookup[id].tweens;
        },
        
        _applyOverwrite = function(target, tween, props, mode, siblings) {
            var i, changed, curTween, l;
            if (mode === 1 || mode >= 4) {
                l = siblings.length;
                for (i = 0; i < l; i++) {
                    if ((curTween = siblings[i]) !== tween) {
                        if (!curTween._gc) if (curTween._enabled(false, false)) {
                            changed = true;
                        }
                    } else if (mode === 5) {
                        break;
                    }
                }
                return changed;
            }
            //NOTE: Add 0.0000000001 to overcome floating point errors that can cause the startTime to be VERY slightly off (when a tween's time() is set for example)
            var startTime = tween._startTime + 0.0000000001, 
                overlaps = [], 
                oCount = 0,
                zeroDur = (tween._duration === 0),
                globalStart;
            i = siblings.length;
            while (--i > -1) {
                if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {
                    //ignore
                } else if (curTween._timeline !== tween._timeline) {
                    globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
                    if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
                        overlaps[oCount++] = curTween;
                    }
                } else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale + 0.0000000001 > startTime) if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 0.0000000002)) {
                    overlaps[oCount++] = curTween;
                }
            }
            
            i = oCount;
            while (--i > -1) {
                curTween = overlaps[i];
                if (mode === 2) if (curTween._kill(props, target)) {
                    changed = true;
                }
                if (mode !== 2 || (!curTween._firstPT && curTween._initted)) { 
                    if (curTween._enabled(false, false)) { //if all property tweens have been overwritten, kill the tween.
                        changed = true;
                    }
                }
            }
            return changed;
        },
        
        _checkOverlap = function(tween, reference, zeroDur) {
            var tl = tween._timeline, 
                ts = tl._timeScale, 
                t = tween._startTime,
                min = 0.0000000001; //we use this to protect from rounding errors.
            while (tl._timeline) {
                t += tl._startTime;
                ts *= tl._timeScale;
                if (tl._paused) {
                    return -100;
                }
                tl = tl._timeline;
            }
            t /= ts;
            return (t > reference) ? t - reference : ((zeroDur && t === reference) || (!tween._initted && t - reference < 2 * min)) ? min : ((t += tween.totalDuration() / tween._timeScale / ts) > reference + min) ? 0 : t - reference - min;
        };


//---- TweenLite instance methods -----------------------------------------------------------------------------

    p._init = function() {
        var v = this.vars,
            op = this._overwrittenProps,
            dur = this._duration,
            ease = v.ease,
            i, initPlugins, pt, p;
        if (v.startAt) {
            v.startAt.overwrite = 0;
            v.startAt.immediateRender = true;
            this._startAt = TweenLite.to(this.target, 0, v.startAt);
            if (v.immediateRender) {
                this._startAt = null; //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in TimelineLite/Max instances where immediateRender was false (which is the default in the convenience methods like from()).
                if (this._time === 0 && dur !== 0) {
                    return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a TimelineLite or TimelineMax, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
                }
            }
        } else if (v.runBackwards && v.immediateRender && dur !== 0) {
            //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
            if (this._startAt) {
                this._startAt.render(-1, true);
                this._startAt = null;
            } else if (this._time === 0) {
                pt = {};
                for (p in v) { //copy props into a new object and skip any reserved props, otherwise onComplete or onUpdate or onStart could fire. We should, however, permit autoCSS to go through.
                    if (!_reservedProps[p] || p === "autoCSS") {
                        pt[p] = v[p];
                    }
                }
                pt.overwrite = 0;
                this._startAt = TweenLite.to(this.target, 0, pt);
                return;
            }
        }
        if (!ease) {
            this._ease = TweenLite.defaultEase;
        } else if (ease instanceof Ease) {
            this._ease = (v.easeParams instanceof Array) ? ease.config.apply(ease, v.easeParams) : ease;
        } else {
            this._ease = (typeof(ease) === "function") ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
        }
        this._easeType = this._ease._type;
        this._easePower = this._ease._power;
        this._firstPT = null;
        
        if (this._targets) {
            i = this._targets.length;
            while (--i > -1) {
                if ( this._initProps( this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (op ? op[i] : null)) ) {
                    initPlugins = true;
                }
            }
        } else {
            initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
        }
        
        if (initPlugins) {
            TweenLite._onPluginEvent("_onInitAllProps", this); //reorders the array in order of priority. Uses a static TweenPlugin method in order to minimize file size in TweenLite
        }
        if (op) if (!this._firstPT) if (typeof(this.target) !== "function") { //if all tweening properties have been overwritten, kill the tween. If the target is a function, it's probably a delayedCall so let it live.
            this._enabled(false, false);
        }
        if (v.runBackwards) {
            pt = this._firstPT;
            while (pt) {
                pt.s += pt.c;
                pt.c = -pt.c;
                pt = pt._next;
            }
        }
        this._onUpdate = v.onUpdate;
        this._initted = true;
    };
    
    p._initProps = function(target, propLookup, siblings, overwrittenProps) {
        var p, i, initPlugins, plugin, a, pt, v;
        if (target == null) {
            return false;
        }
        if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) { //it's so common to use TweenLite/Max to animate the css of DOM elements, we assume that if the target is a DOM element, that's what is intended (a convenience so that users don't have to wrap things in css:{}, although we still recommend it for a slight performance boost and better specificity). Note: we cannot check "nodeType" on the window inside an iframe.
            _autoCSS(this.vars, target);
        }
        for (p in this.vars) {
            if (_reservedProps[p]) { 
                if (p === "onStartParams" || p === "onUpdateParams" || p === "onCompleteParams" || p === "onReverseCompleteParams" || p === "onRepeatParams") if ((a = this.vars[p])) {
                    i = a.length;
                    while (--i > -1) {
                        if (a[i] === "{self}") {
                            a = this.vars[p] = a.concat(); //copy the array in case the user referenced the same array in multiple tweens/timelines (each {self} should be unique)
                            a[i] = this;
                        }
                    }
                }
                
            } else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {
                
                //t - target        [object]
                //p - property      [string]
                //s - start         [number]
                //c - change        [number]
                //f - isFunction    [boolean]
                //n - name          [string]
                //pg - isPlugin     [boolean]
                //pr - priority     [number]
                this._firstPT = pt = {_next:this._firstPT, t:plugin, p:"setRatio", s:0, c:1, f:true, n:p, pg:true, pr:plugin._priority};
                i = plugin._overwriteProps.length;
                while (--i > -1) {
                    propLookup[plugin._overwriteProps[i]] = this._firstPT;
                }
                if (plugin._priority || plugin._onInitAllProps) {
                    initPlugins = true;
                }
                if (plugin._onDisable || plugin._onEnable) {
                    this._notifyPluginsOfEnabled = true;
                }
                
            } else {
                this._firstPT = propLookup[p] = pt = {_next:this._firstPT, t:target, p:p, f:(typeof(target[p]) === "function"), n:p, pg:false, pr:0};
                pt.s = (!pt.f) ? parseFloat(target[p]) : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]();
                v = this.vars[p];
                pt.c = (typeof(v) === "string" && v.charAt(1) === "=") ? parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : (Number(v) - pt.s) || 0;
            }
            if (pt) if (pt._next) {
                pt._next._prev = pt;
            }
        }
        
        if (overwrittenProps) if (this._kill(overwrittenProps, target)) { //another tween may have tried to overwrite properties of this tween before init() was called (like if two tweens start at the same time, the one created second will run first)
            return this._initProps(target, propLookup, siblings, overwrittenProps);
        }
        if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
            this._kill(propLookup, target);
            return this._initProps(target, propLookup, siblings, overwrittenProps);
        }
        return initPlugins;
    };
    
    p.render = function(time, suppressEvents, force) {
        var prevTime = this._time,
            isComplete, callback, pt;
        if (time >= this._duration) {
            this._totalTime = this._time = this._duration;
            this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
            if (!this._reversed) {
                isComplete = true;
                callback = "onComplete";
            }
            if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
                if (time === 0 || this._rawPrevTime < 0) if (this._rawPrevTime !== time) {
                    force = true;
                    if (this._rawPrevTime > 0) {
                        callback = "onReverseComplete";
                        if (suppressEvents) {
                            time = -1; //when a callback is placed at the VERY beginning of a timeline and it repeats (or if timeline.seek(0) is called), events are normally suppressed during those behaviors (repeat or seek()) and without adjusting the _rawPrevTime back slightly, the onComplete wouldn't get called on the next render. This only applies to zero-duration tweens/callbacks of course.
                        }
                    }
                }
                this._rawPrevTime = time;
            }
            
        } else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
            this._totalTime = this._time = 0;
            this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
            if (prevTime !== 0 || (this._duration === 0 && this._rawPrevTime > 0)) {
                callback = "onReverseComplete";
                isComplete = this._reversed;
            }
            if (time < 0) {
                this._active = false;
                if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
                    if (this._rawPrevTime >= 0) {
                        force = true;
                    }
                    this._rawPrevTime = time;
                }
            } else if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
                force = true;
            }
            
        } else {
            this._totalTime = this._time = time;
            
            if (this._easeType) {
                var r = time / this._duration, type = this._easeType, pow = this._easePower;
                if (type === 1 || (type === 3 && r >= 0.5)) {
                    r = 1 - r;
                }
                if (type === 3) {
                    r *= 2;
                }
                if (pow === 1) {
                    r *= r;
                } else if (pow === 2) {
                    r *= r * r;
                } else if (pow === 3) {
                    r *= r * r * r;
                } else if (pow === 4) {
                    r *= r * r * r * r;
                }
                
                if (type === 1) {
                    this.ratio = 1 - r;
                } else if (type === 2) {
                    this.ratio = r;
                } else if (time / this._duration < 0.5) {
                    this.ratio = r / 2;
                } else {
                    this.ratio = 1 - (r / 2);
                }
                
            } else {
                this.ratio = this._ease.getRatio(time / this._duration);
            }
            
        }

        if (this._time === prevTime && !force) {
            return;
        } else if (!this._initted) {
            this._init();
            if (!this._initted) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly.
                return;
            }
            //_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
            if (this._time && !isComplete) {
                this.ratio = this._ease.getRatio(this._time / this._duration);
            } else if (isComplete && this._ease._calcEnd) {
                this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
            }
        }
        
        if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
            this._active = true;  //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
        }

        if (prevTime === 0) {
            if (this._startAt) {
                if (time >= 0) {
                    this._startAt.render(time, suppressEvents, force);
                } else if (!callback) {
                    callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
                }
            }
            if (this.vars.onStart) if (this._time !== 0 || this._duration === 0) if (!suppressEvents) {
                this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || _blankArray);
            }
        }

        pt = this._firstPT;
        while (pt) {
            if (pt.f) {
                pt.t[pt.p](pt.c * this.ratio + pt.s);
            } else {
                pt.t[pt.p] = pt.c * this.ratio + pt.s;
            }
            pt = pt._next;
        }
        
        if (this._onUpdate) {
            if (time < 0) if (this._startAt) {
                this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
            }
            if (!suppressEvents) {
                this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _blankArray);
            }
        }
        
        if (callback) if (!this._gc) { //check _gc because there's a chance that kill() could be called in an onUpdate
            if (time < 0 && this._startAt && !this._onUpdate) {
                this._startAt.render(time, suppressEvents, force);
            }
            if (isComplete) {
                if (this._timeline.autoRemoveChildren) {
                    this._enabled(false, false);
                }
                this._active = false;
            }
            if (!suppressEvents && this.vars[callback]) {
                this.vars[callback].apply(this.vars[callback + "Scope"] || this, this.vars[callback + "Params"] || _blankArray);
            }
        }
        
    };
    
    p._kill = function(vars, target) {
        if (vars === "all") {
            vars = null;
        }
        if (vars == null) if (target == null || target === this.target) {
            return this._enabled(false, false);
        }
        target = (typeof(target) !== "string") ? (target || this._targets || this.target) : TweenLite.selector(target) || target;
        var i, overwrittenProps, p, pt, propLookup, changed, killProps, record;
        if ((target instanceof Array || _isSelector(target)) && typeof(target[0]) !== "number") {
            i = target.length;
            while (--i > -1) {
                if (this._kill(vars, target[i])) {
                    changed = true;
                }
            }
        } else {
            if (this._targets) {
                i = this._targets.length;
                while (--i > -1) {
                    if (target === this._targets[i]) {
                        propLookup = this._propLookup[i] || {};
                        this._overwrittenProps = this._overwrittenProps || [];
                        overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
                        break;
                    }
                }
            } else if (target !== this.target) {
                return false;
            } else {
                propLookup = this._propLookup;
                overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
            }

            if (propLookup) {
                killProps = vars || propLookup;
                record = (vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (vars == null || vars._tempKill !== true)); //_tempKill is a super-secret way to delete a particular tweening property but NOT have it remembered as an official overwritten property (like in BezierPlugin)
                for (p in killProps) {
                    if ((pt = propLookup[p])) {
                        if (pt.pg && pt.t._kill(killProps)) {
                            changed = true; //some plugins need to be notified so they can perform cleanup tasks first
                        }
                        if (!pt.pg || pt.t._overwriteProps.length === 0) {
                            if (pt._prev) {
                                pt._prev._next = pt._next;
                            } else if (pt === this._firstPT) {
                                this._firstPT = pt._next;
                            }
                            if (pt._next) {
                                pt._next._prev = pt._prev;
                            }
                            pt._next = pt._prev = null;
                        }
                        delete propLookup[p];
                    }
                    if (record) { 
                        overwrittenProps[p] = 1;
                    }
                }
                if (!this._firstPT && this._initted) { //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.
                    this._enabled(false, false);
                }
            }
        }
        return changed;
    };

    p.invalidate = function() {
        if (this._notifyPluginsOfEnabled) {
            TweenLite._onPluginEvent("_onDisable", this);
        }
        this._firstPT = null;
        this._overwrittenProps = null;
        this._onUpdate = null;
        this._startAt = null;
        this._initted = this._active = this._notifyPluginsOfEnabled = false;
        this._propLookup = (this._targets) ? {} : [];
        return this;
    };
    
    p._enabled = function(enabled, ignoreTimeline) {
        if (!_tickerActive) {
            _ticker.wake();
        }
        if (enabled && this._gc) {
            var targets = this._targets,
                i;
            if (targets) {
                i = targets.length;
                while (--i > -1) {
                    this._siblings[i] = _register(targets[i], this, true);
                }
            } else {
                this._siblings = _register(this.target, this, true);
            }
        }
        Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
        if (this._notifyPluginsOfEnabled) if (this._firstPT) {
            return TweenLite._onPluginEvent((enabled ? "_onEnable" : "_onDisable"), this);
        }
        return false;
    };


//----TweenLite static methods -----------------------------------------------------
    
    TweenLite.to = function(target, duration, vars) {
        return new TweenLite(target, duration, vars);
    };
    
    TweenLite.from = function(target, duration, vars) {
        vars.runBackwards = true;
        vars.immediateRender = (vars.immediateRender != false);
        return new TweenLite(target, duration, vars);
    };
    
    TweenLite.fromTo = function(target, duration, fromVars, toVars) {
        toVars.startAt = fromVars;
        toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
        return new TweenLite(target, duration, toVars);
    };
    
    TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
        return new TweenLite(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, onCompleteScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, onReverseCompleteScope:scope, immediateRender:false, useFrames:useFrames, overwrite:0});
    };
    
    TweenLite.set = function(target, vars) {
        return new TweenLite(target, 0, vars);
    };
/*
    TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, vars) {
        var a = TweenLite.getTweensOf(target), 
            i = a.length;
        while (--i > -1) {
            a[i]._kill(vars, target);
        }
    };

    TweenLite.getTweensOf = function(target) {
        if (target == null) { return []; }
        target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
        var i, a, j, t;
        if ((target instanceof Array || _isSelector(target)) && typeof(target[0]) !== "number") {
            i = target.length;
            a = [];
            while (--i > -1) {
                a = a.concat(TweenLite.getTweensOf(target[i]));
            }
            i = a.length;
            //now get rid of any duplicates (tweens of arrays of objects could cause duplicates)
            while (--i > -1) {
                t = a[i];
                j = i;
                while (--j > -1) {
                    if (t === a[j]) {
                        a.splice(i, 1);
                    }
                }
            }
        } else {
            a = _register(target).concat();
            i = a.length;
            while (--i > -1) {
                if (a[i]._gc) {
                    a.splice(i, 1);
                }
            }
        }
        return a;
    };
*/

    /*
    * ----------------------------------------------------------------
    * TweenPlugin   (could easily be split out as a separate file/class, but included for ease of use (so that people don't need to include another <script> call before loading plugins which is easy to forget)
    * ----------------------------------------------------------------
    */
    var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
                this._overwriteProps = (props || "").split(",");
                this._propName = this._overwriteProps[0];
                this._priority = priority || 0;
                this._super = TweenPlugin.prototype;
            }, true);
    
    p = TweenPlugin.prototype;
    TweenPlugin.version = "1.9.1";
    TweenPlugin.API = 2;
    p._firstPT = null;      
        
    p._addTween = function(target, prop, start, end, overwriteProp, round) {
        var c, pt;
        if (end != null && (c = (typeof(end) === "number" || end.charAt(1) !== "=") ? Number(end) - start : parseInt(end.charAt(0)+"1", 10) * Number(end.substr(2)))) {
            this._firstPT = pt = {_next:this._firstPT, t:target, p:prop, s:start, c:c, f:(typeof(target[prop]) === "function"), n:overwriteProp || prop, r:round};
            if (pt._next) {
                pt._next._prev = pt;
            }
        }
    };
        
    p.setRatio = function(v) {
        var pt = this._firstPT,
            min = 0.000001,
            val;
        while (pt) {
            val = pt.c * v + pt.s;
            if (pt.r) {
                val = (val + ((val > 0) ? 0.5 : -0.5)) >> 0; //about 4x faster than Math.round()
            } else if (val < min) if (val > -min) { //prevents issues with converting very small numbers to strings in the browser
                val = 0;
            }
            if (pt.f) {
                pt.t[pt.p](val);
            } else {
                pt.t[pt.p] = val;
            }
            pt = pt._next;
        }
    };
        
    p._kill = function(lookup) {
        var a = this._overwriteProps,
            pt = this._firstPT,
            i;
        if (lookup[this._propName] != null) {
            this._overwriteProps = [];
        } else {
            i = a.length;
            while (--i > -1) {
                if (lookup[a[i]] != null) {
                    a.splice(i, 1);
                }
            }
        }
        while (pt) {
            if (lookup[pt.n] != null) {
                if (pt._next) {
                    pt._next._prev = pt._prev;
                }
                if (pt._prev) {
                    pt._prev._next = pt._next;
                    pt._prev = null;
                } else if (this._firstPT === pt) {
                    this._firstPT = pt._next;
                }
            }
            pt = pt._next;
        }
        return false;
    };
        
    p._roundProps = function(lookup, value) {
        var pt = this._firstPT;
        while (pt) {
            if (lookup[this._propName] || (pt.n != null && lookup[ pt.n.split(this._propName + "_").join("") ])) { //some properties that are very plugin-specific add a prefix named after the _propName plus an underscore, so we need to ignore that extra stuff here.
                pt.r = value;
            }
            pt = pt._next;
        }
    };
    
    TweenLite._onPluginEvent = function(type, tween) {
        var pt = tween._firstPT, 
            changed, pt2, first, last, next;
        if (type === "_onInitAllProps") {
            //sorts the PropTween linked list in order of priority because some plugins need to render earlier/later than others, like MotionBlurPlugin applies its effects after all x/y/alpha tweens have rendered on each frame.
            while (pt) {
                next = pt._next;
                pt2 = first;
                while (pt2 && pt2.pr > pt.pr) {
                    pt2 = pt2._next;
                }
                if ((pt._prev = pt2 ? pt2._prev : last)) {
                    pt._prev._next = pt;
                } else {
                    first = pt;
                }
                if ((pt._next = pt2)) {
                    pt2._prev = pt;
                } else {
                    last = pt;
                }
                pt = next;
            }
            pt = tween._firstPT = first;
        }
        while (pt) {
            if (pt.pg) if (typeof(pt.t[type]) === "function") if (pt.t[type]()) {
                changed = true;
            }
            pt = pt._next;
        }
        return changed;
    };
    
    TweenPlugin.activate = function(plugins) {
        var i = plugins.length;
        while (--i > -1) {
            if (plugins[i].API === TweenPlugin.API) {
                _plugins[(new plugins[i]())._propName] = plugins[i];
            }
        }
        return true;
    };

    //provides a more concise way to define plugins that have no dependencies besides TweenPlugin and TweenLite, wrapping common boilerplate stuff into one function (added in 1.9.0). You don't NEED to use this to define a plugin - the old way still works and can be useful in certain (rare) situations.
    _gsDefine.plugin = function(config) {
        if (!config || !config.propName || !config.init || !config.API) { throw "illegal plugin definition."; }
        var propName = config.propName,
            priority = config.priority || 0,
            overwriteProps = config.overwriteProps,
            map = {init:"_onInitTween", set:"setRatio", kill:"_kill", round:"_roundProps", initAll:"_onInitAllProps"},
            Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin",
                function() {
                    TweenPlugin.call(this, propName, priority);
                    this._overwriteProps = overwriteProps || [];
                }, (config.global === true)),
            p = Plugin.prototype = new TweenPlugin(propName),
            prop;
        p.constructor = Plugin;
        Plugin.API = config.API;
        for (prop in map) {
            if (typeof(config[prop]) === "function") {
                p[map[prop]] = config[prop];
            }
        }
        Plugin.version = config.version;
        TweenPlugin.activate([Plugin]);
        return Plugin;
    };

    /*
     * ----------------------------------------------------------------
     * TweenMax
     * ----------------------------------------------------------------
     */
    window._gsDefine("TweenMax", ["core.Animation","core.SimpleTimeline","TweenLite"], function(Animation, SimpleTimeline, TweenLite) {
        
        var _slice = [].slice,
            TweenMax = function(target, duration, vars) {
                TweenLite.call(this, target, duration, vars);
                this._cycle = 0;
                this._yoyo = (this.vars.yoyo === true);
                this._repeat = this.vars.repeat || 0;
                this._repeatDelay = this.vars.repeatDelay || 0;
                this._dirty = true; //ensures that if there is any repeat, the totalDuration will get recalculated to accurately report it.
            },
            _isSelector = function(v) {
                return (v.jquery || (v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType)))); //note: we cannot check "nodeType" on window from inside an iframe (some browsers throw a security error)
            },
            p = TweenMax.prototype = TweenLite.to({}, 0.1, {}),
            _blankArray = [];

        TweenMax.version = "1.10.0";
        p.constructor = TweenMax;
        p.kill()._gc = false;
        TweenMax.killTweensOf = TweenMax.killDelayedCallsTo = TweenLite.killTweensOf;
        TweenMax.getTweensOf = TweenLite.getTweensOf;
        TweenMax.ticker = TweenLite.ticker;
    
        p.invalidate = function() {
            this._yoyo = (this.vars.yoyo === true);
            this._repeat = this.vars.repeat || 0;
            this._repeatDelay = this.vars.repeatDelay || 0;
            this._uncache(true);
            return TweenLite.prototype.invalidate.call(this);
        };
/*
        p.updateTo = function(vars, resetDuration) {
            var curRatio = this.ratio, p;
            if (resetDuration && this.timeline && this._startTime < this._timeline._time) {
                this._startTime = this._timeline._time;
                this._uncache(false);
                if (this._gc) {
                    this._enabled(true, false);
                } else {
                    this._timeline.insert(this, this._startTime - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
                }
            }
            for (p in vars) {
                this.vars[p] = vars[p];
            }
            if (this._initted) {
                if (resetDuration) {
                    this._initted = false;
                } else {
                    if (this._notifyPluginsOfEnabled && this._firstPT) {
                        TweenLite._onPluginEvent("_onDisable", this); //in case a plugin like MotionBlur must perform some cleanup tasks
                    }
                    if (this._time / this._duration > 0.998) { //if the tween has finished (or come extremely close to finishing), we just need to rewind it to 0 and then render it again at the end which forces it to re-initialize (parsing the new vars). We allow tweens that are close to finishing (but haven't quite finished) to work this way too because otherwise, the values are so small when determining where to project the starting values that binary math issues creep in and can make the tween appear to render incorrectly when run backwards. 
                        var prevTime = this._time;
                        this.render(0, true, false);
                        this._initted = false;
                        this.render(prevTime, true, false);
                    } else if (this._time > 0) {
                        this._initted = false;
                        this._init();
                        var inv = 1 / (1 - curRatio),
                            pt = this._firstPT, endValue;
                        while (pt) {
                            endValue = pt.s + pt.c; 
                            pt.c *= inv;
                            pt.s = endValue - pt.c;
                            pt = pt._next;
                        }
                    }
                }
            }
            return this;
        };
*/
        p.render = function(time, suppressEvents, force) {
            var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
                prevTime = this._time,
                prevTotalTime = this._totalTime, 
                prevCycle = this._cycle, 
                isComplete, callback, pt, cycleDuration, r, type, pow;
            if (time >= totalDur) {
                this._totalTime = totalDur;
                this._cycle = this._repeat;
                if (this._yoyo && (this._cycle & 1) !== 0) {
                    this._time = 0;
                    this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
                } else {
                    this._time = this._duration;
                    this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
                }
                if (!this._reversed) {
                    isComplete = true;
                    callback = "onComplete";
                }
                if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
                    if (time === 0 || this._rawPrevTime < 0) if (this._rawPrevTime !== time) {
                        force = true;
                        if (this._rawPrevTime > 0) {
                            callback = "onReverseComplete";
                            if (suppressEvents) {
                                time = -1; //when a callback is placed at the VERY beginning of a timeline and it repeats (or if timeline.seek(0) is called), events are normally suppressed during those behaviors (repeat or seek()) and without adjusting the _rawPrevTime back slightly, the onComplete wouldn't get called on the next render. This only applies to zero-duration tweens/callbacks of course.
                            }
                        }
                    }
                    this._rawPrevTime = time;
                }
                
            } else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
                this._totalTime = this._time = this._cycle = 0;
                this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
                if (prevTotalTime !== 0 || (this._duration === 0 && this._rawPrevTime > 0)) {
                    callback = "onReverseComplete";
                    isComplete = this._reversed;
                }
                if (time < 0) {
                    this._active = false;
                    if (this._duration === 0) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
                        if (this._rawPrevTime >= 0) {
                            force = true;
                        }
                        this._rawPrevTime = time;
                    }
                } else if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
                    force = true;
                }
            } else {
                this._totalTime = this._time = time;
                
                if (this._repeat !== 0) {
                    cycleDuration = this._duration + this._repeatDelay;
                    this._cycle = (this._totalTime / cycleDuration) >> 0; //originally _totalTime % cycleDuration but floating point errors caused problems, so I normalized it. (4 % 0.8 should be 0 but Flash reports it as 0.79999999!)
                    if (this._cycle !== 0) if (this._cycle === this._totalTime / cycleDuration) {
                        this._cycle--; //otherwise when rendered exactly at the end time, it will act as though it is repeating (at the beginning)
                    }
                    this._time = this._totalTime - (this._cycle * cycleDuration);
                    if (this._yoyo) if ((this._cycle & 1) !== 0) {
                        this._time = this._duration - this._time;
                    }
                    if (this._time > this._duration) {
                        this._time = this._duration;
                    } else if (this._time < 0) {
                        this._time = 0;
                    }
                }
                
                if (this._easeType) {
                    r = this._time / this._duration;
                    type = this._easeType;
                    pow = this._easePower;
                    if (type === 1 || (type === 3 && r >= 0.5)) {
                        r = 1 - r;
                    }
                    if (type === 3) {
                        r *= 2;
                    }
                    if (pow === 1) {
                        r *= r;
                    } else if (pow === 2) {
                        r *= r * r;
                    } else if (pow === 3) {
                        r *= r * r * r;
                    } else if (pow === 4) {
                        r *= r * r * r * r;
                    }
                    
                    if (type === 1) {
                        this.ratio = 1 - r;
                    } else if (type === 2) {
                        this.ratio = r;
                    } else if (this._time / this._duration < 0.5) {
                        this.ratio = r / 2;
                    } else {
                        this.ratio = 1 - (r / 2);
                    }
                    
                } else {
                    this.ratio = this._ease.getRatio(this._time / this._duration);
                }
                
            }
                
            if (prevTime === this._time && !force) {
                if (prevTotalTime !== this._totalTime) if (this._onUpdate) if (!suppressEvents) { //so that onUpdate fires even during the repeatDelay - as long as the totalTime changed, we should trigger onUpdate.
                    this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _blankArray);
                }
                return;
            } else if (!this._initted) {
                this._init();
                if (!this._initted) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly.
                    return;
                }
                //_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
                if (this._time && !isComplete) {
                    this.ratio = this._ease.getRatio(this._time / this._duration);
                } else if (isComplete && this._ease._calcEnd) {
                    this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
                }
            }
            
            if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
                this._active = true; //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
            }
            if (prevTotalTime === 0) {
                if (this._startAt) {
                    if (time >= 0) {
                        this._startAt.render(time, suppressEvents, force);
                    } else if (!callback) {
                        callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
                    }
                }
                if (this.vars.onStart) if (this._totalTime !== 0 || this._duration === 0) if (!suppressEvents) {
                    this.vars.onStart.apply(this.vars.onStartScope || this, this.vars.onStartParams || _blankArray);
                }
            }
            
            pt = this._firstPT;
            while (pt) {
                if (pt.f) {
                    pt.t[pt.p](pt.c * this.ratio + pt.s);
                } else {
                    pt.t[pt.p] = pt.c * this.ratio + pt.s;
                }
                pt = pt._next;
            }
            
            if (this._onUpdate) {
                if (time < 0) if (this._startAt) {
                    this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
                }
                if (!suppressEvents) {
                    this._onUpdate.apply(this.vars.onUpdateScope || this, this.vars.onUpdateParams || _blankArray);
                }
            }
            if (this._cycle !== prevCycle) if (!suppressEvents) if (!this._gc) if (this.vars.onRepeat) {
                this.vars.onRepeat.apply(this.vars.onRepeatScope || this, this.vars.onRepeatParams || _blankArray);
            }
            if (callback) if (!this._gc) { //check gc because there's a chance that kill() could be called in an onUpdate
                if (time < 0 && this._startAt && !this._onUpdate) {
                    this._startAt.render(time, suppressEvents, force);
                }
                if (isComplete) {
                    if (this._timeline.autoRemoveChildren) {
                        this._enabled(false, false);
                    }
                    this._active = false;
                }
                if (!suppressEvents && this.vars[callback]) {
                    this.vars[callback].apply(this.vars[callback + "Scope"] || this, this.vars[callback + "Params"] || _blankArray);
                }
            }
        };
        
//---- STATIC FUNCTIONS -----------------------------------------------------------------------------------------------------------
        
        TweenMax.to = function(target, duration, vars) {
            return new TweenMax(target, duration, vars);
        };
        
        TweenMax.from = function(target, duration, vars) {
            vars.runBackwards = true;
            vars.immediateRender = (vars.immediateRender != false);
            return new TweenMax(target, duration, vars);
        };
        
        TweenMax.fromTo = function(target, duration, fromVars, toVars) {
            toVars.startAt = fromVars;
            toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
            return new TweenMax(target, duration, toVars);
        };
        
        TweenMax.staggerTo = TweenMax.allTo = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
            stagger = stagger || 0;
            var delay = vars.delay || 0,
                a = [],
                finalComplete = function() {
                    if (vars.onComplete) {
                        vars.onComplete.apply(vars.onCompleteScope || this, vars.onCompleteParams || _blankArray);
                    }
                    onCompleteAll.apply(onCompleteAllScope || this, onCompleteAllParams || _blankArray);
                },
                l, copy, i, p;
            if (!(targets instanceof Array)) {
                if (typeof(targets) === "string") {
                    targets = TweenLite.selector(targets) || targets;
                }
                if (_isSelector(targets)) {
                    targets = _slice.call(targets, 0);
                }
            }
            l = targets.length;
            for (i = 0; i < l; i++) {
                copy = {};
                for (p in vars) {
                    copy[p] = vars[p];
                }
                copy.delay = delay;
                if (i === l - 1 && onCompleteAll) {
                    copy.onComplete = finalComplete;
                }
                a[i] = new TweenMax(targets[i], duration, copy);
                delay += stagger;
            }
            return a;
        };
        
        TweenMax.staggerFrom = TweenMax.allFrom = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
            vars.runBackwards = true;
            vars.immediateRender = (vars.immediateRender != false);
            return TweenMax.staggerTo(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
        };
        
        TweenMax.staggerFromTo = TweenMax.allFromTo = function(targets, duration, fromVars, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
            toVars.startAt = fromVars;
            toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
            return TweenMax.staggerTo(targets, duration, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
        };
                
        TweenMax.delayedCall = function(delay, callback, params, scope, useFrames) {
            return new TweenMax(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, onCompleteScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, onReverseCompleteScope:scope, immediateRender:false, useFrames:useFrames, overwrite:0});
        };
/*
        TweenMax.set = function(target, vars) {
            return new TweenMax(target, 0, vars);
        };

        TweenMax.isTweening = function(target) {
            var a = TweenLite.getTweensOf(target),
                i = a.length,
                tween;
            while (--i > -1) {
                tween = a[i];
                if (tween._active || (tween._startTime === tween._timeline._time && tween._timeline._active)) {
                    return true;
                }
            }
            return false;
        };

        var _getChildrenOf = function(timeline, includeTimelines) {
                var a = [],
                    cnt = 0,
                    tween = timeline._first;
                while (tween) {
                    if (tween instanceof TweenLite) {
                        a[cnt++] = tween;
                    } else {
                        if (includeTimelines) {
                            a[cnt++] = tween;
                        }
                        a = a.concat(_getChildrenOf(tween, includeTimelines));
                        cnt = a.length;
                    }
                    tween = tween._next;
                }
                return a;
            }, 
            getAllTweens = TweenMax.getAllTweens = function(includeTimelines) {
                return _getChildrenOf(Animation._rootTimeline, includeTimelines).concat( _getChildrenOf(Animation._rootFramesTimeline, includeTimelines) );
            };

        TweenMax.killAll = function(complete, tweens, delayedCalls, timelines) {
            if (tweens == null) {
                tweens = true;
            }
            if (delayedCalls == null) {
                delayedCalls = true;
            }
            var a = getAllTweens((timelines != false)),
                l = a.length,
                allTrue = (tweens && delayedCalls && timelines),
                isDC, tween, i;
            for (i = 0; i < l; i++) {
                tween = a[i];
                if (allTrue || (tween instanceof SimpleTimeline) || ((isDC = (tween.target === tween.vars.onComplete)) && delayedCalls) || (tweens && !isDC)) {
                    if (complete) {
                        tween.totalTime(tween.totalDuration());
                    } else {
                        tween._enabled(false, false);
                    }
                }
            }
        };

        TweenMax.killChildTweensOf = function(parent, complete) {
            if (parent == null) {
                return;
            }
            var tl = TweenLite._tweenLookup,
                a, curParent, p, i, l;
            if (typeof(parent) === "string") {
                parent = TweenLite.selector(parent) || parent;
            }
            if (_isSelector(parent)) {
                parent = _slice(parent, 0);
            }
            if (parent instanceof Array) {
                i = parent.length;
                while (--i > -1) {
                    TweenMax.killChildTweensOf(parent[i], complete);
                }
                return;
            }
            a = [];
            for (p in tl) {
                curParent = tl[p].target.parentNode;
                while (curParent) {
                    if (curParent === parent) {
                        a = a.concat(tl[p].tweens);
                    }
                    curParent = curParent.parentNode;
                }
            }
            l = a.length;
            for (i = 0; i < l; i++) {
                if (complete) {
                    a[i].totalTime(a[i].totalDuration());
                }
                a[i]._enabled(false, false);
            }
        };

        var _changePause = function(pause, tweens, delayedCalls, timelines) {
            tweens = (tweens !== false);
            delayedCalls = (delayedCalls !== false);
            timelines = (timelines !== false);
            var a = getAllTweens(timelines),
                allTrue = (tweens && delayedCalls && timelines),
                i = a.length,
                isDC, tween;
            while (--i > -1) {
                tween = a[i];
                if (allTrue || (tween instanceof SimpleTimeline) || ((isDC = (tween.target === tween.vars.onComplete)) && delayedCalls) || (tweens && !isDC)) {
                    tween.paused(pause);
                }
            }
        };

        TweenMax.pauseAll = function(tweens, delayedCalls, timelines) {
            _changePause(true, tweens, delayedCalls, timelines);
        };
        
        TweenMax.resumeAll = function(tweens, delayedCalls, timelines) {
            _changePause(false, tweens, delayedCalls, timelines);
        };
*/
    
//---- GETTERS / SETTERS ----------------------------------------------------------------------------------------------------------
        
        p.progress = function(value) {
            return (!arguments.length) ? this._time / this.duration() : this.totalTime( this.duration() * ((this._yoyo && (this._cycle & 1) !== 0) ? 1 - value : value) + (this._cycle * (this._duration + this._repeatDelay)), false);
        };
        
        p.totalProgress = function(value) {
            return (!arguments.length) ? this._totalTime / this.totalDuration() : this.totalTime( this.totalDuration() * value, false);
        };
        
        p.time = function(value, suppressEvents) {
            if (!arguments.length) {
                return this._time;
            }
            if (this._dirty) {
                this.totalDuration();
            }
            if (value > this._duration) {
                value = this._duration;
            }
            if (this._yoyo && (this._cycle & 1) !== 0) {
                value = (this._duration - value) + (this._cycle * (this._duration + this._repeatDelay));
            } else if (this._repeat !== 0) {
                value += this._cycle * (this._duration + this._repeatDelay);
            }
            return this.totalTime(value, suppressEvents);
        };

        p.duration = function(value) {
            if (!arguments.length) {
                return this._duration; //don't set _dirty = false because there could be repeats that haven't been factored into the _totalDuration yet. Otherwise, if you create a repeated TweenMax and then immediately check its duration(), it would cache the value and the totalDuration would not be correct, thus repeats wouldn't take effect.
            }
            return Animation.prototype.duration.call(this, value);
        };

        p.totalDuration = function(value) {
            if (!arguments.length) {
                if (this._dirty) {
                    //instead of Infinity, we use 999999999999 so that we can accommodate reverses
                    this._totalDuration = (this._repeat === -1) ? 999999999999 : this._duration * (this._repeat + 1) + (this._repeatDelay * this._repeat);
                    this._dirty = false;
                }
                return this._totalDuration;
            }
            return (this._repeat === -1) ? this : this.duration( (value - (this._repeat * this._repeatDelay)) / (this._repeat + 1) );
        };
/*
        p.repeat = function(value) {
            if (!arguments.length) {
                return this._repeat;
            }
            this._repeat = value;
            return this._uncache(true);
        };
        
        p.repeatDelay = function(value) {
            if (!arguments.length) {
                return this._repeatDelay;
            }
            this._repeatDelay = value;
            return this._uncache(true);
        };
        
        p.yoyo = function(value) {
            if (!arguments.length) {
                return this._yoyo;
            }
            this._yoyo = value;
            return this;
        };
*/
        
        return TweenMax;
        
    }, true);


    //now run through all the dependencies discovered and if any are missing, log that to the console as a warning. This is why it's best to have TweenLite load last - it can check all the dependencies for you. 
    a = window._gsQueue;
    if (a) {
        for (i = 0; i < a.length; i++) {
            a[i]();
        }
        for (p in _defLookup) {
            if (!_defLookup[p].func) {
                window.console.log("GSAP encountered missing dependency: com.greensock." + p);
            }
        }
    }

    _tickerActive = false; //ensures that the first official animation forces a ticker.tick() to update the time when it is instantiated

    return _globals.TweenMax;
});
