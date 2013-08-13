/**
 * @fileoverview 分层动画组件
 * @author 阿古<agu.hc@taobao.com>
 * @module layer-anim
 * @version 1.1
 * @date 2013-7-29
 */
KISSY.add(function(KISSY, Event, DOM, UA, Tween, Timeline)
{
    /**
     * 配置参数：
       // 单一动画
       {
           node: String/HTMLNode,  // 动画节点（选择符/DOM节点，支持数组）
           from:  // 起始值
           {
               ...
           },
           to:  // 结束值
           {
               ...
           },
           duration: 1,  // 动画时长（单位：秒）
           easing: ...,  // 过渡效果
           delay: 0,  // 延迟播放时间（单位：秒）
           align: "normal",  // 播放顺序（"normal"：所有动画同时开始播放，"sequence"：上一动画播放完再播放该动画。）
           overwrite: "auto",  // 如果多个动画同时作用于同一个DOM节点，其设置的CSS属性相互冲突时，解决冲突的方式
           stagger: 0,  // 各动画间隔播放的时间（单位：秒）（仅node为数组时有效）
           repeat: 0,  // 首次播放后的重复次数（-1：无限重复）
           repeatDelay: 0,  // 每次重复播放前的延迟时间（单位：秒）
           yoyo: false,  // 重复播放时，是否以相反顺序播放（每次都与上次播放顺序相反）
           degrade:  // 降级设置（当前浏览器版本高于指定版本时，动画才生效）
           {
               "浏览器名称": "版本"  // 例如：ie: 7
           }
       }
       // 动画组
       [
           {
               ...  // 同上
           },
           ...
       ]
       或
       {
           anims:  // 动画组
           [  // 同上
               {
                   ...
               },
               ...
           ],
           align: "normal",
           repeat: 0,
           repeatDelay: 0,
           yoyo: false,
           stagger: 0,
           degrade: {...}
       }
     * 事件：
       start: 动画开始播放时，触发该事件
       update: 每帧动画更新时，触发该事件
       end: 动画播放完，触发该事件
     * 基于GreenSock（www.greensock.com）开发，包含模块：TweenMax, TimelineMax, CssPlugin, EasingPack
     */
    function LayerAnim(config)
    {
        this._init(config);  // 初始化
    };

    LayerAnim.prototype =
    {
        /**
         * 初始化
         * @private
         * @param config [Object] 配置参数
         */
        _init: function(config)
        {
            if (! this.anim)
            {
                // 创建根动画时间线
                var anim = this.anim = new Timeline(
                {
                    paused: true,
                    smoothChildTiming: true,
                    onStart: this.fire,
                    onStartParams: ["start"],
                    onStartScope: this,
                    onUpdate: this.fire,
                    onUpdateParams: ["update"],
                    onUpdateScope: this,
                    onComplete: this.fire,
                    onCompleteParams: ["end"],
                    onCompleteScope: this
                });
                this._createAnim(config, anim);  // 创建动画/动画组
            }
        },

        /**
         * 播放动画
         * @public
         * @param position {Number} 起始播放时间点（单位：秒，默认：0，从头播放动画）
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        run: function(position)
        {
            // 停止播放并从头开始播放
            this.stop(false);
            this.anim.play(typeof position == "number" ? position : 0);  // 运行动画
            return this;
        },

        /**
         * 重新播放动画
         * @public
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        rerun: function()
        {
            return this.run();
        },
        
        /**
         * 反向播放动画（如果动画尚未播放，则调用该方法没有任何效果）
         * @public
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        runReverse: function()
        {
            this.anim.reverse();
        },
        
        /**
         * 暂停动画
         * @public
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        pause: function()
        {
            this.anim.pause();
            return this;
        },

        /**
         * 继续播放动画
         * @public
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        resume: function()
        {
            this.anim.resume();
            return this;
        },

        /**
         * 停止动画，并跳转到初始位置
         * @public
         * @param reset {Boolean} 是否将动画起始/结束值重置为当前的CSS值，默认：true
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        stop: function(reset)
        {
            var anim = this.anim;
            if (reset !== false)
            {
                anim.invalidate();  // 重新计算动画起始/结束值
            }
            anim.pause(0);  // 暂停动画并重置
            return this;
        },

        /**
         * 跳转到指定时间点
         * @public
         * @param position {Number} 时间点（单位：秒，默认：0）
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        seek: function(position)
        {
            this.anim.seek(typeof position == "number" ? position : 0);
            return this;
        },

        /**
         * 获取当前动画播放时间
         * @returns {Number} 当前动画播放时间（单位：秒）
         */
        time: function()
        {
            return this.anim.totalTime();
        },
        
        /**
         * 跳转到动画结束时刻
         * @public
         */
        end: function()
        {
            var anim = this.anim;
            anim.play(anim.totalDuration());
        },

        /**
         * 停止动画并释放相关资源，以便垃圾回收
         * @public
         */
        kill: function()
        {
            this.anim.kill();
        },
        
        /**
         * 创建动画/动画组
         * @private
         * @param config {Object} 动画配置
         * @param anims {Timeline} 父动画组
         */
        _createAnim: function(config, parentAnims)
        {
            if (config)
            {
                var anims, anim, effects, effect, size, i;
                if (config instanceof Array)  // 动画组
                {
                    anims = [];
                    for (i = 0, size = config.length; i < size; ++ i)
                    {
                        if (effect = config[i])  // 动画配置
                        {
                            if (effect instanceof Array)  // 动画组
                            {
                                anim = new Timeline({smoothChildTiming: true});  // 创建GreenSock动画时间轴
                                this._createAnim(effect, anim);  // 创建动画组
                                // 根据动画组的第一个动画配置，确定是否与上一动画顺序播放
                                while (effects = effect[0])
                                {
                                    effect = effects;
                                }
                            }
                            else
                            {
                                anim = this._createTween(effect);  // 创建动画
                            }
                            if (effect.align == "sequence" && anims.length)  // 顺序播放
                            {
                                parentAnims.add(anims);  // 添加到父动画组
                                anims = [anim];  // 下一动画组
                            }
                            else  // 同时播放多个动画
                            {
                                anims.push(anim);
                            }
                        }
                    }
                }
                else  // 动画
                {
                    anims = this._createTween(config);  // 创建动画
                }
                parentAnims.add(anims);  // 添加到父动画组
            }
        },

        /**
         * 创建动画
         * @private
         * @param config {Object} 动画配置
         * @returns {Tween} GreenSock动画对象
         */
        _createTween: function(config)
        {
            var result, anims, gsObj, node, from, to, duration, delay, stagger, staggerType, easing, overwrite, repeat, repeatDelay, yoyo;
            if (config)
            {
                config = this._degrade(config);  // 动画降级处理
                if ((anims = config.anims) instanceof Array)  // 动画组
                {
                    result = new Timeline(
                    {
                        repeat: config.repeat,
                        repeatDelay: config.repeatDelay,
                        yoyo: config.yoyo,
                        stagger: config.stagger
                    });
                    this._createAnim(anims, result);
                }
                else  // 动画
                {
                    node = config.node;  // 动画节点
                    if (typeof node == "string")
                    {
                        node = DOM.get(node);
                    }
                    duration = config.duration;  // 动画时长
                    delay = config.delay;  // 延迟时间
                    stagger = config.stagger;  // 间隔播放时间
                    easing = config.easing;  // 平滑过渡效果
                    overwrite = config.overwrite;  // 冲突解决方式
                    staggerType = stagger && (node instanceof Array);  // 间隔播放一组动画
                    gsObj = staggerType ? new Timeline() : Tween;  // 动画对象
                    repeat = config.repeat;  // 首次播放后的重复次数
                    repeatDelay = config.repeatDelay;  // 每次重复之间的间隔时间
                    yoyo = config.yoyo;  // 重复播放时，是否以相反顺序播放（每次都与上次播放顺序相反）
                    if (from = config.from)  // 起始值
                    {
                        from.delay = delay;
                        from.ease = easing;
                        from.overwrite = overwrite;
                        from.repeat = repeat;
                        from.repeatDelay = repeatDelay;
                        from.yoyo = yoyo;
                    }
                    if (to = config.to)  // 结束值
                    {
                        to.delay = delay;
                        to.ease = easing;
                        to.overwrite = overwrite;
                        to.repeat = repeat;
                        to.repeatDelay = repeatDelay;
                        to.yoyo = yoyo;
                        if (from)
                        {
                            result = gsObj[staggerType ? "staggerFromTo" : "fromTo"](node, duration, from, to, stagger);
                        }
                        else
                        {
                            result = gsObj[staggerType ? "staggerTo" : "to"](node, duration, to, stagger);
                        }
                    }
                    else if (from)
                    {
                        result = gsObj[staggerType ? "staggerFrom" : "from"](node, duration, from, stagger);
                    }
                }
            }
            return result;
        },

        /**
         * 降级处理
         * @private
         * @param config {Object} 动画配置
         * @returns {Object} 降级后的动画配置
         */
        _degrade: function(config)
        {
            var degrade = config.degrade, ver, i;
            for (i in degrade)
            {
                ver = UA[i];
                if (typeof ver != "undefined" && this._compareVersion(ver, degrade[i]) <= 0)  // 当前浏览器版本低于指定版本
                {
                    this._disableAnim(config);
                    break;
                }
            }
            return config;
        },

        /**
         * 禁用动画（动画不生效，直接变为结束值）
         * @private
         * @param config {Object} 动画配置
         */
        _disableAnim: function(config)
        {
            var anims = config.anims, i;
            if (config instanceof Array || anims)  // 动画组
            {
                if (anims)
                {
                    config.repeatDelay = 0;
                    config = anims;
                }
                for (i = config.length; -- i > -1;)
                {
                    this._disableAnim(config[i]);
                }
            }
            else  // 动画
            {
                config.duration = 0.001;  // 动画时长设置为很小的值，使其不生效，直接变为结束值
                config.stagger = config.delay = config.repeatDelay = 0;
            }
        },
        
        /**
         * 比较浏览器版本
         * @private
         * @param a {Number/String} 浏览器版本A
         * @param b {Number/String} 浏览器版本B
         * @returns {Number} 比较结果（-1：版本A < 版本B，0：版本A == 版本B，1：版本A > 版本B）
         */
        _compareVersion: function(a, b)
        {
            var aPart, aParts, bPart, bParts, i, len;
            if (a === b)
            {
                return 0;
            }
            aParts = (a + '').split('.');
            bParts = (b + '').split('.');
            for (i = 0, len = Math.max(aParts.length, bParts.length); i < len; ++ i)
            {
                aPart = parseInt(aParts[i], 10);
                bPart = parseInt(bParts[i], 10);
                isNaN(aPart) && (aPart = 0);
                isNaN(bPart) && (bPart = 0);
                if (aPart < bPart)
                {
                    return -1;
                }
                if (aPart > bPart)
                {
                    return 1;
                }
            }
            return 0;
        },

        /**
         * 添加动画（动画被添加到最后）
         * @public
         * @param config {Object} 动画配置
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        add: function(config)
        {
            this._createAnim(config, this.anim);
            return this;
        },

        /**
         * 删除所有动画
         * @public
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        clear: function()
        {
            this.anim.clear();  // 删除已创建的动画
            return this;
        }
    };

    KISSY.augment(LayerAnim, Event.Target);  // 支持事件
    return LayerAnim;
},
{
    requires: ["event", "dom", "ua", "./tween", "./timeline", "./easing", "./css"]
});
