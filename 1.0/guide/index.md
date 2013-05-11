分层动画组件（layer-anim）
==========================

（作者：阿古，版本：1.0）

所谓“分层动画”，是指由多个动画组成，相互间有一定播放次序的动画。这些动画可以以顺序或逆序，或延迟播放，形成一个动画序列。

layer-anim是一个javascript动画组件，基于[GreenSock JS](www.greensock.com)动画库开发。

## 功能（Features）

* 播放一组或多组动画，可配置动画之间的播放次序
* 延迟播放动画
* 精确的回放控制（如：重新播放、跳转到指定时间点等）
* CSS 3属性支持（如：rotation）
* 动态添加/删除子动画
* 可配置的平滑过渡效果（easing）
* 定义各浏览器的优雅降级

## JS框架

* KISSY 1.3.0+

## 浏览器兼容性（Broswer Support）

兼容所有主流浏览器：

* Chrome
* InternetExplorer：支持IE 6
* Firefox
* Opera
* Safari

## 演示

[查看Demo](http://gallery.kissyui.com/layer-anim/1.0/demo/index.html)

## 使用手册

### 创建动画

JS动画的原理是在很短的时间间隔内，连续修改DOM节点的CSS属性，肉眼看上去，即形成动画。

所有动画都是基于DOM节点的，因此，需要先创建一个DOM节点。

```javascript
var nodeExample = KISSY.DOM.create("<span style='position: absolute; left: 0; top: 0;'>这是一个动画节点</span>");
KISSY.DOM.append(nodeExample, "body");
```

该DOM节点绝对定位在页面的左上角，坐标(0, 0)。下面我们创建一个动画，将其移动到坐标(200, 200)。

```javascript
KISSY.use("gallery/layer-anim/1.0/", function(S, LayerAnim)
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

**注意**：动画时长```duration```的单位为：**秒**。

### 动画回放控制

通过layer-anim提供的方法，我们可以对动画的播放进行精确控制（如：暂停、继续、跳转等），甚至还可以反向播放。具体请参考“开发接口（API）”。

例如，从指定时间点开始播放动画。

```javascript
KISSY.use("gallery/layer-anim/1.0/", function(S, LayerAnim)
{
    // 创建动画
    var anim = new LayerAnim(...);
    // 从1秒所在位置开始播放动画
    anim.seek(1).run();
});
```

### 设置动画起始值（```from```参数）

上面的动画是从DOM节点的当前位置(0, 0)开始移动的。我们还可以通过```from```配置参数设置动画的起始值。

例如，将DOM节点从坐标(10, 10)移动到坐标(200, 200)。

```javascript
KISSY.use("gallery/layer-anim/1.0/", function(S, LayerAnim)
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

```to```参数也可以不设置，这样，DOM节点就会从```from```指定的位置移动到当前的位置。

```javascript
KISSY.use("gallery/layer-anim/1.0/", function(S, LayerAnim)
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
KISSY.use("gallery/layer-anim/1.0/", function(S, LayerAnim)
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

支持的平滑过渡效果有：

- "Back.easeIn"：动画起始时，显示缩进效果
- "Back.easeOut"：动画结束时，显示缩进效果
- "Back.easeInOut"：动画起始和结束时，都显示缩进效果，即Back.easeIn + Back.easeOut
- "Bounce.easeIn"：动画起始时，显示跳动效果
- "Bounce.easeOut"：动画结束时，显示跳动效果
- "Bounce.easeInOut"：动画起始和结束时，都显示跳动效果，即Bounce.easeIn + Bounce.easeOut
- "Circ.easeIn"：动画起始时，急剧改变运动速度
- "Circ.easeOut"：动画结束时，急剧改变运动速度
- "Circ.easeInOut"：动画起始和结束时，都急剧改变运动速度，即Circ.easeIn + Circ.easeOut
- "Elastic.easeIn"：动画起始时，显示类似橡皮筋的弹跳效果
- "Elastic.easeOut"：动画结束时，显示类似橡皮筋的弹跳效果
- "Elastic.easeInOut"：动画起始和结束时，都显示类似橡皮筋的弹跳效果，即Elastic.easeIn + Elastic.easeOut
- "Power1.easeIn"：动画起始时，显示缓动效果（加速度为线性）
- "Power1.easeOut"：动画结束时，显示缓动效果（加速度为线性）
- "Power1.easeInOut"：动画起始和结束时，都显示缓动效果，即Power1.easeIn + Power1.easeOut
- "Power2.easeIn"：动画起始时，显示缓动效果（加速度稍强）
- "Power2.easeOut"：动画结束时，显示缓动效果（加速度稍强）
- "Power2.easeInOut"：动画起始和结束时，都显示缓动效果，即Power2.easeIn + Power2.easeOut
- "Power3.easeIn"：动画起始时，显示缓动效果（加速度更强）
- "Power3.easeOut"：动画结束时，显示缓动效果（加速度更强）
- "Power3.easeInOut"：动画起始和结束时，都显示缓动效果，即Power3.easeIn + Power3.easeOut
- "Power4.easeIn"：动画起始时，显示缓动效果（加速度极强）
- "Power4.easeOut"：动画结束时，显示缓动效果（加速度极强）
- "Power4.easeInOut"：动画起始和结束时，都显示缓动效果，即Power4.easeIn + Power4.easeOut
- "Expo.easeIn"：动画起始时，显示缓动效果（加速度最强）
- "Expo.easeOut"：动画结束时，显示缓动效果（加速度最强）
- "Expo.easeInOut"：动画起始和结束时，都显示缓动效果，即Power5.easeIn + Power5.easeOut
- "SteppedEase"：如果希望将动画分为固定的几步完成，可以使用SteppedEase。例如：```easing: "SteppedEase.config(5)"```，让动画分为5步完成，每步的CSS值将根据```from```或```to```值计算

### 延迟播放动画（```delay```参数）

有时，我们需要延迟一段时间，再开始播放动画。此时，可以使用```delay```参数。

```javascript
KISSY.use("gallery/layer-anim/1.0/", function(S, LayerAnim)
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

上面的例子中，动画延迟了半秒才开始播放。

### 浏览器降级设置（```degrade```参数）

某些浏览器（如IE 6）中，复杂动画的显示效果可能不尽如意，需要优雅降级。这时，可通过```degrade```参数，设置动画在特定浏览器下不显示。

**注意**：“**不显示**”仅仅指不显示动画。为了确保所有浏览器下的样式一致，动画DOM节点的CSS属性会立即设置为结束值。

例如，设置IE 8以上浏览器（包括IE 8）才显示动画，代码如下：

```javascript
KISSY.use("gallery/layer-anim/1.0/", function(S, LayerAnim)
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

### 创建一组动画

上面的例子中，只创建了单一动画，下面，我们要创建一组动画（即分层动画），其中包含多个动画，动画之间可以设置一定的播放次序。

- 同时播放：所有动画同时开始播放，也是默认的动画播放次序。

要创建一组动画，只需要将配置参数改为数组。例如：

```javascript
KISSY.use("gallery/layer-anim/1.0/, dom", function(S, LayerAnim, DOM)
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

- 顺序播放：上一动画播放完毕后，才开始播放下一动画。例如：

```javascript
KISSY.use("gallery/layer-anim/1.0/, dom", function(S, LayerAnim, DOM)
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
            align: "sequence",  // 上一动画播放完再播放该动画
            duration: 1  // 动画时长（单位：秒）
        },
        {
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

上面的代码创建了三个动画，其中，第2个动画的```align```参数设置为```sequence```，表示该动画在第1个动画之后播放，即顺序播放。

第3个动画与第2个动画同时开始播放。虽然第3个动画未设置```align```参数，但由于第2个动画设置为与第1个动画顺序播放，因此，第3个动画也遵循顺序播放的规则。

### 复杂的分层动画

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

该分层动画的播放顺序为：

1. 动画A与动画D同时播放
2. 动画A播放完毕后，同时播放动画B和动画C
3. 动画D播放完毕后，播放动画E和动画F

### 解决动画冲突（```overwrite```参数）

如果多个动画同时作用于同一个DOM节点，其设置的CSS属性相互冲突时，就需要设置```overwrite```参数，来处理冲突。参数取值如下：

- "auto"：分析当前正在播放的动画，如果发现有CSS值冲突，则覆盖该CSS值。尚未播放的动画不受影响。该值为默认值。
- "all"：停止与该DOM节点相关的所有动画（包括未播放的动画）
- "none"：不处理冲突

```javascript
KISSY.use("gallery/layer-anim/1.0/, dom", function(S, LayerAnim, DOM)
{
    // 创建动画DOM节点
    var nodeExample = DOM.create("<span style='position: absolute; left: 0; top: 0;'>这是一个动画节点</span>");
    DOM.append(nodeA, "body");
    // 创建动画
    new LayerAnim(
    [
        {
            node: nodeExample,  // 动画DOM节点，可使用“选择符”（支持的选择符请参考KISSY DOM文档）或原生DOM节点
            to:  // 动画结束值，即动画结束时的CSS属性值
            {
                left: 0,
                top: 200
            },
            duration: 1  // 动画时长（单位：秒）
        },
        {
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

上面的代码中，两个动画都基于同一个DOM节点，且同时播放。由于第2个动画的```overwrite```参数设置为```all```，因此，该动画播放时，会覆盖第1个动画的CSS值，最终显示的只有第2个动画效果，DOM节点从坐标(0, 0)移动到了坐标(200, 200)。

## 开发接口（API）

### 方法

- run(once)

   播放动画。如果动画未播放完，则从当前位置继续播放。如果动画已播放完，调用该方法没有任何效果。如需重新播放，请使用rerun方法。

   * 参数：

      once {Boolean}：是否只运行一次，动画播放完后即释放相关资源，以便垃圾回收。[可选参数，默认：false]

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- rerun()

   重新播放动画。无论动画当前播放到什么位置，该方法都从头开始播放动画。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- runReverse()

   反向播放动画。如果动画尚未播放，则调用该方法没有任何效果。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- pause()

   暂停播放动画。动画暂停后，可调用resume或run方法继续播放。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- resume()

   从当前播放位置继续播放动画。如果动画已播放完，调用该方法没有任何效果。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- stop(reset)

   停止播放动画，并跳转到初始位置。

   * 参数：

      reset {Boolean}：是否将动画起始值（from）或结束值（to）重置为当前的CSS值。如果不想从DOM节点的当前值重新播放动画，请设置为false。[可选参数，默认：true]

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- seek(position)

   跳转到指定位置。

   * 参数：

      position {Number}：跳转到的时间点，单位：秒。[可选参数，默认：0（起始位置）]

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- end()

   跳转到动画结束时刻。该方法同时将CSS样式设置为结束值。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- kill()

   停止动画并释放相关资源，以便垃圾回收。如果动画不再播放，调用该方法可以减少内存等资源的使用。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- add(config)

   向分层动画中添加动画。动画被添加到最后位置。

   * 参数：

      config {Object}：要添加的动画配置参数，具体请参考使用手册。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

- clear()

   删除所有动画。

   * 返回值：

      {LayerAnim} this对象，以支持链式调用。

### 事件

- end()

   动画播放完毕时，触发该事件。

