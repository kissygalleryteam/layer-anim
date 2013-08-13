分层动画组件（LayerAnim）
==========================

（作者：阿古，版本：1.1）

LayerAnim是一个专业级javascript动画组件，基于[GreenSock JS](http://www.greensock.com)动画库开发。

## 功能（Features）

* 创建**分层动画**（与Flash类似）
* 随意定制各个分层动画的**播放顺序**
* 支持无限重复播放动画，甚至以相反顺序重复播放
* 精确的**回放控制**（如：反向播放、重新播放、从特定时间点开始播放等）
* 支持**CSS 3**（如：rotation）
* 支持延迟播放动画
* 多种可配置的过渡效果（easing）
* 自定义各浏览器的优雅降级
* 动态添加/删除动画
* 兼容所有浏览器（包括古老的IE6）
* 简单的配置参数（易于学习、易于使用）

## 演示

[查看Demo](http://gallery.kissyui.com/layer-anim/1.1/demo/index.html)

## 浏览器兼容性（Broswer Support）

兼容所有主流浏览器：

* Chrome
* InternetExplorer（包括IE 6）
* Firefox
* Opera
* Safari

## 依赖

* KISSY 1.3.0+

## 使用手册

### 创建动画

JS动画的原理是在很短的时间间隔内，连续修改DOM节点的CSS属性，肉眼看上去，即形成动画。

通常，动画是基于DOM节点的，这里，我们先创建一个DOM节点。

```javascript
var nodeExample = KISSY.DOM.create("<span style='position: absolute; left: 0; top: 0;'>这是一个动画节点</span>");
KISSY.DOM.append(nodeExample, "body");
```

该DOM节点绝对定位在页面的左上角，坐标(0, 0)。下面我们创建一个动画，将其移动到坐标(200, 200)。

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

调用run()方法播放该动画，可以看到DOM节点从坐标(0, 0)移动到了坐标(200, 200)，动画时长为1秒。

node配置参数也支持DOM节点列表，例如：

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: KISSY.DOM.query(".example"),  // 动画DOM节点列表
        to:
        {
            left: 200,
            top: 200
        },
        duration: 1
    }).run();
});
```

播放该动画，```class="example"```的所有DOM节点都会移动到坐标(200, 200)，动画时长为1秒。

另外，node配置参数还支持任意JS对象，例如：

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    var obj =
    {
        propA: 0
    };
    new LayerAnim(
    {
        node: obj,  // 动画JS对象
        to:  // 动画结束值
        {
            propA: 100
        },
        duration: 1
    }).run();
});
```

播放动画，```obj.propA```会在1秒内，从0变为100。

### 动画回放控制

通过LayerAnim提供的方法，我们可以对动画的播放过程进行精确控制，暂停、继续、跳转，甚至反向播放。具体请参考“开发接口（API）”。

例如，从指定时间点开始播放动画。

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    var anim = new LayerAnim(...);
    // 从1秒位置开始播放动画
    anim.run(1);  // 与anim.seek(1).run()效果相同
});
```

### 设置动画起始值（```from```参数）

上面的动画是从DOM节点的当前位置(0, 0)开始移动的。我们还可以通过```from```配置参数设置动画的起始值。

例如，将DOM节点从坐标(10, 10)移动到坐标(200, 200)。

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        from:  // 动画起始值，即动画初始时的CSS属性值
        {
            left: 10,
            top: 10
        },
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

动画播放时，可以看到DOM节点从坐标(10, 10)移动到了坐标(200, 200)。

更为方便的是，```to```参数可以不设置，这样，DOM节点会从```from```指定的位置移动到当前的位置。

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        from:  // 动画起始值，即动画初始时的CSS属性值
        {
            left: 200,
            top: 200
        },
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```
动画播放时，可以看到DOM节点从坐标(200, 200)移动到了坐标(0, 0)，即当前的位置。

### 平滑过渡效果（```easing```参数）

在动画的起始和结束阶段，可以显示各种过渡效果，这些效果可通过```easing```参数进行配置。例如，在动画结束阶段，显示弹跳效果，如下：

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        easing: "Bounce.easeOut",  // 平滑过渡效果
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

支持的平滑过渡效果可参考“开发接口（API）”中的配置参数```Easing```。

### 延迟播放动画（```delay```参数）

有时，我们需要延迟一段时间，再开始播放动画。此时，可以使用```delay```参数。

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        delay: 0.5,  // 延迟播放时间（单位：秒）
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

上例设置动画延迟半秒再开始播放。

### 重复播放动画（```repeat```参数）

