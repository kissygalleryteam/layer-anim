分层动画组件（LayerAnim）
==========================

作者：[阿古](mailto:blueaqua2000@gmail.com)

所谓“分层动画”，是指由多个动画组成，相互间有一定播放次序的动画。这些动画可以以顺序或逆序，或延迟播放，形成一个动画序列。

虽然CSS 3也支持动画，但其天生就存在许多缺陷：

* 不支持配置多个动画的播放次序、延迟时间等
* 无回放控制
* 语法较复杂，难以使用
* 各浏览器的支持不同，兼容性不佳，还需要加很多CSS前缀

分层动画组件（LayerAnim）是基于JS实现的动画组件，完美解决了上述问题。除具有KISSY内置Anim的全部功能外，还支持：

* 播放一组或多组动画，可配置动画之间的播放次序
* 延迟播放动画
* 精确的回放控制（如：重新播放、跳转到指定时间点等）
* CSS 3属性支持（如：rotation）
* 动态添加/删除子动画
* 可配置的平滑过渡效果（easing）
* 定义各浏览器的优雅降级
* 良好的兼容性（如：支持IE 6）

LayerAnim基于[GreenSock JS](www.greensock.com)动画库开发。GreenSock是一个功能强大、体积小巧、性能极高的动画平台，其使用时间线（Timeline）来精确控制动画的播放、跳转、停止等，它同时提供Flash和JS两个版本的动画库。

感兴趣的同学可以查看：[性能测试](www.greensock.com/js/speed.html)，其中包含了当前流行的动画库性能比较。


使用手册及开发接口
-------------------------------
[查看使用手册](http://gallery.kissyui.com/layer-anim/1.0/guide/index.html)

Demo
-------------------------------
[查看Demo](http://gallery.kissyui.com/layer-anim/1.0/demo/index.html)
