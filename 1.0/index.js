/**
 * @fileoverview 分层动画组件
 * @author agu.hc<blueaqua2000@gmail.com>
 * @module layer-anim
 * @date 2013-3-6
 */
KISSY.add(function(KISSY, Event, DOM, UA, Tween, Timeline)
{
    /**
     * 配置参数：
       // 单一动画
       {
           node: String/HTMLNode,  // 动画节点（选择符/DOM节点）
           from:  // 起始值
           {
               ...
           },
           to:  // 结束值
           {
               ...
           },
           duration: 1,  // 动画时长（单位：秒）
           easing: ...,  // 平滑过渡效果
           delay: 0,  // 延迟播放时间（单位：秒）
           align: "normal",  // 播放顺序（"normal"：所有动画同时开始播放，支持delay。"sequence"：上一动画播放完再播放该动画。）
           overwrite: "auto",  // 如果多个动画同时作用于同一个DOM节点，其设置的CSS属性相互冲突时，解决冲突的方式
           degrade:  // 降级设置（当前浏览器版本高于指定版本时，动画才生效）
           {
               "浏览器名称": "版本"  // 例如：ie: 7
           }
       },
       // 动画分组
       [
           {
               ...  // 同上
           },
           ...
       ]
     * 事件：
       end: 动画播放完，触发该事件
     * 基于GreenSock（www.greensock.com）开发，包含模块：TweenLite, TimelineLite, EasingPack, CssPlugin
     */
    function LayerAnim(config)
    {
        this._init(config ? config instanceof Array ? config : [config] : []);  // 初始化
    };

    LayerAnim.prototype =
    {
        /**
         * 初始化
         * @private
         * @param config 配置参数
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
                    onCompleteScope: this,
                    onComplete: this._completeHandler
                });
                this._createAnim(config, anim);  // 创建动画/动画组
            }
        },

        /**
         * 动画播放完成事件处理
         * @private
         */
        _completeHandler: function()
        {
            if (this.once)  // 释放相关引用
            {
                this.anim.kill();
            }
            this.fire("end");
        },

        /**
         * 播放动画（如果动画未播放完，则从当前位置继续播放。如果动画已播放完，则调用该方法没有任何效果，如需重新播放，使用rerun方法）
         * @public
         * @param once {Boolean} 可选，是否只运行一次，即动画播放完后释放相关资源，以便垃圾回收（默认：false）
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        run: function(once)
        {
            this.once = once;  // 动画播放完后是否释放相关引用，便于垃圾回收
            this.anim.play();  // 运行动画
            return this;
        },

        /**
         * 重新播放动画
         * @public
         * @returns {LayerAnim} 分层动画对象（支持链式调用）
         */
        rerun: function()
        {
            return this.stop(false).run();  // 停止播放并从头开始播放
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
            this.anim.seek(position || 0);
            return this;
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
                var anims = [], i = 0, size = config.length, effect, anim;
                for (; i < size; ++ i)
                {
                    if (effect = config[i])  // 动画配置
                    {
                        if (effect instanceof Array)  // 动画组
                        {
                            anim = new Timeline();  // 创建动画时间线（GreenSock）
                            this._createAnim(effect, anim);  // 创建动画组
                            effect = effect[0];  // 根据该组的第一个动画配置，确定是否与上一动画顺序播放
                        }
                        else
                        {
                            anim = this._createTween(effect);  // 创建动画
                        }
                        if (effect.align == "sequence" && anims.length)  // 顺序播放多个动画
                        {
                            parentAnims.add(anims);  // 添加到父动画组
                            anims = [anim];
                        }
                        else  // 同时播放多个动画
                        {
                            anims.push(anim);
                        }
                    }
                }
                parentAnims.add(anims);  // 添加到父动画组
            }
        },

        /**
         * 创建动画
         * @private
         * @param config {Object} 动画配置
         * @returns {Tween} 动画对象（GreenSock）
         */
        _createTween: function(config)
        {
            var result, node, from, to, duration;
            if (config && (node = DOM.get(config.node)))
            {
                config = this._degrade(config);  // 动画降级处理
                duration = config.duration;  // 动画时长
                if (from = config.from)  // 起始值
                {
                    from =
                    {
                        css: from,
                        delay: config.delay,
                        ease: config.easing,
                        overwrite: config.overwrite
                    };
                }
                if (to = config.to)  // 结束值
                {
                    to =
                    {
                        css: to,
                        delay: config.delay,
                        ease: config.easing,
                        overwrite: config.overwrite
                    };
                    if (from)
                    {
                        result = Tween.fromTo(node, duration, from, to);
                    }
                    else
                    {
                        result = Tween.to(node, duration, to);
                    }
                }
                else if (from)
                {
                    result = Tween.from(node, duration, from);
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
            var degrade = config.degrade, i;
            for (i in degrade)
            {
                if (degrade.hasOwnProperty(i) && typeof UA[i] != "undefined" && this._compareVersion(UA[i], degrade[i]) <= 0)  // 当前浏览器版本低于指定版本
                {
                    config.duration = 0.01;  // 动画时长设置为0.01，即该动画不生效，直接变为结束值
                    break;
                }
            }
            return config;
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
            this.anim.clear();  // 动画配置有修改，删除已创建的动画
            return this;
        }
    };

    KISSY.augment(LayerAnim, Event.Target);  // 支持事件
    return LayerAnim;
},
{
    requires: ["event", "dom", "ua", "./tween", "./timeline", "./easing", "./css"]
});
