KISSY.add(function (S, Node,Demo) {
    var $ = Node.all;
    describe('layer-anim', function () {
        it('Instantiation of components',function(){
            var demo = new Demo();
            expect(S.isObject(demo)).toBe(true);
        })
    });

},{requires:['node','kg/layer-anim/2.0.0/']});