如果想反复播放同一动画，可通过```repeat```参数实现。例如：

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        repeat: 1,  // 首次播放后的重复次数
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

上例中，```repeat: 1```表示动画播放完毕后，再重复一次。如果想无限次反复播放，设置repeat为-1即可。

### 重复播放延迟（```repeatDelay```参数）

重复播放动画时，还可设置每次重复播放时的延迟时间，例如：

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        repeat: 1,  // 首次播放后的重复次数
        repeatDelay: 0.4,  // 每次重复播放时的延迟时间（单位：秒）
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

播放该动画，可以看到，第2次播放动画前，延迟了0.4秒才开始播放。

### 反向重复播放（```yoyo```参数）

“反向重复播放”是指，每次重复播放时，以相反顺序播放（即上次播放顺序的反序）。

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        repeat: 1,  // 首次播放后的重复次数
        yoyo: true,  // 重复播放时，是否以相反顺序播放（每次都与上次播放顺序相反）
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

动画播放时，可以看到DOM节点从坐标(0, 0)移动到了坐标(200, 200)，之后又从坐标(200, 200)回到了坐标(0, 0)。

### 浏览器降级设置（```degrade```参数）

某些浏览器（如IE 6）中，复杂动画的显示效果可能不尽如意，需要进行降级。这时，可通过```degrade```参数，设置动画在特定浏览器下不显示。

**注意**：“不显示”仅仅指不显示动画。为了确保所有浏览器下的样式一致，动画DOM节点的CSS属性会立即设置为结束值。

例如，设置IE 8以上浏览器（包括IE 8）才显示动画，代码如下：

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    // 创建动画
    new LayerAnim(
    {
        node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 200,
            top: 200
        },
        degrade:  // 降级设置
        {
            ie: 7  // IE 8以上（包括IE 8）才显示该动画（其它浏览器不受约束）
        },
        duration: 1  // 动画时长（单位：秒）
    }).run();  // 播放动画
});
```

由于未设置针对其它浏览器的降级，因此，上面的动画只在IE 6、7下不显示。

```degrade```所支持的浏览器名称可查看[KISSY UA组件说明](http://docs.kissyui.com/docs/html/api/core/ua/index.html)。

### 同时播放一组动画

下面，我们要创建一组动画（即分层动画），其中包含多个动画，动画之间可以设置一定的播放次序。

所谓“同时播放”，即所有动画同时开始播放，也是默认的动画播放次序。将配置参数改为数组即可，例如：

```javascript
KISSY.use("gallery/layer-anim/1.1/, dom", function(S, LayerAnim, DOM)
{
    // 创建动画DOM节点
    var nodeA = DOM.create("<span style='position: absolute; left: 0; top: 0;'>动画节点A</span>");
    DOM.append(nodeA, "body");
    var nodeB = DOM.create("<span style='position: absolute; left: 100px; top: 0;'>动画节点B</span>");
    DOM.append(nodeB, "body");
    // 创建动画
    new LayerAnim(
    [
        {
            node: nodeA,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 0,
                top: 200
            },
            duration: 1  // 动画时长（单位：秒）
        },
        {
            node: nodeB,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 100,
                top: 200
            },
            duration: 1  // 动画时长（单位：秒）
        }
    ]).run();  // 播放动画
});
```

上面的代码创建了两个动画，分别将DOM节点nodeA从坐标(0, 0)移动到坐标(0, 200)，nodeB从坐标(100, 0)移动到坐标(100, 200)，两个节点同时移动。

### 顺序播放一组动画

所谓“顺序播放”，即上一动画播放完毕后，才开始播放下一动画。例如：

```javascript
KISSY.use("gallery/layer-anim/1.1/, dom", function(S, LayerAnim, DOM)
{
    // 创建动画DOM节点
    var nodeA = DOM.create("<span style='position: absolute; left: 0; top: 0;'>动画节点A</span>");
    DOM.append(nodeA, "body");
    var nodeB = DOM.create("<span style='position: absolute; left: 100px; top: 0;'>动画节点B</span>");
    DOM.append(nodeB, "body");
    var nodeC = DOM.create("<span style='position: absolute; left: 200px; top: 0;'>动画节点C</span>");
    DOM.append(nodeC, "body");
    // 创建动画
    new LayerAnim(
    [
        {  // 动画A
            node: nodeA,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 0,
                top: 200
            },
            duration: 1  // 动画时长（单位：秒）
        },
        {  // 动画B
            node: nodeB,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 100,
                top: 200
            },
            align: "sequence",  // 上一动画播放完再播放该动画
            duration: 1  // 动画时长（单位：秒）
        },
        {  // 动画C
            node: nodeC,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 200,
                top: 200
            },
            duration: 1  // 动画时长（单位：秒）
        }
    ]).run();  // 播放动画
});
```

上面的代码创建了三个动画，其中，动画B的```align```参数设置为```sequence```，表示动画B在A之后顺序播放。

动画C与动画B同时开始播放。虽然动画C未设置```align```参数，但由于动画B在A之后顺序播放，因此，动画C也遵循该规则，在动画A后顺序播放。

也可将动画B与动画C设置为一组，运行效果与上面的动画相同。如下：

```javascript
new LayerAnim(
[
    {  // 动画A
        node: nodeA,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            left: 0,
            top: 200
        },
        duration: 1  // 动画时长（单位：秒）
    },
    [
        {  // 动画B
            node: nodeB,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 100,
                top: 200
            },
            align: "sequence",  // 上一动画播放完再播放该动画
            duration: 1  // 动画时长（单位：秒）
        },
        {  // 动画C
            node: nodeC,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 200,
                top: 200
            },
            duration: 1  // 动画时长（单位：秒）
        }
    ]
]).run();
```

动画B与C设置为一组，该组动画与其它动画之间的播放顺序以第一个动画（即动画B）的```align```参数为准，即动画B、动画C在动画A之后播放。

### 更复杂的分层动画

一组动画还可以嵌套另一组动画，形成复杂的分层动画。例如：

```javascript
    ...
    new LayerAnim(
    [
        {  // 动画A
            ...
        },
        [
            {  // 动画B
                align: "sequence",  // 上一动画播放完再播放该动画
                ...
            },
            {  // 动画C
                ...
            }
        ],
        {  // 动画D
            ...
        },
        {  // 动画E
            align: "sequence",  // 上一动画播放完再播放该动画
            ...
        },
        {  // 动画F
            ...
        }
    ]);
