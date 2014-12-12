分层动画组件（LayerAnim）
==========================

作者：[阿古](mailto:blueaqua2000@gmail.com)

你还在为某些动画效果的实现而绞尽脑汁吗？

手头的组件做不出自己想要的效果？

现有的组件难以使用？

对浏览器兼容性问题一筹莫展？

有了LayerAnim，这些都已不再是问题！

## LayerAnim是什么

![LayerAnim Logo](http://img04.taobaocdn.com/tps/i4/T1ei0EFXlgXXcH.AUy-190-214.png)

组件首页：[http://gallery.kissyui.com/layer-anim/2.0.1/guide/index.html](http://gallery.kissyui.com/layer-anim/2.0.1/guide/index.html)

LayerAnim是一个专业级javascript动画组件，其强大之处在于：

* 创建分层动画（与Flash类似）

* 随意定制各个分层动画的播放顺序

* 支持无限重复播放动画，甚至以相反顺序重复播放

* 精确的回放控制（如：反向播放、重新播放、从特定时间点开始播放等）

* 支持CSS 3（如：rotation）

* 支持延迟播放动画

* 多种可配置的过渡效果（easing）

* 自定义各浏览器的优雅降级

* 动态添加/删除动画

* 兼容所有浏览器（包括古老的IE6）

* 简单的配置参数（易于学习、易于使用）

注：LayerAnim基于[GreenSock JS](http://www.greensock.com)（以下简称GSAP）动画库开发。

## 为什么选择LayerAnim

随着众多动画组件及CSS 3的出现，做动画早已不是什么难事。但这些组件是否易于使用？做出的效果是否令人满意？恐怕只有使用时，才能发现存在的问题。

让我们来看看LayerAnim：

* 性能出众

  * LayerAnim比目前流行的动画组件性能都高，[这里](http://www.greensock.com/js/speed.html)有各个动画组件的性能比较（其中GSAP即LayerAnim使用的GreenSock动画库）。可以看出，GSAP比jQuery快近20倍。

  * 即便与CSS3 transition相比，LayerAnim在多数情况下也较快。这是因为并非所有transition都会启用硬件加速。对于未启用硬件加速的动画，LayerAnim总是更胜一筹。

* 功能完善

  * 使用LayerAnim可以做出与Flash同样复杂的分层动画，例如，为每个动画层分别设置起始播放时间、延迟时间等，可以顺序播放，也可以同时播放，而这些只需要通过简单的配置参数即可完成。

  * LayerAnim支持对每个CSS属性分别设置不同的动画效果。例如：对“rotation”和“scale”分别设置不同的动画时长，而在CSS中，这是无法实现的。因为“rotation”和“scale”都属于“transform”属性，所以无法针对某个值单独设置动画效果。

  * LayerAnim不仅可基于DOM节点属性做动画，还可基于任意JS对象属性/方法做动画。这是CSS和其它动画组件所不具备的。

  * 动画的起始值（from）为百分比（%），结束值（to）为像素（px），可以么？没问题！LayerAnim都能支持。

  * 如果多个动画都作用于同一DOM节点，其设置的CSS属性相互冲突，怎么办？LayerAnim可以帮你搞定这一切。

  * LayerAnim还提供了多种回放控制，支持暂停、继续、反向播放、重新播放，甚至跳到某一时刻开始播放。

* 自动解决浏览器兼容问题

  * 对于高级浏览器，LayerAnim使用3D transform。对于低级浏览器（如：IE6），LayerAnim会自动使用filter来代替，因此，IE6也可以支持rotation, scale, skew等。

  * 无需写冗长的浏览器厂商前缀，例如：-ms-、-moz-、-webkit-、-o-等等，LayerAnim会自动帮你加上。

  * LayerAnim已对众多浏览器的Bug进行了处理，让那些令人头疼的问题见鬼去吧。

## LayerAnim探秘

LayerAnim基于时间轴（Timeline）来实现分层动画，与Flash中的时间轴概念相同。

![时间轴](http://img01.taobaocdn.com/tps/i1/T1x00HFbReXXa8U2PP-507-106.png)

所有动画层都基于时间轴来创建。因此，可以很容易地实现复杂的动画序列，同时，基于时间轴，也可以精确控制动画的播放、暂停、跳转，甚至反向播放等。

## 进一步了解LayerAnim

* [Demo](http://gallery.kissyui.com/layer-anim/2.0.1/demo/index.html)

* [使用手册及API](http://gallery.kissyui.com/layer-anim/2.0.1/guide/index.html)

## 更新历史

* v2.0.1

  * 支持重复播放动画（repeat），可无限重复
  * 每次重复播放的时间间隔（repeatDelay）
  * 重复播放时，是否以相反顺序播放（yoyo）
  * 多个动画以一定间隔时间播放（stagger）
  * 支持动画开始播放事件（start）、每帧动画更新事件（update）
  * 修改run()方法参数，支持从时间点开始播放

* v1.0

  * 支持基本动画参数（from, to, duration, easing）
  * 定制各个分层动画的播放顺序（align）
  * 延迟播放（delay）
  * 解决动画属性冲突（overwrite）
  * 浏览器降级设置（degrade）
  * 动画播放完毕事件（end）
