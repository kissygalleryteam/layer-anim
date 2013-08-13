KISSY.use("gallery/layer-anim/1.1/, dom, event, json", function(S, LayerAnim, DOM, Event, JSON)
{
    // Shark
    var nodeShark = DOM.get(".shark");
    new LayerAnim(
    {
        node: nodeShark,
        from:
        {
            left: -200,
            top: 16,
            autoAlpha: 1
        },
        to:
        {
            left: 970,
            top: 20,
            autoAlpha: 0
        },
        easing: "Power1.easeIn",
        repeat: -1,
        repeatDelay: 18,
        duration: 20
    }).run();

    // Fishes
    var nodeFishes = DOM.get(".fishes");
    new LayerAnim(
    {
        node: nodeFishes,
        to:
        {
            right: 580,
            autoAlpha: 0
        },
        easing: "Power2.easeOut",
        duration: 10
    }).run();

    // LOGO
    var nodeLogo = DOM.get(".logo"), animLogoActived;
    new LayerAnim(
    {
        node: nodeLogo,
        to:
        {
            opacity: 1
        },
        easing: "Power2.easeOut",
        delay: 0.2,
        duration: 0.6
    }).run();
    Event.on(nodeLogo, "mouseenter", function(e)
    {
        if (animLogoActived)
        {
            animLogoActived.kill();
        }
        animLogoActived = new LayerAnim(
        {
            node: nodeLogo,
            from:
            {
                opacity: 1
            },
            to:
            {
                textShadow: "#FFF 0px 0px 10px, #FFF 0px 0px 10px"
            },
            easing: "Power1.easeIn",
            repeat: -1,
            repeatDelay: 0.8,
            yoyo: true,
            overwrite: "all",
            duration: 0.9
        }).run();
    });
    Event.on(nodeLogo, "mouseleave", function(e)
    {
        new LayerAnim(
        {
            node: nodeLogo,
            to:
            {
                textShadow: "#FFF 0px 0px 0px, #FFF 0px 0px 0px"
            },
            overwrite: "all",
            duration: 0.6
        }).run();
    });

    // MISC
    var nodeMisc = DOM.get(".misc"), nodeMiscs = DOM.query("span", nodeMisc), animMiscActived, animMiscInactived;
    Event.on(nodeMisc, "mouseenter", function(e)
    {
        if (! animMiscActived)
        {
            animMiscActived = new LayerAnim(
            {
                anims:
                [
                    {
                        node: nodeMiscs,
                        to:
                        {
                            marginTop: -10
                        },
                        stagger: 0.04,
                        duration: 0.2
                    },
                    {
                        node: nodeMiscs,
                        to:
                        {
                            marginTop: 0
                        },
                        delay: 0.2,
                        stagger: 0.04,
                        easing: "Power2.easeOut",
                        duration: 0.2
                    }
                ],
                repeat: -1,
                repeatDelay: 0.6
            });
        }
        animMiscActived.run();
    });
    Event.on(nodeMisc, "mouseleave", function(e)
    {
        if (animMiscActived)
        {
            animMiscActived.stop(false);
        }
    });
    
    // Fish
    var nodeSmallFish = DOM.get(".small-fish"), configSmallFish =
    {
        anims:
        [
            {
                node: nodeSmallFish,
                from:
                {
                    width: 110,
                    height: 56,
                    right: -110
                },
                to:
                {
                    width: 190,
                    height: 97,
                    right: 100
                },
                easing: "Power2.easeOut",
                duration: 2
            },
            {
                node: nodeSmallFish,
                to:
                {
                    width: 110,
                    height: 56,
                    right: 960
                },
                align: "sequence",
                easing: "Power2.easeIn",
                delay: 0.8,
                duration: 1.4
            }
        ]
    };
    var nodeMidFish = DOM.get(".mid-fish"), configMidFish =
    {
        anims:
        [
            {
                node: nodeMidFish,
                from:
                {
                    width: 240,
                    height: 179,
                    right: -240
                },
                to:
                {
                    width: 325,
                    height: 242,
                    right: 480
                },
                easing: "Power3.easeOut",
                delay: 0.6,
                duration: 2.4
            },
            {
                node: nodeMidFish,
                to:
                {
                    width: 240,
                    height: 179,
                    right: 960
                },
                align: "sequence",
                easing: "Power2.easeIn",
                duration: 1.2
            }
        ]
    };
    var nodeBigFish = DOM.get(".big-fish"), configBigFish =
    {
        anims:
        [
            {
                node: nodeBigFish,
                from:
                {
                    width: 300,
                    height: 214,
                    right: -300
                },
                to:
                {
                    width: 488,
                    height: 348,
                    right: 100
                },
                easing: "Power3.easeOut",
                delay: 0.4,
                duration: 1.2
            },
            {
                node: nodeBigFish,
                to:
                {
                    width: 300,
                    height: 214,
                    right: 960
                },
                align: "sequence",
                easing: "Power3.easeIn",
                delay: 0.8,
                duration: 1
            }
        ]
    };
    var configs =
    {
        BigFish: configBigFish,
        MidFish: configMidFish,
        SmallFish: configSmallFish
    };
    
    var editor =
    {
        nodeTimeLines: {},  // The timeline nodes {id, [scale HTMLNode]}
        currentTimeline: null,
        _unitLength: 150,  // px/s

        init: function()
        {
            // initialize timeline
            this.initTimeline("BigFish");
            this.refreshTimeline("BigFish");
            this.initTimeline("MidFish");
            this.refreshTimeline("MidFish");
            this.initTimeline("SmallFish");
            this.refreshTimeline("SmallFish");
            var nodeEditor = DOM.get("#J-Timeline");
            Event.delegate(nodeEditor, "click", ".anim-group", this._groupClickHandler, this);
            Event.delegate(nodeEditor, "click", ".anim-group-member", this._memberClickHandler, this);
            // initialize editor
            this.nodePointer = DOM.get("#J-Pointer");
            var nodePropertyEditor = this.nodePropertyEditor = DOM.get("#J-PropertyEditor");
            var props = ["from", "to", "duration", "align", "easing", "overwrite", "delay", "repeat", "repeatDelay", "yoyo", "degrade"], nodeEditors = this.nodeEditors = {}, i = props.length, node;
            for (; -- i > -1;)
            {
                node = nodeEditors[props[i]] = DOM.get(".prop-" + props[i], nodePropertyEditor);
                if (node.tagName == "TEXTAREA")
                {
                    node.value = "";
                    Event.on(node, "valuechange", this._handleTextAreaValueChange, this);
                }
                else if (node.type == "text")
                {
                    node.value = "";
                    Event.on(node, "valuechange", this._handleTextValueChange, this);
                }
                else if (node.tagName == "SELECT")
                {
                    Event.on(node, "change", this._handleSelectChange, this);
                }
                else if (node.type == "checkbox")
                {
                    node.checked = false;
                    Event.on(node, "click", this._handleCheckChange, this);
                }
            }
            // initialize action buttons
            node = this.nodePlayback = DOM.get("#J-Playback");
            Event.on(node, "click", this._handlePlaybackClick, this);
            Event.on(node, "mousedown", this._handleButtonDown, this);
            Event.on(node, "mouseup", this._handleButtonUp, this);
            node = this.nodeStop = DOM.get("#J-Stop");
            Event.on(node, "click", this._handleStopClick, this);
            Event.on(node, "mousedown", this._handleButtonDown, this);
            Event.on(node, "mouseup", this._handleButtonUp, this);
        },
        
        initTimeline: function(id)
        {
            var nodeTimeLines = this.nodeTimeLines[id] = [], i = 0, node;
            node = nodeTimeLines.nodeGroup = DOM.get(".anim-layer", "#J-" + id + "Group");
            for (; i < 2; ++ i)
            {
                nodeTimeLines[i] = DOM.get(".anim-layer", "#J-" + id + i);
            }
        },

        refreshTimeline: function(id)
        {
            var nodeTimeLines = this.nodeTimeLines[id], config = configs[id].anims, unitLength = this._unitLength, i = 0, duration = 0, delay = 0, delays = [], lens = [], node, len;
            for (; i < 2; ++ i)
            {
                node = nodeTimeLines[i];
                len = config[i].duration * unitLength;
                DOM.text(DOM.get(".layer-duration", node), config[i].duration + "s");
                DOM.css(node, "width", len);
                if (config[i].align == "sequence")
                {
                    delay += duration + (config[i].delay || 0) * unitLength;
                }
                else
                {
                    delay = (config[i].delay || 0) * unitLength;
                }
                DOM.css(node, "left", delays[i] = delay);
                duration += len;
                lens[i] = delays[i] + len;
            }
            len = Math.max(lens[0], lens[1]);
            DOM.css(nodeTimeLines.nodeGroup, "left", duration = Math.min(delays[0], delays[1]));
            DOM.css(nodeTimeLines.nodeGroup, "width", len - duration);
        },
        
        _groupClickHandler: function(e)
        {
            var node = e.currentTarget;
            this.toggleSelection(node);
            this.showConfiguration(DOM.attr(node, "group"));
        },
        
        _memberClickHandler: function(e)
        {
            var node = e.currentTarget;
            this.toggleSelection(node);
            this.showConfiguration(DOM.attr(node, "group"), parseInt(DOM.attr(node, "member")));
        },
        
        toggleSelection: function(node)
        {
            DOM.removeClass(this.currentTimeline, "editor-content-selected");
            this.currentTimeline = node;
            DOM.addClass(node, "editor-content-selected");
        },
        
        showConfiguration: function(group, memberIndex)
        {
            var groupTimeline = memberIndex == null, config = configs[group], nodeEditors = this.nodeEditors, node, value, i;
            if (! groupTimeline)
            {
                config = config.anims[memberIndex];
            }
            this.currentConfig = config;
            for (i in nodeEditors)
            {
                node = nodeEditors[i];
                value = config[i] || DOM.attr(node, "defaultValue") || "";
                if (typeof value == "object")
                {
                    value = this._stringify(value);
                }
                node[node.type == "checkbox" ? "checked" : "value"] = value;
                if (groupTimeline && DOM.attr(node, "member") == "true")
                {
                    node.disabled = "disabled";
                    DOM.addClass(DOM.parent(node, "li"), "prop-disabled");
                }
                else
                {
                    node.disabled = "";
                    DOM.removeClass(DOM.parent(node, "li"), "prop-disabled");
                }
            }
        },
        
        _stringify: function(obj)
        {
            var result = [], i;
            if (obj)
            {
                for (i in obj)
                {
                    result.push("  \"" + i + "\": " + JSON.stringify(obj[i]));
                }
            }
            return "{\n" + result.join(",\n") + "\n}";
        },
        
        reset: function()
        {
            var nodePlayback = this.nodePlayback;
            this.createAnim();
            DOM.text(nodePlayback, "播放");
            nodePlayback.className = "btn-play";
            DOM.css(this.nodePointer, "left", 118);
        },
        
        _handleTextAreaValueChange: function(e)
        {
            var node = e.target, config = this.currentConfig;
            if (config)
            {
                try
                {
                    config[DOM.attr(node, "rel")] = JSON.parse(node.value);
                    this.reset();
                }
                catch (e)
                {
                }
            }
        },
        
        _handleTextValueChange: function(e)
        {
            var node = e.target, value = node.value, config = this.currentConfig;
            if (config && ! isNaN(value))
            {
                config[DOM.attr(node, "rel")] = Number(value);
                if (value = config.node)  // anim layer
                {
                    this.refreshTimeline(DOM.attr(value, "rel"));
                }
                this.reset();
            }
        },

        _handleSelectChange: function(e)
        {
            var node = e.target, value = node.value, config = this.currentConfig;
            if (config)
            {
                config[DOM.attr(node, "rel")] = node.value;
                if (value = config.node)  // anim layer
                {
                    this.refreshTimeline(DOM.attr(value, "rel"));
                }
                this.reset();
            }
        },

        _handleCheckChange: function(e)
        {
            var node = e.target, value = node.value, config = this.currentConfig;
            if (config)
            {
                config[DOM.attr(node, "rel")] = node.checked;
                this.reset();
            }
        },
        
        _handlePlaybackClick: function(e)
        {
            var node = e.target, anim = this.anim, text, cls;
            if (anim)
            {
                switch (DOM.text(node))
                {
                    case "播放":
                    {
                        text = "暂停";
                        cls = "btn-pause";
                        anim.resume();
                        break;
                    }
                    case "重新播放":
                    {
                        text = "暂停";
                        cls = "btn-pause";
                        anim.run();
                        break;
                    }
                    case "暂停":
                    {
                        text = "播放";
                        cls = "btn-play";
                        anim.pause();
                        break;
                    }
                }
                DOM.text(node, text);
                node.className = cls;
            }
        },
        
        _handleStopClick: function(e)
        {
            var anim = this.anim, nodePlayback = this.nodePlayback;
            if (anim)
            {
                anim.stop(false);
                DOM.text(nodePlayback, "播放");
                nodePlayback.className = "btn-play";
                DOM.css(this.nodePointer, "left", 118);
            }
        },
        
        _handleButtonDown: function(e)
        {
            DOM.addClass(e.target, "action-pressed");
        },
        
        _handleButtonUp: function(e)
        {
            DOM.removeClass(e.target, "action-pressed");
        },
        
        createAnim: function()
        {
            var anim = this.anim, self = this;
            if (anim)
            {
                anim.stop(false);
            }
            anim = this.anim = new LayerAnim([S.clone(configBigFish), S.clone(configMidFish), S.clone(configSmallFish)]);
            anim.on("start", this._handleAnimStart, this);
            anim.on("update", this._handleAnimUpdate, this);
            anim.on("end", this._handleAnimEnd, this);
            return anim;
        },
        
        _handleAnimStart: function()
        {
            var nodePointer = this.nodePointer, nodePlayback = this.nodePlayback;
            DOM.css(nodePointer, "left", 118);
            DOM.css(nodePointer, "overflow", "hidden");  // force display in IE6
            DOM.text(nodePlayback, "暂停");
            nodePlayback.className = "btn-pause";
        },
        
        _handleAnimUpdate: function()
        {
            var anim = this.anim, time = anim.time() * this._unitLength;
            DOM.css(this.nodePointer, "left", 118 + time);
        },

        _handleAnimEnd: function()
        {
            var nodePlayback = this.nodePlayback;
            DOM.text(nodePlayback, "重新播放");
            nodePlayback.className = "btn-replay";
        }
    };
    editor.init();
    setTimeout(function()
    {
        editor.createAnim().run();
    }, 1200);
});
