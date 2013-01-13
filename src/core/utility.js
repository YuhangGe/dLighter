/**
 * User: xiaoge
 * At: 2012-12-19 9:04
 * Email: abraham1@163.com
 * File: dLighter的命名空间和实用函数
 */
dLighter = {
    /*
     * $ 即是一个函数，同时也是实用函数集的命名空间
     */
    $ : function(id) {
        return document.getElementById(id);
    },
    /*
     * Render
     */
    _Core : {},
    /*
     * Lexer
     */
    _Lexer : {},
    /*
     * Theme
     */
    _Theme : {}
};
(function($) {
    var ua = navigator.userAgent.toLowerCase();
    var s;
    ( s = ua.match(/msie ([\d.]+)/)) ? $.ie = s[1] : ( s = ua.match(/firefox\/([\d.]+)/)) ? $.firefox = s[1] : ( s = ua.match(/chrome\/([\d.]+)/)) ? $.chrome = s[1] : ( s = ua.match(/opera.([\d.]+)/)) ? $.opera = s[1] : ( s = ua.match(/version\/([\d.]+).*safari/)) ? $.safari = s[1] : 0;
    (s = ua.match(/mac os x (\d+)[\._](\d+)/)) ? ($.macOS = s[1]+"."+s[2]) : $.winOS = true;
    var c = document.createElement("canvas");
    $.hasCanvas = (c !== null && typeof c.getContext === 'function') ? true : false;
    /**
     * extend 函数可以扩展一个对象。类似于jQuery的extend
     * @param src
     * @param ext
     */
    $.extend = function(src, ext) {
        for(var f in ext) {
            if(src[f] == null)
                src[f] = ext[f];
            else {
                console.trace();
                $.log(f)
                throw "extend error!"
            }
        }
    };
    /**
     * 对鼠标按下，拖动，放开这个常用的事件模式进行封装
     * @constructor
     * @param d_handler mousedown handler 鼠标按下的回调事件
     * @param m_handler mousemove handler 鼠标移动的回调事件
     * @param u_handler mouseup handler 鼠标放开的回调事件
     * @param type 鼠标左键还是右键。默认左键。
     */
    $.MTDelegate = function(ele, d_handler, m_handler, u_handler, type) {
        this.ele = ele;
        this.d_h =  d_handler;
        this.m_h = m_handler;
        this.u_h = u_handler;
        this.__cmv_handler = null;
        this.__cmu_handler = null;
        this._m_down = false;
        this._op = {
            x : 0,
            y : 0
        }
        /*
         * Event.button === 0 是左键，Event.button === 2  是右键
         */
        this.btn = type === 'right' ? 2 : 0;
    }
    $.MTDelegate.prototype = {
        _mousedown_handler : function(e) {
            if(e.button!==this.btn || this._m_down) {
                //如果鼠标按键不对，或者已经按下，则不再处理。（不处理多个鼠标同时按下这种情况T-T）
                return;
            }
            this._m_down = true;
            var p = $.getEventPoint(e);
            e.eventX = p.x;
            e.eventY = p.y;
            this._op.x = p.x;
            this._op.y = p.y;
            var rtn = this.d_h.call(this.ele, e);
            if(rtn===false) {
                $.stopEvent(e);
            }
        },
        _mouseup_handler : function(e) {
            if(this._m_down !== false) {
                return;
            }
            this._m_down = false;
            var p = $.getEventPoint(e);
            e.eventX = p.x;
            e.eventY = p.y;
            var rtn = this.u_h.call(this.ele, e);
            if(rtn===false) {
                $.stopEvent(e);
            }
        },
        _mousemove_handler : function(e) {
            if(this._m_down === false) {
                return;
            }
            var p = $.getEventPoint(e);
            e.eventX = p.x;
            e.eventY = p.y;
            e.deltaX = p.x - this._op.x;
            e.deltaY = p.y - this._op.y;
            var rtn = this.m_h.call(this.ele, e);
            if(rtn===false) {
                $.stopEvent(e);
            }
        },
        _chrome_mousemove_handler : function(e) {
            this._mousemove_handler(e);
        },
        _chrome_mouseup_handler : function(e) {
            this._mouseup_handler(e);
            $.delEvent(window, 'mousemove', this.__cmv_handler);
            $.delEvent(window, 'mouseup', this.__cmu_handler);
        },
        _chrome_mousedown_handler : function(e) {
            if(e.button !== this.btn || this._m_down) {
                return;
            }
            this._mousedown_handler(e);
            $.addEvent(window, 'mousemove', this.__cmv_handler);
            $.addEvent(window, 'mouseup', this.__cmu_handler);
        },
        init : function() {
            if ( typeof this.ele.setCapture === 'function' || $.opera) {
                $.addEvent(this.ele, 'mousedown', $.createDelegate(this, this._mousedown_handler));
                $.addEvent(this.ele, 'mouseup', $.createDelegate(this, this._mouseup_handler));
                $.addEvent(this.ele, 'mousemove', $.createDelegate(this, this._mousemove_handler));
            } else {
                this.__cmv_handler = $.createDelegate(this, this._chrome_mousemove_handler);
                this.__cmu_handler = $.createDelegate(this, this._chrome_mouseup_handler);
                $.addEvent(this.ele, 'mousedown', $.createDelegate(this, this._chrome_mousedown_handler));
            }
        }
    };


    $.extend($, {

        log : function(msg) {
            if(typeof jQuery !=='undefined' && jQuery.log === 'function') {
                jQuery.log.apply(this, arguments);
            } else {
                console.log(msg);
            }
        },
        getEventPoint : function(e) {
            var x= 0,y=0;
            if ( typeof e.offsetX !== 'undefined') {
                x = e.offsetX;
                y = e.offsetY;
            } else if ( typeof e.x !== 'undefined') {
                x = e.x, y = e.y
            } else if ( typeof e.layerX !== 'undefined') {
                x = e.layerX;
                y = e.layerY;
            } else {
                throw "no x,y in event(_getEventPoint)";
            }
            return {
                x : x,
                y : y
            };
        },
        addEvent : function(ele, event, handler) {
            if( typeof ele === 'string')
                ele = $(ele);
            if(window.addEventListener) {
                ele.addEventListener(event, handler);
            } else {
                ele.attachEvent('on' + event, handler);
            }
        },
        delEvent : function(ele, event, handler) {
            if( typeof ele === 'string')
                ele = $(ele);
            if(window.removeEventListener) {
                ele.removeEventListener(event, handler);
            } else {
                ele.detachEvent('on' + event, handler);
            }
        },
        createDelegate : function(instance, func) {
            return function() {
                return func.apply(instance, arguments);
            }
        },
        stopEvent : function(e) {
            if(e == null)
                return;
            if(e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
            if(e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        addWheelEvent : function(ele, handler) {
            if( typeof ele === 'string')
                ele = $(ele);
            if(window.addEventListener) {
                if(this.firefox) {
                    $.log('addwheel')
                    ele.addEventListener('DOMMouseScroll', handler);
                }
                else
                    ele.addEventListener('mousewheel', handler);
            } else {
                ele.attachEvent('onmousewheel', handler);
            }
        },
        /**
         * js 面向对象。实现了基本的继承和多态。由xiaoge设计编写。
         *
         */
        inherit : function(inheritClass, baseClass) {
            if(typeof inheritClass === 'undefined' || typeof baseClass ==='undefined'){
                console.trace();
                throw "inherit error!";
            }
            //首先把父类的prototype中的函数继承到子类中
            for(var pFunc in baseClass.prototype) {
                var sp = inheritClass.prototype[pFunc];
                //如果子类中没有这个函数，添加
                if( typeof sp === 'undefined') {
                    inheritClass.prototype[pFunc] = baseClass.prototype[pFunc];
                }
                //如果子类已经有这个函数，则忽略。以后可使用下面的callBase函数调用父类的方法

            }
            //保存继承树，当有多级继承时要借住继承树对父类进行访问
            inheritClass.__base_objects__ = new Array();
            inheritClass.__base_objects__.push(baseClass);

            if( typeof baseClass.__base_objects__ !== 'undefined') {
                for(var i = 0; i < baseClass.__base_objects__.length; i++)
                    inheritClass.__base_objects__.push(baseClass.__base_objects__[i]);
            }

            /**
             * 执行父类构造函数，相当于java中的this.super()
             * 不使用super是因为super是ECMAScript保留关键字.
             * @param {arguments} args 参数，可以不提供
             */
            inheritClass.prototype.base = function(args) {

                var baseClass = null, rtn = undefined;
                if( typeof this.__inherit_deep__ === 'undefined') {
                    this.__inherit_deep__ = 0;
                } else {
                    this.__inherit_deep__++;
                    //$.dprint("d+:"+this.__inherit_deep__);
                }

                baseClass = inheritClass.__base_objects__[this.__inherit_deep__];

                if( typeof args === "undefined" || args == null) {
                    rtn = baseClass.call(this);
                } else if( args instanceof Array === true) {
                    rtn = baseClass.apply(this, args);
                } else {
                    var _args = new Array();
                    for(var i = 0; i < arguments.length; i++)
                        _args.push(arguments[i]);
                    rtn = baseClass.apply(this, _args);
                }

                this.__inherit_deep__--;

                //$.dprint("d-:"+this.__inherit_deep__);
                return rtn;
            }
            /**
             * 给继承的子类添加调用父函数的方法
             * @param {string} method 父类的函数的名称
             * @param {arguments} args 参数，可以不提供
             */
            inheritClass.prototype.callBase = function(method, args) {

                var baseClass = null, rtn = undefined;

                if( typeof this.__inherit_deep__ === 'undefined') {
                    this.__inherit_deep__ = 0;

                } else {
                    this.__inherit_deep__++;
                    //$.dprint("d+:"+this.__inherit_deep__);
                }

                //$.dprint(this.__inherit_deep__);
                baseClass = inheritClass.__base_objects__[this.__inherit_deep__];

                var med = baseClass.prototype[method];
                if( typeof med === 'function') {
                    if( typeof args === "undefined" || args === null) {
                        rtn = med.call(this);
                    } else if( args instanceof Array === true) {
                        rtn = med.apply(this, args);
                    } else {
                        var _args = new Array();
                        //从位置1开始，因为第0位参数是method的名称
                        for(var i = 1; i < arguments.length; i++) {
                            _args.push(arguments[i]);
                        }
                        rtn = med.apply(this, _args);
                    }
                } else {
                    throw "There is no method:" + method + " in baseClass";
                }

                this.__inherit_deep__--;

                //$.dprint("d-:"+this.__inherit_deep__);
                //$.dprint("----");
                return rtn;
            }
        },
        FONT_INFO_TABLE : {},
        getFontInfo : function(size, name) {
            if(this.FONT_INFO_TABLE[name] == null) {
                this.FONT_INFO_TABLE[name] = {};
            }
            var h = this.FONT_INFO_TABLE[name][size];
            if(h == null) {
                h = this.FONT_INFO_TABLE[name][size] = this._calcFontInfo(size, name);
            }
            return h;
        },
        /*
         * 计算font_size大小的字号，font_name名称的字体的信息
         *  height : 当前字体的高度
         * baseline: 当前字体的baseline线距离底部的距离
         * 实现的原理是使用浏览器对dom元素的渲染结果，当span的font-size为0时其位置正好处于baseline的地方。
         */
        _calcFontInfo : function(font_size, font_name) {
            var con = document.createElement("div"), ele = document.createElement("span"), ele2 = document.createElement("span"), h = 0;
            //  con.style.visibility = "hidden";
            con.style.margin = "0px";
            con.style.padding = "0px";
            con.style.position = "relative";
            ele.style.font = font_size + "px " + font_name;
            ele.style.margin = "0px";
            ele.style.padding = "0px";
            // ele.style.visibility = "hidden";
            ele.style.verticalAlign = "baseline";


            ele2.style.font = "0px " + font_name;
            ele2.style.margin = "0px";
            ele2.style.padding = "0px";
            //   ele2.style.visibility = "hidden";
            ele2.style.verticalAlign = "baseline";
            var test_string = "@白羊座小葛 04-02.I Love Daisy.南京大学";
            ele.innerHTML = test_string;
            ele2.innerHTML = test_string;
            con.appendChild(ele2);
            con.appendChild(ele);
            document.body.appendChild(con);
            var h = con.offsetHeight;
            var bo = ele.offsetHeight + ele.offsetTop - ele2.offsetTop;
            document.body.removeChild(con);
            //$.log("font %s height:%d", font, h);
//        $.log("%s,%s",h,bo)
            return {
                height : h,
                baseline : ele2.offsetTop,
                baseline_offset : bo
            };
        },
        /**
         * 计算两点距离(Point To Point)
         */
        getPTPRange : function(point1, point2) {
            return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
        },
        getEventPoint : function(e) {
            var x= 0,y=0;
            if ( typeof e.offsetX !== 'undefined') {
                x = e.offsetX;
                y = e.offsetY;
            } else if ( typeof e.x !== 'undefined') {
                x = e.x, y = e.y
            } else if ( typeof e.layerX !== 'undefined') {
                x = e.layerX;
                y = e.layerY;
            } else {
                throw "no x,y in event(_getEventPoint)";
            }
            return {
                x : x,
                y : y
            };
        }

    });

})(dLighter.$);