```

该分层动画的播放顺序如下图所示：

![动画播放顺序](http://img03.taobaocdn.com/tps/i3/T11AN2FfRXXXbEuTz5-275-121.png)

### 解决动画冲突（```overwrite```参数）

如果多个动画同时作用于同一个DOM节点，其设置的CSS属性相互冲突时，就需要设置```overwrite```参数，来处理冲突。参数取值如下：

- "auto"：分析当前正在播放的动画，如果发现有CSS值冲突，则覆盖该CSS值。尚未播放的动画不受影响。【默认值】
- "all"：停止与该DOM节点有关的所有动画（包括未播放的动画）
- "none"：不处理冲突

```javascript
KISSY.use("gallery/layer-anim/1.1/, dom", function(S, LayerAnim, DOM)
{
    // 创建动画DOM节点
    var nodeExample = DOM.create("<span style='position: absolute; left: 0; top: 0;'>这是一个动画节点</span>");
    DOM.append(nodeExample, "body");
    // 创建动画
    new LayerAnim(
    [
        {  // 动画A
            node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 0,
                top: 200
            },
            duration: 1  // 动画时长（单位：秒）
        },
        {  // 动画B
            node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 200,
                top: 200
            },
            overwrite: "all",  // 动画冲突处理方式
            duration: 1  // 动画时长（单位：秒）
        }
    ]).run();  // 播放动画
});
```

上面的代码中，两个动画都基于同一个DOM节点，且同时播放。由于动画B的```overwrite```参数设置为```all```，因此该动画播放时，会覆盖动画A的CSS值，最终显示的是动画B的效果，DOM节点从坐标(0, 0)移动到了坐标(200, 200)。

### 重复播放一组动画

重复播放一组动画时，需要将配置参数中的数组修改为对象，例如：

```javascript
KISSY.use("gallery/layer-anim/1.1/, dom", function(S, LayerAnim, DOM)
{
    // 创建动画DOM节点
    var nodeA = DOM.create("<span style='position: absolute; left: 0; top: 0;'>动画节点A</span>");
    DOM.append(nodeA, "body");
    var nodeB = DOM.create("<span style='position: absolute; left: 100px; top: 0;'>动画节点B</span>");
    DOM.append(nodeB, "body");
    // 创建动画
    new LayerAnim(
    {
        anims:  // 动画组
        [
            {  // 动画A
                node: nodeA,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
                to:  // 动画结束值，即动画结束时的CSS属性值
                {
                    left: 0,
                    top: 200
                },
                duration: 1  // 动画时长（单位：秒）
            },
            {  // 动画B
                node: nodeB,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
                to:  // 动画结束值，即动画结束时的CSS属性值
                {
                    left: 100,
                    top: 200
                },
                duration: 1  // 动画时长（单位：秒）
            }
        ],
        repeat: 1,  // 首次播放后的重复次数
        repeatDelay: 0.4,  // 每次重复播放时的延迟时间（单位：秒）
        yoyo: true  // 重复播放时，是否以相反顺序播放（每次都与上次播放顺序相反）
    }).run();  // 播放动画
});
```
上例中，通过```anims```配置参数设置动画组，另外，使用```repeat```、```repeatDelay```、```yoyo```参数设置该动画组的重复播放配置。

### 间隔播放一组动画（```stagger```参数）

有时，我们需要每隔一段时间，播放一个动画。所有动画的起始值/结束值、时长均相同。这时，可使用```stagger```参数实现：

```javascript
KISSY.use("gallery/layer-anim/1.1/, dom", function(S, LayerAnim, DOM)
{
    // 创建动画DOM节点
    var nodeExample = DOM.create("<div style='position: relative; height: 300px;'>" +
        "<span style='position: absolute; left: 0; top: 0;'>nodeA</span>" +
        "<span style='position: absolute; left: 20px; top: 0;'>nodeB</span>" +
        "<span style='position: absolute; left: 40px; top: 0;'>nodeC</span>" +
        "</div>");
    DOM.append(nodeExample, "body");
    // 创建动画
    new LayerAnim(
    {
        node: DOM.query("span", nodeExample),  // 动画DOM节点列表
        to:  // 动画结束值，即动画结束时的CSS属性值
        {
            top: 150
        },
        stagger: 0.3,  // 每个动画间隔播放的时间（单位：秒）
        duration: 1  // 动画时长（单位：秒）
    }).run();
});
```

播放该动画，可以看到，nodeA开始从坐标(0, 0)移动到坐标(0, 150)，0.3秒时，nodeB开始从坐标(20, 0)移动到坐标(20, 150)，0.6秒时，nodeC开始从坐标(40, 0)移动到坐标(40, 150)。nodeA、nodeB、nodeC之间开始播放的时间相隔0.3秒。

## 开发接口（API）

创建LayerAnim对象：

```javascript
KISSY.use("gallery/layer-anim/1.1/", function(S, LayerAnim)
{
    var config = /* 配置参数 */;
    new LayerAnim(config);
});
```

### 配置参数

- node {String / HTMLNode / [HTMLNode]}

   动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY [DOM选择符](http://docs.kissyui.com/docs/html/api/core/dom/selector.html)）或原生DOM节点

- from {Object}

   动画起始值，即动画初始时的CSS属性值。例如：

```javascript
{
    left: 0,
    top: 0
}
```

- to {Object}

   动画结束值，即动画结束时的CSS属性值。```from```与```to```必须设置其一，或同时设置。

- duration {Number}

   动画时长（单位：秒）。

- easing {String} 【可选】

   平滑过渡效果，取值如下：

      * "Back.easeIn"：动画起始时，显示缩进效果
      * "Back.easeOut"：动画结束时，显示缩进效果
      * "Back.easeInOut"：动画起始和结束时，都显示缩进效果，即Back.easeIn + Back.easeOut
      * "Bounce.easeIn"：动画起始时，显示跳动效果
      * "Bounce.easeOut"：动画结束时，显示跳动效果
      * "Bounce.easeInOut"：动画起始和结束时，都显示跳动效果，即Bounce.easeIn + Bounce.easeOut
      * "Circ.easeIn"：动画起始时，急剧改变运动速度
      * "Circ.easeOut"：动画结束时，急剧改变运动速度
      * "Circ.easeInOut"：动画起始和结束时，都急剧改变运动速度，即Circ.easeIn + Circ.easeOut
      * "Elastic.easeIn"：动画起始时，显示类似橡皮筋的弹跳效果
      * "Elastic.easeOut"：动画结束时，显示类似橡皮筋的弹跳效果
      * "Elastic.easeInOut"：动画起始和结束时，都显示类似橡皮筋的弹跳效果，即Elastic.easeIn + Elastic.easeOut
      * "Power1.easeIn"：动画起始时，显示缓动效果（加速度为线性）
      * "Power1.easeOut"：动画结束时，显示缓动效果（加速度为线性）【默认值】
      * "Power1.easeInOut"：动画起始和结束时，都显示缓动效果，即Power1.easeIn + Power1.easeOut
      * "Power2.easeIn"：动画起始时，显示缓动效果（加速度稍强）
      * "Power2.easeOut"：动画结束时，显示缓动效果（加速度稍强）
      * "Power2.easeInOut"：动画起始和结束时，都显示缓动效果，即Power2.easeIn + Power2.easeOut
      * "Power3.easeIn"：动画起始时，显示缓动效果（加速度更强）
      * "Power3.easeOut"：动画结束时，显示缓动效果（加速度更强）
      * "Power3.easeInOut"：动画起始和结束时，都显示缓动效果，即Power3.easeIn + Power3.easeOut
      * "Power4.easeIn"：动画起始时，显示缓动效果（加速度极强）
      * "Power4.easeOut"：动画结束时，显示缓动效果（加速度极强）
      * "Power4.easeInOut"：动画起始和结束时，都显示缓动效果，即Power4.easeIn + Power4.easeOut
      * "Expo.easeIn"：动画起始时，显示缓动效果（加速度最强）
      * "Expo.easeOut"：动画结束时，显示缓动效果（加速度最强）
      * "Expo.easeInOut"：动画起始和结束时，都显示缓动效果，即Power5.easeIn + Power5.easeOut
      * "SteppedEase"：如果希望将动画分为固定的几步完成，可以使用SteppedEase。例如：```easing: "SteppedEase.config(5)"```，让动画分为5步完成，每步的CSS值将根据```from```和```to```值计算

- delay {Number} 【可选】

   延迟播放时间（单位：秒）。

- align {String} 【可选】

   播放次序。取值如下：

      * "normal"：与其它动画同时播放。【默认值】
      * "sequence"：顺序播放，即上一动画播放完再播放该动画。

- overwrite {String}

   当多个动画同时作用于同一个DOM节点，其设置的CSS属性相互冲突时，解决冲突处理方式。取值如下：

      * "auto"：分析当前正在播放的动画，如果发现有CSS值冲突，则覆盖该CSS值。尚未播放的动画不受影响。【默认值】
      * "all"：停止与该DOM节点相关的所有动画（包括未播放的动画）
      * "none"：不处理冲突

- repeat {Number} 【可选】

   首次播放后的重复次数【默认：0】。例如：```repeat: 1```表示动画总共播放2次。
   如果要无限重复，设置```repeat: -1```。

- repeatDelay {Number} 【可选】

   每次重复播放时的延迟时间（单位：秒）。

- yoyo {Boolean} 【可选】

   重复播放时，是否以相反顺序播放（每次都与上次播放顺序相反）【默认：false】。

- degrade {Object} 【可选】

   浏览器降级设置。例如：
```javascript
{
        ie: 7  // IE 8以上（包括IE 8）才显示该动画
}
```

### 方法

- run(position)

   播放动画。无论动画是否播放完，默认都从头开始播放。

   * 参数：

      position {Number}：起始播放的时间点，单位：秒【可选参数，默认：0（从起始位置播放动画）】

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- runReverse()

   反向播放动画。如果动画尚未播放，则调用该方法没有任何效果。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- pause()

   暂停播放动画。动画暂停后，可调用resume方法继续播放。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- resume()

   从当前播放位置继续播放动画。如果动画已播放完，调用该方法没有任何效果。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- stop(reset)

   停止播放动画，并跳转到初始位置。

   * 参数：

      reset {Boolean}：是否将动画起始值（from）或结束值（to）重置为当前的CSS值。如果不想从DOM节点的当前值重新播放动画，请设置为false。【可选参数，默认：true】

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- seek(position)

   跳转到指定位置。

   * 参数：

      position {Number}：跳转到的时间点，单位：秒。【可选参数，默认：0（起始位置）】

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- end()

   跳转到动画结束时刻。该方法同时将CSS样式设置为结束值。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- kill()

   停止动画并释放相关资源，以便垃圾回收。如果动画不再播放，调用该方法可以减少内存等资源的占用。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- add(config)

   向分层动画中添加动画。动画被添加到最后位置。

   * 参数：

      config {Object}：要添加的动画配置参数，具体请参考配置参数。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- clear()

   删除所有分层动画。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- rerun()【已废弃，使用run方法代替】

   重新播放动画。无论动画当前播放到什么位置，该方法都从头开始播放动画。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

### 事件

- start

   动画从头开始播放时，触发该事件。如果反复从头播放动画，则该事件会触发多次。

- update

   每帧动画更新时，触发该事件。动画播放时，会不断触发该事件。

- end

   动画播放结束时，触发该事件。
