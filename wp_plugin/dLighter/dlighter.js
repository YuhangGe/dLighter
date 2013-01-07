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
                func.apply(instance, arguments);
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

(function(D, $) {
    D.config = {
        tag_name : "pre",
        theme : 'dLighter',
        max_height : 2000
    };
    D.go = function() {
        if(! $.hasCanvas) {
            alert("dLighter is not supported by your browser");
            return;
        }
        var codes = document.getElementsByTagName(D.config.tag_name);
        for(var i=0;i<codes.length;i++) {
            var ce = codes[i], src = ce.getAttribute("src");
            if(src && src.trim()!=="") {
                D._ajaxCreate(ce, src.trim());
            } else {
                var text = ce.textContent || ce.innerText || "  ";
                D._create(ce, text);
            }
        }
    };

    D.__lighter__id = 0;
    D._ajax = function(ce, src) {
        this.ce = ce;
        this.src = src;
        this.load_delegate = $.createDelegate(this, this.onload);
    }
    D._ajax.prototype = {
        load : function() {
            jQuery.get(this.src, this.load_delegate, "text");
        },
        onload : function(rtn) {
//            $.log(rtn);
            D._create(this.ce, rtn);
        }
    }
    D._ajaxCreate  = function(ce, src) {
        var _a = new D._ajax(ce, src);
        _a.load();
    };

    var _a = function(ele, attr_name, attr_value) {
        if(typeof attr_value === 'undefined') {
            return ele.getAttribute(attr_name);
        } else {
            ele.setAttribute(attr_name, attr_value);
        }
    };

    D._create = function(ce, text) {
        var _width = parseInt(_a(ce,"width")) || ce.offsetWidth;
        var _height = parseInt(_a(ce, "height"));

        var STYLE_NAMES = ['position', 'display', 'left', 'top', 'margin-left', 'margin-top', 'margin-right', 'margin-bottom'];
        var STYLE_NAMES_ALIAS = ['position', 'display', 'left', 'top', 'marginLeft', 'marginTop', 'marginRight', 'marginBottom'];
        var _theme = _a(ce, "theme") || D.config.theme || "plain";
        var _lang = _a(ce, "lang") || ce.getAttribute("language") || "plain";
        var _bk_line = _a(ce, "break_line") == "true" ? true : false;
        var _class = _a(ce, "class");
        var _line_start = _a(ce, "line_number_start") || _a(ce, "lns") || "1";
        var _container = document.createElement("div");
        var _s = window.getComputedStyle(ce, null);
        for(var i=0;i<STYLE_NAMES.length;i++) {
            _container.style[STYLE_NAMES_ALIAS[i]] = _s.getPropertyValue(STYLE_NAMES[i]);
        }
        var _id = D.__lighter__id++;
        _a(_container, "class", _class ? _class + " dLighter" : "dLighter");
        _a(_container,"id", "dLighter-"+ _id)
        _container.style.position = "relative";
        _container.style.overflow = "hidden";
        _container.style.width = _width + "px";
        _container.style.height = _height + "px";
        ce.parentElement.insertBefore(_container, ce);
        ce.style.display = "none";

        _container.innerHTML = '<!-- dLighter(http://xiaoge.me) -->'
            + '<canvas id="dLighter-canvas-'+_id+'" class="dLighter-canvas"></canvas>'
            + '<div id="dLighter-scroll-ver-bar-'+_id+'" class="dLighter-scroll-ver-bar">'
            + '<div id="dLighter-scroll-ver-button-'+_id+'" class="dLighter-scroll-ver-button"></div>'
            + '</div>'
            + '<div id="dLighter-scroll-hor-bar-'+_id+'" class="dLighter-scroll-hor-bar">'
            + '<div id="dLighter-scroll-hor-button-'+_id+'" class="dLighter-scroll-hor-button"></div>'
            + '</div>'
//            + '<textarea id="dLighter-caret-'+_id+'" spellcheck="false" cols="0" rows="0" class="dLighter-caret" wrap="wrap" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px; opacity: 0;"></textarea>'
            + '<!-- dLighter end -->';
        /*
         * 把input放在container里面始终会有focus时窗口的滚动条会滚动，
         * 没有找到什么方法可以阻止这个行为。于是改变思路，把textarea直接放在documnet.body中，
         * 并且position设置为fixed, left位置和当前caret_pos.left一置，top为0。
         * 使用css的ime-mode:disabled是为了关闭ime输入法，否则用户在按键的时候还是会出现输入法的输入框.
         * chrome和safari下面没用，但不影响。
         */
        var _caret = document.createElement("textarea");

        _caret.style.imeMode = "disabled";
        _caret.setAttribute("class", "dLighter-caret");
        _caret.setAttribute("id", "dLighter-caret-"+_id);
        document.body.appendChild(_caret);

        var theme = D._Theme.get(_theme, {
            font_size : parseInt(_s.getPropertyValue("font-size")),
            font_name : _s.getPropertyValue("font-family")
        });
        var lighter = new D._Core._Lighter(
            {
                container : _container,
                canvas : $("dLighter-canvas-"+_id),
                caret : _caret,
                ver_scroll : $("dLighter-scroll-ver-button-"+_id),
                hor_scroll : $("dLighter-scroll-hor-button-"+_id)
            }, {
                width : _width,
                height : _height,
                max_height :D.config.max_height,
                language : _lang,
                break_line : _bk_line,
                text : text.replace(/\t/g,"    ").replace(/\r/g, ""),
                theme : theme,
                lexer :D._Lexer.get(_lang),
                line_number_start : parseInt(_line_start)
            });

        return lighter;
    };
    D.createLighter = function(ce) {
        if(! $.hasCanvas) {
            alert("dLighter is not supported by your browser");
            return;
        }
        var src = ce.getAttribute("src").trim();
        if(src!=="") {
            D._ajaxCreate(ce, src);
        } else {
            var text = ce.textContent || ce.innerText || "  ";
            D._create(ce, text);
        }

    }
})(dLighter, dLighter.$);/**
 * User: xiaoge
 * Date: 12-12-19 8:58
 * Email: abraham1@163.com
 */
(function(D, $) {
        D._Lighter = function(dom, config) {
            this.container = dom.container;
            this.canvas = dom.canvas;
            this.caret = dom.caret;
            this.scroll_ver = new D._Scroll(dom.ver_scroll, 'ver');
            this.scroll_hor = new D._Scroll(dom.hor_scroll, 'hor');
            this.theme = config.theme;
            this.lang_style = this.theme.getLanguageStyle(config.language);
            this.lexer = config.lexer;
            var li = $.getFontInfo(this.theme.font_size, this.theme.font_name);
            this.font_height = li.height;
            this.baseline_offset = li.baseline_offset;
            this.line_height = this.font_height;
            this.break_line = config.break_line ? true : false;
            this.scroll_breadth = this.theme.scroll_breadth;

            this.width = config.width > D._Lighter.MAX_CANVAS_WIDTH ? D._Lighter.MAX_CANVAS_WIDTH : config.width;
            this.max_height = config.max_height ? config.max_height : D._Lighter.MAX_CANVAS_HEIGHT;
            this.height_fixed = config.height > 0 ? true : false;
            this.height = config.height > 0 ? config.height : this.max_height;

            this.container.style.background = this.theme.background;
            this.canvas_width = this.width - this.scroll_breadth;
            this.canvas_height = this.height;
            this.canvas.width = this.canvas_width;
            this.canvas.height = this.canvas_height;
            this.scroll_left = 0;
            this.scroll_top = 0;
            this.line_number_start = config.line_number_start;
            this.caret_pos = {
                index : -1,
                para : 0,
                para_at : -1,
                left : 0,
                line : 0,
                top : 0
            }
            /*
             * _page, _Render, _Scheduler的初始化顺序不能更改，
             * 它们之间互相有依赖。
             */
            this.cur_page = new D._Page(this);
            this.render = new D._Render(this);
            this.scheduler = new D._Scheduler(this);

            this.caret_left = 0;
            this.caret_top = 0;
            this.caret_height = this.font_height;
            this.focused = false;

            this.scroll_ver.addListener(this);
            this.scroll_hor.addListener(this);
            this.scroll_ver.attachWheelEvent(this.canvas);
            this.scroll_ver.setBreadth(this.scroll_breadth);
            this.scroll_hor.setBreadth(this.scroll_breadth);
            this.initCaret();
            this.initEvent();

            if(typeof config.text === 'string') {
                this.setText(config.text);
            }
        }
        D._Lighter.MAX_CANVAS_HEIGHT = 3000;
        D._Lighter.MAX_CANVAS_WIDTH = 3000;
        D._Lighter.prototype = {
            onScroll : function(type, value) {
//                $.log("%s,%s",type, value);
                this._caretStopFlash();
                if(type==='ver') {
                    this.scroll_top = value;
                } else {
                    this.scroll_left = value;
                }
                this.paint();
                this._resetCaret();
            },
            resize : function() {
                var ph = this.cur_page.page_height, _th = ph > this.max_height ? this.max_height : ph;
                var ch = this.height_fixed ? this.height : _th;
                var h = this.height_fixed ? this.height : _th;
                if(this.cur_page.max_line_width > this.canvas_width) {
                    this.scroll_hor.setScrollMax(this.cur_page.max_line_width-this.canvas_width + 1000);
                    this.scroll_hor.setLength(this.canvas_width);
                    this.scroll_hor.scroll(this.scroll_left);
                    this.scroll_hor.show();
                    if(!this.height_fixed) {
                        h += this.scroll_breadth;
                    } else {
                        ch -= this.scroll_breadth;
                    }
                } else {
                    this.scroll_hor.hide();
                }
                if(ch<ph) {
                    this.scroll_ver.setLength(h);
                    this.scroll_ver.setScrollMax(ph - ch);
                    this.scroll_ver.scroll(this.scroll_top);
                    this.scroll_ver.show();
                } else {
                    this.scroll_ver.hide();
                }

                this.canvas_height = ch;
                this.render.height = ch;
                this.canvas.height = ch;
                this.height = h;
                if(!this.height_fixed) {
                    this.container.style.height = h + "px";
                }
            },

            setText : function(text) {
                this.cur_page.setText(text);
                this.scheduler.fuck();
            },
            /*
             * 由_Page调用,当_Page中的文字被选中时。
             * 通过设置caret的值，使得用户ctrl+c复制时可以直接将选中的文本放入剪贴板。
             * chrome和safari，IE可以在copy事件中修改数据而直接往剪贴板写入数据，
             * 但firefox不行，为了统一，使用往caret中放入与当前选中文本致的数据。
             */
            selectTextCallback : function(text) {
                this.caret.value = text;
                this.caret.select();
            },
            focus : function() {
                if (this.focused === false) {
                    $.log("focus");
                    this.focused = true;
                    this._caretFocus();
                }
            },
            blur : function() {
                if(this.focused) {
                    $.log("blur")
                    this.focused = false;
                    this._caretBlur();
                    if(this.cur_page.select_mode) {
                        this.cur_page.select(null);
                        this.paint();
                    }
                }
            },

            paint : function() {
//                var _t = new Date().getTime();
                this.render.paint();
//                $.log("paint time:%s", new Date().getTime()-_t);
            },

            findText : function(txt) {
                var idx = this.cur_page.findText(txt, this.caret_pos.index + 1);
                if (idx < 0)
                    return;
                else {
                    var fc = this.cur_page.getCaretByIndex(idx - 1), tc = this.cur_page.getCaretByIndex(idx - 1 + txt.length);
                    this.cur_page.select(fc, tc);
                    this._setCaret(tc);
                    this.render.paint();
                }
            },
            show : function() {
                this.container.style.display = "block";
            },
            hide : function() {
                this.container.style.display = "none";
            }
        }

})(dLighter._Core, dLighter.$);
(function(D, $) {

	/**
	 * 页面逻辑
	 */
    D._Paragraph = function(idx, len) {
        this.index = idx;
        this.length = len;
        this.line_start = -1;
        this.line_cross = -1;
        this.lines = [];
    };
   
    D._Line = function(end_index, unti_dir, width) {
        this.end_index = end_index ? end_index : -1;
        this.unti_dir = unti_dir ? unti_dir : [];
        this.width = width ? width : 0;
    };
	D._Page = function(lighter) {
		this.lighter = lighter;
		this.text = "";
        this.style_array = [];
        this.width_array = [];
        this.para_info = [];
        this.max_line_width = 0;
        this.style_delegate = $.createDelegate(this, this.style_callback);

        this.sync = {
            finished : false,
            go : $.createDelegate(this, this._syncMeasure),
            init :$.createDelegate(this, this._syncInit),
            cur_step : 0,
            total_step : 0,
            line_start : 0
        };

        this._init();
	};
	D._Page.prototype = {
        setText : function(txt) {
            if(typeof txt !== 'string' || txt.length === 0) {
                return;
            }
            this.text = txt;
            if(typeof window.Int8Array !== 'undefined') {
                this.style_array = new Int8Array(txt.length);
                this.width_array = new Float32Array(txt.length);
            } else {
                this.style_array = new Array(txt.length);
                this.width_array = new Array(txt.length);
            }
            this._init();
            this._layout();
        },
        style_callback : function(start, length, style_name) {
            var idx = this.lighter.lang_style.getStyleIndex(style_name);
            for(var i=start; i< start + length; i++){
                this.style_array[i] = idx;
            }
        },
        _measure : function() {
            var rd = this.lighter.render;
            rd.measure_cache = {};
            rd.m_num = 0;
//            var _t = new Date().getTime();
            var ls = 0;
            for(var i=0;i<this.para_info.length;i++) {
                this.para_info[i].line_start = ls;
                this.para_info[i].line_cross = this.lighter.render._measure(this.para_info[i]);
                ls += this.para_info[i].line_cross;
            }
//            $.log("measure time:%s", new Date().getTime()-_t);
            this.line_number = ls;
            this.page_height = this.line_height * this.line_number;
        },
        _syncInit : function(total_step) {
            this.sync.finished  = 0;
            this.sync.cur_step = 0;
            this.sync.line_start = 0;
            this.sync.total_step = total_step;
        },
        _syncMeasure : function(scheduler) {
            var s = this.sync;
            if(s.finished || s.cur_step >= s.total_step) {
                s.finished = true;
                scheduler.measure_step = s.total_step;
                return;
            }
            var s_b = scheduler.BREAK_TIME;
            var t_s = new Date().getTime();
            var c_s = t_s;
            /*
             *
             */
            while(c_s - t_s <= s_b) {
                var _p = this.para_info[s.cur_step];
                _p.line_start = s.line_start;
                _p.line_cross = this.lighter.render._measure(_p);
                s.line_start += _p.line_cross;
                s.cur_step++;
                if(s.cur_step>= s.total_step) {
                    s.finished = true;
                    break;
                } else {
                    c_s = new Date().getTime();
                }
            }
            this.line_number = s.line_start;
            this.page_height = this.line_height * this.line_number;
            scheduler.measure_step = s.cur_step;
        },
        _layout : function(){
            /*
             * 首先计算出所有段落的信息
             */
            var pi = -1, ci = -1, tx = this.text, tl = this.text.length;
            while(true) {
                pi = tx.indexOf('\n', ci+1);
                if(pi<0) {
                    break;
                }
                this.para_info.push(new D._Paragraph(ci, pi-ci));
                ci = pi;
            }
            this.para_info.push(new D._Paragraph(ci, tx.length-ci-1));
            this.lighter.render.calc_padding_left(this.para_info.length);
        },

        _init : function() {
			this.para_info.length = 0;
			this.line_number = 0;
			this.select_mode = false;
			this.select_range = {
				from : null,
				to : null
			}
			/**
			 * 保存上一次查找的字符串
			 */
			this.last_find = {
				text : "",
				next : null
			}
            this.line_height = this.lighter.line_height;
            this.page_height = 0;
            this.max_line_width = 0;

        },
		
		selectAll : function() {
			return this.selectByIndex(-1, this.text.length - 1);
		},
		select : function(from, to) {
			if (from == null || to == null) {
				this.select_mode = false;
			} else {
				if (from.index > to.index) {
					throw "bad select";
				}
				this.select_mode = true;
				this.select_range = {
					from : from,
					to : to
				}
			}
            this.lighter.selectTextCallback(this.select_mode ? this.text.substring(from.index+1, to.index+1) : "");
        },
		_getParaByRow : function(row) {
			for (var i = 0; i < this.para_info.length; i++) {
				var p = this.para_info[i];
				if (p.line_start + p.line_cross > row)
					return i;
			}
			return this.para_info.length - 1;
		},

		/**
		 * 得到x,y处的字符的。跟_getCaret_xy不一样，不判断x,y在字符的左侧还是右侧，直接返回x,y所在字符
		 *
		 * is_dblclick:当在double click事件时调用这个函数此参数为true，是为了如果y越过了在最后一行，
		 * 返回文本最末尾。
		 */
		_getElementCaret_xy : function(x, y, is_dblclick) {
            y = y<0 ? 0 : y;

            var rd = this.lighter.render, line_height = rd.line_height, row = Math.floor(y / line_height), p_i = this._getParaByRow(row), para = this.para_info[p_i], idx = para.index, left = 0, bottom = (row + 1) * line_height, p_at = -1;
			var lp = this.para_info[this.para_info.length - 1], max_bot = (lp.line_start + lp.line_cross) * line_height;


			if (bottom > max_bot) {
				row = lp.line_start + lp.line_cross - 1;
				bottom = max_bot;
				if (is_dblclick) {
					x = rd.width;
				}
			}
            var l_off = rd.padding_num + rd.padding_left;
            x -= l_off;
            x = x<0 ? 0 : x;
			//$.log("row:%d,p:%d",row,p_i)
			if (para.length > 0) {
				var k = para.index + 1, e = k + para.length, line = para.lines[row - para.line_start];
				var left = 0, e_arr = this.text, w_arr = this.width_array, s_arr = this.style_array, cw = 0, pre_i = (row > para.line_start) ? para.lines[row - para.line_start - 1].end_index + 1 : 0;
				var _got = false;
                out_loop:
				for (var i = 0; i < line.unti_dir.length; i++) {
					var _ud = line.unti_dir[i];
					for (; pre_i < _ud.index; pre_i++) {
						cw = w_arr[para.index + 1 + pre_i];
						if (left + cw > x) {
							_got = true;
							break out_loop;
						}
						left += cw;
					}
					if (left + _ud.width > x) {
						left += _ud.width;
						for (; pre_i < _ud.index + _ud.length; pre_i++) {
							cw = w_arr[para.index + 1 + pre_i];
							if (left - cw <= x) {
								break;
							}
							left -= cw;
						}
						_got = true;
						break out_loop;
					} else {
						left += _ud.width;
						pre_i += _ud.length;
					}
				}
				if (!_got) {

					for (; pre_i <= line.end_index; pre_i++) {
						cw = w_arr[para.index + 1 + pre_i];

						if (left + cw > x) {
							_got = true;
							break;
						} else
							left += cw;
					}
					if (!_got)
						pre_i--;
				}
				//
				p_at = pre_i;

				idx = p_at + para.index + 1;
			}
			//$.log(idx)
			return {
				para : p_i,
				para_at : p_at,
				index : idx,
				line : row - para.line_start,
				left :  left + l_off,
				bottom : bottom
			}
		},
		/**
		 * 选定从from所在字符后的一个字符到to所在的字符，注意没有包括from所在字符，
		 * from如果为-1代表从第一个字符开始选取。
		 */
		selectByIndex : function(from, to) {
			var fc = this.getBeforeCaretByIndex(from + 1), tc = this.getCaretByIndex(to);
            this.select(fc, tc);
			return tc;
		},
        getCaretByIndex : function(index) {

            if (index === -1) {
                return {
                    index : -1,
                    para : 0,
                    para_at : -1,
                    left :  this.lighter.render.padding_num + this.lighter.render.padding_left,
                    line : 0,
                    top : 0
                };
            }
            for (var i = 0; i < this.para_info.length; i++) {
                var p = this.para_info[i];
                if (p.index + p.length >= index) {
                    return this._getCaret_p(i, index - p.index - 1);
                }
            }
        },
        /**
         * 得到index所指字符之前（左边）的游标位置。
         *
         */
        getBeforeCaretByIndex : function(index) {
            var n_c = this.getCaretByIndex(index);
            var ec = this.text.charCodeAt(index);
            if (D.Char.isRTL(ec)) {
                n_c.left += this.width_array[index];
            } else {
                n_c.left -= this.width_array[index];
            }
            n_c.index--;
            n_c.para_at--;
            return n_c;
        },
		/**
		 * 得到caret所在的那行的起始位置caret
		 */
		getCaretLineStart : function(caret) {
			var p = this.para_info[caret.para], l_at = caret.line - p.line_start, p_at = l_at === 0 ? -1 : p.lines[l_at - 1].end_index + 1;

			var n_c = this._getCaret_p(caret.para, p_at);
			if (l_at !== 0) {
				var ei = p.index + p_at + 1, ec = this.text.charCodeAt(ei);
				if (D.Char.isRTL(ec)) {
					n_c.left += this.width_array[ei];
				} else {
					n_c.left -= this.width_array[ei];
				}
				n_c.index--;
				n_c.para_at--;
			}
			return n_c;

		},
		/**
		 * 得到caret所在的那行的末尾位置caret
		 */
		getCaretLineEnd : function(caret) {
			//$.log(caret)
			var p = this.para_info[caret.para], l_at = caret.line - p.line_start, p_at = p.lines[l_at].end_index;
			return this._getCaret_p(caret.para, p_at);
		},

		/**
		 * 通过index得到所在段落。
		 */
		_getPosByIndex : function(index) {
			if (index === -1) {
				return {
					index : -1,
					para : 0,
					para_at : -1
				}
			}
			for (var i = 0; i < this.para_info.length; i++) {
				var p = this.para_info[i];
				if (p.index + p.length >= index) {
					return {
						para : i,
						para_at : index - p.index - 1,
						index : index
					}
				}
			}
		},
        /**
         * 得到某一行的宽度。目前只在text.render中使用。
         * @param idx
         * @return {*}
         * @private
         */
        _getLineInfo : function(idx) {
            var _t = 0, rtn = {
                width : 0,
                offset : 0
            }, rd = this.lighter.render;
            for(var i=0;i<this.para_info.length;i++) {
                var _p = this.para_info[i];
                if(_p.lines.length + _t > idx) {
                    rtn.width = _p.lines[idx-_t].width;
                    rtn.offset = rd.padding_num + rd.padding_left;
                    break;
                } else {
                    _t += _p.lines.length;
                }
            }
            return rtn;
        },
        _getLineInfo_p : function(pidx, lidx) {
            var rtn = {
                width : 0,
                offset : 0
            }, rd = this.lighter.render;

            var _p = this.para_info[pidx], _l = _p.lines[lidx];
            rtn.width= _l!=null?_l.width:0
            rtn.offset = rd.padding_num + rd.padding_left;

            return rtn;
        },
		_getCaret_xy : function(x, y) {

			//$.log("x:%d,y:%d",x,y)
            y = y < 0 ? 0 : y;

			var rd = this.lighter.render, line_height = rd.line_height, row = Math.floor(y / line_height), p_i = this._getParaByRow(row), para = this.para_info[p_i], idx = para.index, left = 0, bottom = (row + 1) * line_height, p_at = -1;
			var lp = this.para_info[this.para_info.length - 1], max_bot = (lp.line_start + lp.line_cross) * line_height;

            if (bottom > max_bot) {
                bottom = max_bot;
                row = lp.line_start + lp.line_cross - 1;
            }
            var line = para.lines[row - para.line_start];
            var l_off = rd.padding_num + rd.padding_left;
            x -= l_off;
            x = x < 0 ? 0 : x;

			//$.log("row:%d,p:%d",row,p_i)
			if (para.length > 0) {
				var k = para.index + 1, e = k + para.length;
				var left = 0, e_arr = this.text, w_arr = this.width_array, cw = 0, pre_i = (row > para.line_start) ? para.lines[row - para.line_start - 1].end_index + 1 : 0;
				var _got = false;


                out_loop:
				for (var i = 0; i < line.unti_dir.length; i++) {
					var _ud = line.unti_dir[i];
					for (; pre_i < _ud.index; pre_i++) {
						cw = w_arr[para.index + 1 + pre_i];
						if (left + cw / 2 > x) {
							_got = true;
							break out_loop;
						}
						left += cw;
						if (left > x) {
							pre_i++;
							_got = true;
							break out_loop;
						}

					}
					if (left + _ud.width > x) {
						left += _ud.width;
						for (; pre_i < _ud.index + _ud.length; pre_i++) {
							cw = w_arr[para.index + 1 + pre_i];
							if (left - cw / 2 <= x) {
								break;
							}
							left -= cw;
							if (left <= x) {
								pre_i++;
								break;
							}
						}
						_got = true;
						break out_loop;
					} else {
						left += _ud.width;
						pre_i += _ud.length;
					}
				}
				if (!_got) {
					for (; pre_i <= line.end_index; pre_i++) {
						cw = w_arr[para.index + 1 + pre_i];
						if (left + cw / 2 > x)
							break;
						else
							left += cw;
					}
				}
				//
				// //$.log(left);
				p_at = pre_i - 1;
				idx += pre_i;

			}
			//$.log("%s,%s,%s",p_i,p_at,idx);
			return {
				para : p_i,
				para_at : p_at,
				line : row,
				index : idx,
				left : left + l_off,
				top : bottom - this.lighter.line_height
			};
			//
			//$.log("%d",bottom);

		},

		/**
		 * 某个元素之后的caret位置
		 * p_idx:段落号
		 * p_at: 在该段落的第几个元素之后(-1表示段落最顶部，即第一个元素之前.null表示最尾部，最后一个元素之后)
		 */
		_getCaret_p : function(p_idx, p_at) {
			//$.log("%d,%d,%d",p_idx,p_at,this.char_array.length);
			var para = this.para_info[p_idx], e_idx = para.index + ( p_at = (p_at === null ? para.length - 1 : p_at)) + 1, line_at = para.line_start, left = 0, rd = this.lighter.render, bottom = (line_at + 1) * rd.line_height;
			var e_arr = this.text, s_arr = this.style_array, w_arr = this.width_array, l_off = rd.padding_num + rd.padding_left, line = null;
			if (p_at >= 0) {
				//$.log(e_idx)
				var ele = e_arr[e_idx];
				while (s_arr[e_idx]<0 && p_at >= -1) {
					e_idx--;
					p_at--;
					ele = e_arr[e_idx];
				}
				var s_idx = 0, ud = null;
				//$.log(p_at)
				//$.log(para.lines)
				out :
				for (var i = 0; i < para.lines.length; i++) {
					line = para.lines[i];
					if (line.end_index >= p_at) {
						//$.log(line)
						var left = 0, pre_i = s_idx;
						for (var k = 0; k < line.unti_dir.length; k++) {
							ud = line.unti_dir[k];
							if (ud.index > p_at) {
								break;
							} else if (ud.index + ud.length - 1 < p_at) {
								for (; pre_i < ud.index; pre_i++) {
									left += w_arr[pre_i + para.index + 1];

								}
								left += ud.width;
								pre_i = ud.index + ud.length;
							} else {
								for (; pre_i < ud.index; pre_i++) {
									left += w_arr[pre_i + para.index + 1];
								}
								left += ud.width;
								for (; pre_i <= p_at; pre_i++) {
									left -= w_arr[pre_i + para.index + 1];
								}
								//直接跳出最外层循环。
								break out;
							}
						}
						for (; pre_i <= p_at; pre_i++) {
							left += w_arr[pre_i + para.index + 1];
						}
						break;
					}
					s_idx = line.end_index + 1;
				}
				line_at = para.line_start + i;
				bottom = (line_at + 1) * this.lighter.line_height;
			} else {
                line = para.lines[0];
            }

			left += l_off;
			//$.log(left)
			return {
				para : p_idx,
				para_at : p_at,
				line : line_at,
				index : e_idx,
				left : left,
				top : bottom - this.lighter.line_height
			}
		},
		getParaIndex_xy : function(x, y) {
			y = y < 0 ? 0 : y;
			x = x < 0 ? 0 : x;
			var rd = this.lighter.render, line_height = rd.line_height, row = Math.floor(y / line_height);
			return this._getParaByRow(row);
		},
		selectParaByIndex : function(p_id) {
			var p = this.para_info[p_id], fc = null, tc = this._getCaret_p(p_id, p.length - 1);
			if (p.length > 0) {
				fc = this._getCaret_p(p_id, -1);
				this.select(fc, tc);
			}
			return tc;
		},

//		/**
//		 * 复制
//		 */
//		copySelect : function() {
//            var f = this.select_range.from.index+1, t = this.select_range.to.index;
//            return this.text.substring(f, t);
//		},

		findText : function(txt, start) {
			var arr = this.text, lf = this.last_find, t_next = lf.text === txt ? lf.next : (lf.next = $.getKmpNext(lf.text = txt));
			var i = (start < 0 || start >= arr.length) ? 0 : start, idx = 0;
			/**
			 * 在整个文本中从start位置循环查找字符串。
			 * 两个while循环的实际复杂度是线性的，这个是KMP字符串匹配算法的特色。
			 */
			while (true) {
				while (true) {
					if (arr[i].value === txt[idx]) {
						idx++;
						if (idx === txt.length) {
							return i - idx + 1;
						}
						break;
					} else if (idx === 0) {
						break;
					} else {
						idx = t_next[idx];
					}
				}
				i++;
				if (i === start) {
					break;
				} else if (i === arr.length) {
					i = 0;
				}
			}

			return -1;
		}
	}

})(dLighter._Core, dLighter.$);
/**
 * 渲染逻辑
 */
(function(D, $) {

	D._Render = function(lighter) {
		this.lighter = lighter;
		this.page = lighter.cur_page;
		this.canvas = lighter.canvas;
		this.ctx = this.canvas.getContext('2d');
		
		this.width = lighter.canvas_width;
		this.height = lighter.canvas_height;
        this.baseline_offset = lighter.baseline_offset;
        this.measure_width = lighter.break_line ? this.width : Infinity;

		this.line_height = lighter.line_height;

		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.font = lighter.theme.font;
        this.SPACE_WIDTH = this.ctx.measureText(" ").width;
        this.padding_left = Math.round(1.5 * this.SPACE_WIDTH);
        this.padding_num = 0;

    }
    D._Render.SELECT_PADDING = 8;
	D._Render.prototype = {
		calc_padding_left : function(max_num) {
            var mn = this.lighter.line_number_start + max_num - 1;
            this.ctx.font = this.lighter.theme.font;
            this.padding_num = this.ctx.measureText(mn.toString()).width;
            if(this.padding_num < 3*this.SPACE_WIDTH) {
                this.padding_num = 3*this.SPACE_WIDTH;
            }
            this.padding_num += Math.round(1.5*this.SPACE_WIDTH);
            this.measure_width = this.lighter.break_line ? this.width-this.padding_num - this.padding_left : Infinity;
        },
		_paintSelectRange : function(from, to, top, w, h) {
			var caret = from === null ? to : from, w_arr = this.page.width_array, para = this.page.para_info[caret.para], l_idx = caret.line - para.line_start, lines = para.lines, line = lines[l_idx], fi = from === null ? (l_idx > 0 ? lines[l_idx - 1].end_index + 1 : 0) : from.index - para.index, ti = to === null ? line.end_index : to.index - para.index - 1;
            var l_info = this.page._getLineInfo_p(caret.para, l_idx);
//            $.log(l_info)
			var idx = 0, left = (from === null ? l_info.offset : from.left), right = left, _g_f = false, _finish = false;
//            if(to===null)
//            $.log("f1:%s",left);
            for (var i = 0; i < line.unti_dir.length; i++) {
				var _u = line.unti_dir[i], _ul = _u.index + _u.length;
				if (!_g_f) {
					if (_ul <= fi) {
						continue;
					}

					if (_u.index >= fi) {
						_g_f = true;
					}
					idx = fi;
					left = from === null ? l_info.offset : from.left;
//                    if(to===null)
//                    $.log("f2:%s",left);

                    right = left;
				}

				if (_g_f) {
					if (_u.index > ti) {
						break;
					}
					for (; idx < _u.index; idx++) {
						right += w_arr[idx + para.index + 1];
					}
					if (ti < _ul) {
						this.ctx.fillRect(left, top, right - left, h);
						left = right + _u.width;
						right = left;
						for (; idx <= ti; idx++) {
							right -= w_arr[idx + para.index + 1];
						}
						this.ctx.fillRect(left, top, right - left, h);
						_finish = true;
						break;
					} else {
						right += _u.width;
						idx = _ul;
					}
				} else {
					if (ti < _ul) {
						if (to === null) {
							for (; idx < _ul; idx++) {
								right -= w_arr[idx + para.index + 1];
							}
						} else {
							right = to.left;
						}
						this.ctx.fillRect(left, top, right - left, h);
                        _finish = true;
						break;
					} else {
						for (; idx < _ul; idx++) {
							right -= w_arr[idx + para.index + 1]; //jjia
						}
						//$.log('r')
						this.ctx.fillRect(left, top, right - left, h);
                        left = right + _u.width;
						right = left;
					}
					_g_f = true;
				}
			}

			if (!_finish) {
				right = to === null ? (l_info.offset + l_info.width + 8) : to.left;
				this.ctx.fillRect(left, top, right - left, h);
			} else if(to === null) {
                this.ctx.fillRect(l_info.offset+l_info.width,top, 8, h);
            }
        },
		_paintSelect : function(from, to) {
			this.ctx.fillStyle = this.lighter.theme.selected_background;
			var s_l = from.line, e_l = to.line, c_h = this.line_height, c_w = this.width
			var s_t = this.lighter.scroll_top,
				line_start = Math.floor(s_t/c_h),
				top = (s_l>=line_start?s_l:line_start)*c_h - s_t;

			if (s_l === e_l) {
				if(s_l>=line_start){
					this._paintSelectRange(from, to, top, c_w, c_h)
				}
			} else {
				if(s_l>=line_start){
					this._paintSelectRange(from, null, top, c_w, c_h);
					top += c_h;
				}
				var i = s_l + 1 < line_start ? line_start : s_l + 1;
				for (; i < e_l; i++) {
                    var _info = this.page._getLineInfo(i);
					this.ctx.fillRect(_info.offset, top, _info.width+ D._Render.SELECT_PADDING, c_h);
					top += c_h;
					if(top>this.height){
						break;
					}
				}
				if(top<=this.height){
					from = this.page.getCaretLineStart(to);
					this._paintSelectRange(from, to, top, c_w, c_h);
				}
				//$.log(to)
				
			}

		},
		_paintString : function(str, style_idx, left, bottom, width, rtl) {
			//$.log('ps:%s, %d,%d',str,left,bottom)

            var style = this.lighter.lang_style.style_array[style_idx];
            /*
             * 注释掉的代码用来实现背景色，下划线和删除线。当前版本暂时不需要
             */
			//var h = this.line_height, fh = $.getFontHeight(style.font_size, style.font_name);
			//var w_left = rtl ? left - width : left;


			this.ctx.font = style.font;
//			if (style.background) {
//				//$.log('bg:%d,%d,%d,%d',pre_ele.left,pre_ele.top,w,h)
//				//$.log("%s,%s,%s",str,left,width)
//				this.ctx.fillStyle = style.background;
//				this.ctx.fillRect(w_left, bottom - h + this.baseline_offset, width, h);
//			}
			this.ctx.fillStyle = style.color;
            /**
             * Math.round是因为整数的坐标可以绘制出更为平滑的文字
             */
			this.ctx.fillText(str, Math.round(left), Math.round(bottom));

            //$.log(str+left +"," + bottom)
            //$.log(style.font);
//			if (style.underline) {
//				this.ctx.fillRect(w_left, bottom + fh / 11, width, fh / 15);
//			}
//			if (style.through) {
//				this.ctx.fillRect(w_left, bottom - fh / 4, width, fh / 15);
//			}

		},

		_paintRange : function(fi, ti, hor, bottom, rtl) {
			//$.log("pr:%d,%d,%s", fi, ti,rtl);
			//$.log(bottom)
			this.ctx.textAlign = rtl ? 'right' : 'left';
			//$.log("hor:%s",hor)
			var e_arr = this.page.text, w_arr = this.page.width_array, s_arr = this.page.style_array;

			var w = 0, r_str = "", r_w = 0;
			for (var i = fi; i <= ti; i++) {

				var c_e = e_arr[i], c_c = e_arr.charCodeAt(i), n_e = i < ti ? e_arr[i + 1] : null, n_c = n_e === null ? -1 : e_arr.charCodeAt(i+1);

				r_str += c_e;
				r_w += w_arr[i];
				w += w_arr[i];

				//if (D.Char.isBiaoDian(c_c)) {
					//this._paintString(r_str, s_arr[i], hor, bottom, w_arr[i], rtl);
			//	} else
                if ((n_c<0 || s_arr[i+1]!==s_arr[i]) && s_arr[i]>=0) {
					this._paintString(r_str, s_arr[i], hor, bottom, w, rtl);
				} else if(s_arr[i]<0) {
                    //s_arr[i]<0表明当前已经到了行末尾的不可见空格处，跳出循环
                    break;
                } else {
                    continue;
                }
				//$.log("hor: "+hor);
				//$.log(r_str)
				//$.log(w)
				hor += rtl ? -w : w;
				r_str = "";
				w = 0;

			}
			//$.log("w:%s",r_w)
			return r_w;
		},
		_paintLine : function(si, ei, p_idx, unti_dir, bottom) {
//			$.log("pl:%d,%d,%d",si,ei, p_idx)
			var fi = si;
            var hor = this.padding_num + this.padding_left; // rtl ? this.inner_width + this.padding_left+this.padding_right - hor_offset : hor_offset;
			//var hor = rtl ? this.width : 0, a_off = (this.width - width) / 2;
			for (var i = 0; i < unti_dir.length; i++) {

				var _a = unti_dir[i], w = 0;
				//$.log(_a)
				w = this._paintRange(p_idx + fi, p_idx + _a.index - 1, hor, bottom, false);
				hor += w;
				//$.log("hor: "+hor)

				hor += _a.width;
				w = this._paintRange(p_idx + _a.index, p_idx + _a.index + _a.length - 1, hor, bottom, true);
//				/**
//				 * 以下代码是调试时防止出bug。可以删除。
//				 */
//				if (Math.abs(_a.width - w) > 2) {
//					//$.log("%s !== %s",_a.width,w)
//					throw "?! at Text._Render._paintLine"
//				}
				//$.log("hor: "+hor)
				fi = _a.index + _a.length;
			}
			if (fi <= ei) {
				//$.log("hor: "+hor)
				this._paintRange(p_idx + fi, p_idx + ei, hor, bottom, false);
			}

		},
		_paintContent : function() {
			var s_t = this.lighter.scroll_top,
                s_l = this.lighter.scroll_left,
				l_h = this.line_height,
                l_s = this.lighter.line_number_start,
                _t = this.lighter.theme,
				para = this.page.para_info, total_line = 0, t_h = s_t,
				line_start = 0, bottom = 0;
			if(t_h<=0){
				line_start = 0;
				bottom = -t_h + l_h;
			} else {
				line_start = Math.floor(t_h/l_h);
				bottom = (line_start+1)*l_h - t_h;
			}
		
			var i = 0;
			while(i<para.length && (total_line+=para[i].lines.length)<=line_start){
				i++;
			}
			para_loop:
			for (;i < para.length; i++) {
//                $.log("pline:%s",i);
                this.ctx.font = _t.font;
                this.ctx.fillStyle = _t.gutter_number_color;
                this.ctx.textAlign = "right";
                this.ctx.fillText(l_s + i, this.padding_num - this.SPACE_WIDTH, bottom - this.baseline_offset);
                this.ctx.fillStyle = _t.gutter_line_color;
                this.ctx.fillRect(this.padding_num, 0, 3, this.height);
                var ep = para[i], ls = ep.lines, si = 0;
                for (var j = 0; j < ls.length; j++) {
					this._paintLine(si, ls[j].end_index, ep.index + 1, ls[j].unti_dir, bottom - this.baseline_offset);
					si = ls[j].end_index + 1;
					bottom += l_h;
					if(bottom>this.height+l_h){
						break para_loop;
					}
				}
			}
		},

		paint : function() {
//			$.log("paint");

			this.ctx.save();

			//this.ctx.scale(this.scale, this.scale);
            this.ctx.fillStyle = this.lighter.theme.background;
			this.ctx.fillRect(0, 0, this.width, this.height);
//            this.ctx.clearRect(0, 0, this.width, this.height);
//
            this.ctx.translate(-this.lighter.scroll_left, 0);

            if (this.page.select_mode) {
                this._paintSelect(this.page.select_range.from, this.page.select_range.to);
            }

			if (this.page.text.length > 0) {
				this._paintContent();
			}


			this.ctx.restore();


			
		},
		_showCaret : function(left, top, width, height, color) {
			if(top+height>0) {
                this.ctx.save();
                this.ctx.fillStyle = color;
//                $.log(color);
//                this.ctx.globalCompositeOperation = "xor";
//                $.log("%s,%s,%s,%s",left, top, width, height)
                this.ctx.fillRect(left, top, width, height);
                this.ctx.restore();
            }
		},
		_hideCaret : function(left, top, img) {
			this.ctx.putImageData(img, left, top);
		}
	}

})(dLighter._Core, dLighter.$);
(function(D, $) {
	D.Char = {
		isRTL : function(c) {
			return c >= 0x600 && c <= 0x6ff;
		},
		isBiaoDian : function(c) {
			return (c >= 32 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126);
		},
		isDigit : function(c) {
			return c >= 48 && c <= 57;
		},
		/**
		 * 从andorid 源码StaticLayout.java移植
		 */
		isIdeographic : function(c, includeNonStarters) {
			if (c >= 0x2E80 && c <= 0x2FFF) {
				return true;
				// CJK, KANGXI RADICALS, DESCRIPTION SYMBOLS
			}
			if (c === 0x3000) {
				return true;
				// IDEOGRAPHIC SPACE
			}
			if (c >= 0x3040 && c <= 0x309F) {
				if (!includeNonStarters) {
					switch (c) {
						case 0x3041:
						//  # HIRAGANA LETTER SMALL A
						case 0x3043:
						//  # HIRAGANA LETTER SMALL I
						case 0x3045:
						//  # HIRAGANA LETTER SMALL U
						case 0x3047:
						//  # HIRAGANA LETTER SMALL E
						case 0x3049:
						//  # HIRAGANA LETTER SMALL O
						case 0x3063:
						//  # HIRAGANA LETTER SMALL TU
						case 0x3083:
						//  # HIRAGANA LETTER SMALL YA
						case 0x3085:
						//  # HIRAGANA LETTER SMALL YU
						case 0x3087:
						//  # HIRAGANA LETTER SMALL YO
						case 0x308E:
						//  # HIRAGANA LETTER SMALL WA
						case 0x3095:
						//  # HIRAGANA LETTER SMALL KA
						case 0x3096:
						//  # HIRAGANA LETTER SMALL KE
						case 0x309B:
						//  # KATAKANA-HIRAGANA VOICED SOUND MARK
						case 0x309C:
						//  # KATAKANA-HIRAGANA SEMI-VOICED SOUND MARK
						case 0x309D:
						//  # HIRAGANA ITERATION MARK
						case 0x309E:
							//  # HIRAGANA VOICED ITERATION MARK
							return false;
					}
				}
				return true;
				// Hiragana (except small characters)
			}
			if (c >= 0x30A0 && c <= 0x30FF) {
				if (!includeNonStarters) {
					switch (c) {
						case 0x30A0:
						//  # KATAKANA-HIRAGANA DOUBLE HYPHEN
						case 0x30A1:
						//  # KATAKANA LETTER SMALL A
						case 0x30A3:
						//  # KATAKANA LETTER SMALL I
						case 0x30A5:
						//  # KATAKANA LETTER SMALL U
						case 0x30A7:
						//  # KATAKANA LETTER SMALL E
						case 0x30A9:
						//  # KATAKANA LETTER SMALL O
						case 0x30C3:
						//  # KATAKANA LETTER SMALL TU
						case 0x30E3:
						//  # KATAKANA LETTER SMALL YA
						case 0x30E5:
						//  # KATAKANA LETTER SMALL YU
						case 0x30E7:
						//  # KATAKANA LETTER SMALL YO
						case 0x30EE:
						//  # KATAKANA LETTER SMALL WA
						case 0x30F5:
						//  # KATAKANA LETTER SMALL KA
						case 0x30F6:
						//  # KATAKANA LETTER SMALL KE
						case 0x30FB:
						//  # KATAKANA MIDDLE DOT
						case 0x30FC:
						//  # KATAKANA-HIRAGANA PROLONGED SOUND MARK
						case 0x30FD:
						//  # KATAKANA ITERATION MARK
						case 0x30FE:
							//  # KATAKANA VOICED ITERATION MARK
							return false;
					}
				}
				return true;
				// Katakana (except small characters)
			}
			if (c >= 0x3400 && c <= 0x4DB5) {
				return true;
				// CJK UNIFIED IDEOGRAPHS EXTENSION A
			}
			if (c >= 0x4E00 && c <= 0x9FBB) {
				return true;
				// CJK UNIFIED IDEOGRAPHS
			}
			if (c >= 0xF900 && c <= 0xFAD9) {
				return true;
				// CJK COMPATIBILITY IDEOGRAPHS
			}
			if (c >= 0xA000 && c <= 0xA48F) {
				return true;
				// YI SYLLABLES
			}
			if (c >= 0xA490 && c <= 0xA4CF) {
				return true;
				// YI RADICALS
			}
			if (c >= 0xFE62 && c <= 0xFE66) {
				return true;
				// SMALL PLUS SIGN to SMALL EQUALS SIGN
			}
			if (c >= 0xFF10 && c <= 0xFF19) {
				return true;
				// WIDE DIGITS
			}

			return false;
		}
	}

	$.extend(D._Render.prototype, {
		_getRTLLength : function(e_arr, idx, e_idx) {
			var pre_s = false, len = 1, i = idx + 1, s_len = 0;
			while (i < e_idx) {
				var _ele = e_arr[i], c = _ele.charCodeAt(0);
				if (D.Char.isRTL(c)) {
					/**
					 * 如果 rtl为真，则取得rtl文字；否则，通过is_rtl和c>0取得 ltr 文字。
					 */
					if (pre_s) {
						/**
						 * 如果在两端阿拉伯文字中夹了空格，把空格加入
						 */
						len += s_len;
						pre_s = false;
						s_len = 0;
					}
					len++;

				} else if (D.Char.isBiaoDian(c)) {
					/**
					 * 标点自身不具备方向属性，如果夹在两个相同方向之间，则跟这个方向一致。
					 */
					s_len++;
					pre_s = true;
				} else {
					break;
				}
				i++;
			}
			//$.log("al:%d",len)
			return len;
		},

		_measureStrElement : function(style_index, str) {
            this.ctx.font = this.lighter.lang_style.style_array[style_index].font;
            var w = this.ctx.measureText(str).width;
			return w;
		},
		_measure : function(para) {
			para.lines = [new D._Line(-1, [], 0)];
			return this._doMeasure(para);
		},

		_m_LTR : function(left, e_arr, w_arr, s_arr, idx, l_at, para, s_idx, e_idx) {

			var bk_idx = idx - 1, first = false, bk_w = 0, i = idx, line_at = l_at;
			var end_index = e_idx;
			var width = this.measure_width - left;
			var rg_idx = -1;
			var pre_w = 0, cur_w = 0, str = "";

            //$.log(width);
			while (i < end_index) {

				var e = e_arr[i], c = e.charCodeAt(0),
					pe = i===idx? null : e_arr[i-1], pc = pe===null ? -1 : pe.charCodeAt(0),
					ne = i + 1 < e_idx ? e_arr[i + 1] : null,
					nc = (ne === null ? -1 : ne.charCodeAt(0));

				if (D.Char.isRTL(c)) {
					end_index = i;
					break;
				}

			    if (pe === null || pc < 0 || s_arr[i] !== s_arr[i-1]) {
					pre_w = 0;
					str = "";
				}
				str += e;
				cur_w = this._measureStrElement(s_arr[i], str);
				w_arr[i] = cur_w - pre_w;
					//$.log(cur_w);
				pre_w = cur_w;

				bk_w += w_arr[i];

				if (bk_w < width) {
					if (//如果当前字符不是char，可breakline
					c < 0
					//如果是空格或tab键可breakline
					|| c === 32 || c === 9
//					//如果下一个字符的类型为char，但font不一样（即metricAffect不一样），则可breakline
//					|| (ne !== null && ne.type === e.type && ne.style.font !== e.style.font)
					//如果当前字符是, . : ; 并且其左右不是数字，可breakline
					|| ((c === 44 || c === 46 || c === 58 || c === 59) && (i === s_idx || !D.Char.isDigit(e_arr.charCodeAt(i - 1))) && (ne === null || !D.Char.isDigit(nc)))
					//如果当前字符是 / - 并且右边不是数字，可breakline
					|| ((c === 45 || c === 47) && (ne === null || !D.Char.isDigit(nc)))
					//如果当前是中日韩，并且右边不是不可断行字符，可breakline
					|| c >= 0x2E80 && D.Char.isIdeographic(c, true) && ne !== null && D.Char.isIdeographic(nc, false)
					//
					) {
						first = false;
						bk_idx = i;
					}
				} else if (c === 32) {
					//如果当前是空格，则不能换行，并且把该空格设置为不可见。
					//空格不能出现在某一行的行首
					s_arr[i] = -1;
                    w_arr[i] = 0;
					bk_idx = i;
				} else {
					//$.log("bk:" + bk_idx)

					if (bk_idx >= idx || first) {
						//如果当前可换行
						//将i回退到需要换行位置
						i = bk_idx + 1;
					}
                    var cur_line_idx = l_at - para.line_start;
//					if (!first && unti) {
//						//$.log("%d,%d,%d",i,rg_idx,bk_idx)
//						//$.log("%s", bk_w)
//						var _dir = {
//							index : rg_idx - s_idx,
//							length : i - rg_idx,
//							width : 0
//						}
//						for (var d = rg_idx; d < i; d++) {
//							_dir.width += e_arr[d].width;
//						}
//						para.lines[cur_line_idx].unti_dir.push(_dir);
//					}
					para.lines[cur_line_idx].end_index = i - 1 - s_idx;
//                    prev_end_idx = i-1-s_idx;
					para.lines.push(new D._Line());
					bk_w = 0;
					rg_idx = i;
					left = 0;
//					width = this.inner_width;
					bk_w = 0;
					bk_idx = idx - 1;
					l_at++;
					first = false;
					/**
					 * 直接跳到下一次循环
					 */
					continue;
				}
				i++;
			}

//			if (unti) {
//				/**
//				 * 最后一段反向区域的宽度直接可以由bk_w得到
//				 */
//				para.lines[l_at - para.line_start].unti_dir.push({
//					index : rg_idx - s_idx,
//					length : end_index - rg_idx,
//					width : bk_w
//				});
//
//			}

			return {
				left : left + bk_w,
				line_at : l_at,
				end_index : end_index
			}
		},
        _calc_line_width : function(w_arr, s_arr, s, e) {
            var w = 0;
            for(var i=s;i<=e;i++) {
                if(s_arr[i]>=0) {
                    w += w_arr[i];
                }
            }
            return w;
        },
		_m_RTL : function(left, e_arr, w_arr, s_arr, idx, l_at, para, s_idx, e_idx) {
			//$.log("rtl unti:"+unti)
			var bk_idx = idx - 1, first = true, bk_w = 0, i = idx, line_at = l_at;
			var width = this.measure_width - left;
			var end_index = idx + this._getRTLLength(e_arr, idx, e_idx);
			//$.log(end_index)
			var rg_idx = idx;
			var pre_i = i, ew = 0, str = "";

			//$.log("%d",end_index)
			while (i < end_index) {
				var e = e_arr[i], ne = i + 1 < e_idx ? e_arr[i + 1] : null, c = e.charCodeAt(0);

				str += e;
				ew = this._measureStrElement(s_arr[i], str);

				if (bk_w + ew < width) {
					if (c < 0x600) {
						first = false;
						bk_idx = i;
					}
					if (c < 0x600 || ne === null || !D.Char.isRTL(ne.charCodeAt(0)) || s_arr[i+1] !== s_arr[i]) {
						if (c > 0) {
							for (var k = pre_i; k <= i; k++) {
								w_arr[k] = ew / (i - pre_i + 1);
							}
							//$.log("%s,%s,%s,%s",k,pre_i,i,ew)
						}
						bk_w += ew;
						str = "";
						pre_i = i + 1;
					}
					i++;
					//$.log(SNEditor.cur_page.ele_array[6].width)
				} else {

					//$.log(first)

					if (bk_idx > idx || first) {
						i = bk_idx + 1;
					}
                    var cur_line_idx = l_at - para.line_start;
					if (!first) {
						//$.log("%d,%d,%d",i,rg_idx,bk_idx)
						//$.log("%d,%d",para.lines.length,l_at)
						var _dir = {
							index : rg_idx - s_idx,
							length : i - rg_idx,
							width : 0
						}
						for (var d = rg_idx; d < i; d++) {
							_dir.width += w_arr[d];
						}
						para.lines[cur_line_idx].unti_dir.push(_dir);
					}
					para.lines[cur_line_idx].end_index = i - 1 - s_idx;
                    para.lines.push(new D._Line(-1,[],0));
					rg_idx = i;
					for (var k = pre_i; k <= i; k++) {
						w_arr[k] = ew / (i - pre_i + 1)
					}
					//$.log("%s,%s,%s,%s",k,pre_i,i,ew)
					str = "";
					pre_i = i;
					left = 0;
					bk_w = 0;
					bk_idx = idx - 1;
					l_at++;
					first = false;
					//$.log(SNEditor.cur_page.ele_array[6].width)
				}
			}
			//$.log("e?%s",SNEditor.cur_page.ele_array[6].width)
				para.lines[l_at - para.line_start].unti_dir.push({
					index : rg_idx - s_idx,
					length : end_index - rg_idx,
					width : bk_w
				});
			//$.log(bk_w);
			//$.log(left);
			return {
				left : left + bk_w,
				line_at : l_at,
				end_index : end_index
			}
		},
		_doMeasure : function(para) {
			var rtl = false, s_idx = para.index + 1, e_idx = s_idx + para.length;
			var l_at = para.line_start, e_arr = this.page.text, w_arr = this.page.width_array, s_arr = this.page.style_array;
			var left = 0;
			var i = s_idx, m_r = null;
			while (i < e_idx) {

				if (rtl) {
					m_r = this._m_RTL(left, e_arr, w_arr, s_arr, i, l_at, para, s_idx, e_idx);

				} else {
					m_r = this._m_LTR(left, e_arr, w_arr, s_arr, i, l_at, para, s_idx, e_idx);

				}
				l_at = m_r.line_at;
				left = m_r.left;
				i = m_r.end_index;
				rtl = !rtl;
			}
			para.lines[l_at - para.line_start].end_index = para.length - 1;

            for(var i=0;i<para.lines.length;i++) {
                var _w = this._calc_line_width(w_arr, s_arr, para.index + 1 + (i===0?0:para.lines[i-1].end_index), para.index + 1 + para.lines[i].end_index);
//                $.log("%s,%s",i,_w);
                para.lines[i].width = _w;
                if(this.page.max_line_width<_w) {
                    this.page.max_line_width = _w;
                }
            }


            return l_at - para.line_start + 1;
		}
	});
})(dLighter._Core, dLighter.$);
/**
 * User: xiaoge
 * At: 12-12-28 10:41
 * Email: abraham1@163.com
 * File : 对海量文本进行lex和measure时的调度逻辑
 */
(function(D, $) {
    D._Scheduler = function(lighter) {
        this.GAP = 1800; //由于lex的速度远远高于measure，设定当lex的行数超过measure的行数的1800行后就执行measure，否则连续执行lex
        this.BREAK_TIME = 280; //每次执行时间不应该超过280毫秒
        this.measure_step = 0;
        this.lex_step = 0;
        this.lighter = lighter;
        this.lexer = lighter.lexer;
        this.page = lighter.cur_page;
        this.render = lighter.render;
        this.s_delegate = $.createDelegate(this, this._scheduleHandler);
        this.s_timeout = null;
    }
    D._Scheduler.prototype = {
        /**
         * 这个函数名只是为了发泄下下～
         * 同时为了不和类名过于类似
         */
        fuck : function() {
            this.schedule();
        },
        stopFuck : function() {
            if(this.s_timeout!==null) {
                window.clearTimeout(this.s_timeout);
                this.s_timeout = null;
            }
        },
        schedule : function() {
            /**
             * 如果文本小于两千行，则直接进行lex和measure，否则使用异步的方法防止浏览器卡住。
             * 两千行只是大概的取值，假设每一行的文本不超过100个字符，
             * 因为代码很难出现一行代码有上千上万行字符的情况。
             * 如果故意出现这种情况，也只能等着浏览器卡住了。
             */
            if(this.page.para_info.length < this.GAP) {
                this._directSchedule();
            } else {
                this.stopFuck();
                this._syncSchedule();
            }
        },
        _directSchedule : function() {
            this.lighter.lexer.lex(this.page.text, this.page.style_delegate);
            this.page._measure();
            this.lighter.resize();
            this.render.paint();
        },
        _syncSchedule : function() {
            this.measure_step  = 0;
            this.lex_step = 0;
            this.lexer = this.lighter.lexer;
            this.page = this.lighter.cur_page;
            this.lexer.sync.init(this.page.para_info.length, this.page.text, this.page.style_delegate);
            this.page.sync.init(this.page.para_info.length);
            this._scheduleHandler();
        },
        _scheduleHandler : function() {
            if(this.page.sync.finished && this.lexer.sync.finished) {
//                $.log("both finished. return.");
                this._adjust();
                this.s_timeout = null;
                return;
            } else if(this.page.sync.finished) {
//                $.log("measure finished. do lexer");
                this.lexer.sync.go(this);
            } else if(this.lexer.sync.finished) {
//                $.log("lexer finished. do measure");
                this.page.sync.go(this);
                this._adjust();
            } else if(this.lex_step - this.measure_step >= this.GAP){
//                $.log("lexer has go ahead. do measure");
                this.page.sync.go(this);
                this._adjust();
            } else {
//                $.log("measure has come on. do lexer");
                this.lexer.sync.go(this);
            }
            this.s_timeout = window.setTimeout(this.s_delegate, 100);
        },
        _adjust : function() {
            this.lighter.resize();
            this.render.paint();
//            $.log("paint");
        }
    }
})(dLighter._Core, dLighter.$);/**
 * User: xiaoge
 * Date: 12-12-19 8:58
 * Email: abraham1@163.com
 * File: 滚动条处理
 */
(function(D, $) {
	D._Scroll = function(scroll_button, type){
		this.s_btn = scroll_button;
        this.type = type ? type : 'ver';// type: hor或者ver ，代表水平或垂直滚动条
        if(this.type !== 'ver' && this.type !== 'hor') {
            throw "unknow type of scroll bar at Scroll";
        }
		this.s_btn_lengh = 0;
		this.s_bar = scroll_button.parentElement;
		this.s_max = 0;
		this.s_value = 0;
		this.s_length = 0;
		this.s_list = [];
		this.wheel_handler = $.createDelegate(this, this._scrollwheel_handler);
		this._scroll_down_ = false;
		this.s_disable = false;
		this._initEvent();
	}

	D._Scroll.prototype = {
		setDisable : function(disable){
			if(disable===true){
				this.s_disable = true;
				this.s_btn.style.display = "none";
			} else {
				this.s_disable = false;
				this.s_btn.style.display = "block";
			}
		},
		setSize : function(breadth, length){
			this.setBreadth(breadth);
			this.setLength(length);
		},
        /*
         * 设置宽窄，对于水平滚动条，是设置高度，对于垂直滚动条是设置宽度
         */
		setBreadth : function(breadth){

            if(this.type==='ver') {
                this.s_bar.style.width = breadth + "px";
                this.s_btn.style.width = (breadth - 6) + "px";
                this.s_btn.style.left = "4px";
            } else {
                this.s_bar.style.height = breadth + "px";
                this.s_btn.style.height = (breadth - 6) + "px";
                this.s_btn.style.top = "4px";
            }
		},
        /*
         * 设置长度，对于水平滚动条，是设置宽度，对于垂直滚动条是设置高度
         */
		setLength : function(length){
            this.s_btn_lengh = Math.round(length / 5);
            if(this.s_btn_lengh<5) {
                this.s_btn_lengh = 5;
            } else if(this.s_btn_lengh>200) {
                this.s_btn_lengh = 200;
            }
            this.s_length = length - this.s_btn_lengh;
            this.s_max = length;
            if(this.type === 'ver') {
                this.s_bar.style.height = length + 'px';
                this.s_btn.style.height = this.s_btn_lengh + 'px';
            } else {
                this.s_bar.style.width = length + 'px';
                this.s_btn.style.width = this.s_btn_lengh + 'px';
            }

		},
		show : function(visible){
			this.s_bar.style.display = "block";
		},
		hide : function(){
			this.s_bar.style.display = "none";
		},
		addListener : function(listener){
			for(var i=0;i<arguments.length;i++){
				this.s_list.push(arguments[i]);
			}
		},
		attachWheelEvent : function(element){
            if(this.type === 'hor')
                return;
			for(var i=0;i<arguments.length;i++){
                $.log(arguments[i])
				$.addWheelEvent(arguments[i], this.wheel_handler);
			}
		},
		_initEvent : function(){
			if ( typeof this.s_bar.setCapture === 'function') {
			
				$.addEvent(this.s_bar, 'mousedown', $.createDelegate(this, this._scrolldown_handler));
				$.addEvent(this.s_bar, 'mouseup', $.createDelegate(this, this._scrollup_handler));
				$.addEvent(this.s_bar, 'mousemove', $.createDelegate(this, this._scrollmove_handler));
			
			} else {
				this.__scroll_move_handler = $.createDelegate(this, this._chrome_scrollmove_handler);
				this.__scroll_up_handler = $.createDelegate(this, this._chrome_scrollup_handler);
			
				$.addEvent(this.s_bar, 'mousedown', $.createDelegate(this, this._chrome_scrollclick_handler));
				$.addEvent(this.s_btn, 'mousedown', $.createDelegate(this, this._chrome_scrolldown_handler));
			
			}
		},
		setScrollMax : function(value){
			this.s_max = value;
		},
		scrollDelta : function(value){
			this.scroll(this.s_value + value);
		},
		scroll : function(value){
			if(typeof value !== 'number'){
				return this.s_value;
			}
			this.s_value = value < 0 ? 0 : (value > this.s_max ? this.s_max : value);
			this.s_btn.style.top = Math.round(this.s_value/this.s_max*this.s_length) + "px";
//            for(var i=0;i<this.s_list.length;i++){
//                this.s_list[i].onScrollValue(this.type, this.s_value);
//            }
		},
		_scroll : function(top){
			//$.log("%s,%s",top, this.s_length)
			top = top < 0 ? 0 : (top>this.s_length ? this.s_length : top);
			this.s_value = Math.round(top / this.s_length * this.s_max);
			if(this.type==='ver') {
                this.s_btn.style.top = top + "px";
            } else {
                this.s_btn.style.left = top + "px";
            }
			for(var i=0;i<this.s_list.length;i++){
                this.s_list[i].onScroll(this.type, this.s_value);
			}
		},
		scrollToMax : function() {
			this.scroll(this.s_max);
		},
		_scrolldown_handler : function(e){
			if(this.s_disable === false && e.button===0){
				if(e.target === this.s_btn){
					this._deal_scrolldown(e, false);
					this.s_bar.setCapture(true);
				} else {
					this._deal_scrollclick(e, false);
				}
				
			}
		},
		_chrome_scrolldown_handler : function(e){
			if(this.s_disable === false && e.button===0){
				this._deal_scrolldown(e, true);
				
				$.addEvent(window, 'mousemove', this.__scroll_move_handler);
				$.addEvent(window, 'mouseup', this.__scroll_up_handler);
			}
		},
		_chrome_scrollclick_handler : function(e){
			if(this.s_disable === false)
				this._deal_scrollclick(e, true);
		},
		_deal_scrollclick : function(e, is_chrome){
			var y = (this._getScrollOffset(e, is_chrome) > (this.type==='ver' ? this.s_btn.offsetTop : this.s_btn.offsetLeft)) ? 1 : -1;
            //$.log(y);
            this._scroll((this.type ==='ver' ? this.s_btn.offsetTop : this.s_btn.offsetLeft) + y * 50 );
			$.stopEvent(e);
		},
		_deal_scrolldown : function(e, is_chrome){
            var ot = is_chrome ? 0 : (this.type === 'ver' ? this.s_btn.offsetTop : this.s_btn.offsetLeft);
			this._scroll_down_ = true;
			this._pre_scroll_y = this._getScrollOffset(e, is_chrome) + ot;
			this._pre_scroll_top = ot;
			$.stopEvent(e);
		},
		_chrome_scrollmove_handler : function(e){
			if(this.s_disable === false && e.button===0){
				this._deal_scrollmove(e, true);
			}
		},
		_scrollmove_handler : function(e){
		
			if(e.button===0 && this._scroll_down_){
					//$.log('m')
				this._deal_scrollmove(e, false);
			}
		},
		_deal_scrollmove : function(e, is_chrome){
			//$.log('m')
			//$.log(this._pre_scroll_top + this._getScrollY(e, is_chrome) - this._pre_scroll_y)
			this._scroll(this._pre_scroll_top + this._getScrollOffset(e, is_chrome) - this._pre_scroll_y);
			$.stopEvent(e);
		},

		_chrome_scrollup_handler : function(e){
			if(e.button===0 && this._scroll_down_){
				this._scroll_down_ = false;
				$.delEvent(window, 'mousemove', this.__scroll_move_handler);
				$.delEvent(window, 'mouseup', this.__scroll_up_handler);
				$.stopEvent(e);
			}
		},
		_scrollup_handler : function(e){
			if(e.button===0 && this._scroll_down_){
				this._scroll_down_ = false;
				this.s_bar.releaseCapture(true);
			}
			
		},
		
		_scrollwheel_handler : function(e){
//			$.log('wheel')

			if(this.s_disable || e.ctrlKey || e.metaKey)
				return;
			var	deltaX = NaN, deltaY = NaN;
			if(typeof e.wheelDeltaX !== 'undefined') {
				deltaX = e.wheelDeltaX;
                deltaY = e.wheelDeltaY;
            } else if(typeof e.wheelDelta !== 'undefined') {
                deltaY = e.wheelDelta / 6;
            } else if(e.detail) {
                deltaY = -e.detail * 10;
            }
            var delta = this.type === 'hor' ? deltaX : deltaY;
            if(delta === NaN) {
                return;
            }else if(delta>0 && this.s_value===0) {
                return;
            } else if(delta<=0 && this.s_value===this.s_max) {
                return;
            }
            $.stopEvent(e);

            this._scroll(this.s_btn.offsetTop - delta);
			
		},
		_getScrollOffset : function(e) {
			var y = 0, x = 0;
//			if (is_chrome) {
//				var off = $.getOffset(this.s_bar);
//				y = e.y - off.top  + document.body.scrollTop;
//			} else
            if ( typeof e.offsetX !== 'undefined') {
				y = e.offsetY;
                x = e.offsetX;
			} else if ( typeof e.x !== 'undefined') {
				y = e.y
                x = e.x;
			} else if ( typeof e.layerX !== 'undefined') {
				y = e.layerY;
                x = e.layerX;
			} else {
				throw "no y in event(_getScrollOffset)";
			}
			//$.log('y:%s',y);
            //$.log("%s,%s",y,x);
			return (this.type === 'ver' ? y : x);
		}
	}
	
})(dLighter._Core, dLighter.$);
/**
 * User: xiaoge
 * At: 12-12-20 11:20
 * Email: abraham1@163.com
 */
(function(D, $) {
    var _Theme = function(theme, font_name, font_size) {
        var _g = theme.global ? theme.global : {};
        this.font_size = font_size ? font_size : (_g.font_size ? _g.font_size : D.DEFAULT_FONTSIZE);
        this.font_name = font_name ? font_name : (_g.font_name ? _g.font_name : D.DEFAULT_FONTNAME);
        this.background = _g.background ? _g.background : 'white';
        this.color = _g.color ? _g.color : 'black';
        this.caret_color = _g.caret_color ? _g.caret_color : this.color;
        this.bold = _g.bold ? true : false;
        this.italic = _g.italic ? true : false;
        this.scroll_breadth = _g.scroll_breadth ? _g.scroll_breadth : 14;
        var _u = theme.gutter ? theme.gutter : {};
        this.gutter_number_color = _u.number_color ? _u.number_color : this.color;
        this.gutter_line_color = _u.line_color ? _u.line_color : this.background;
        var _s = theme.selected ? theme.selected : {};
        this.selected_background = _s.background ? _s.background : 'rgba(125,125,125,0.3)';
        var _h = theme.highlight ? theme.highlight : {};
        this.highlight_background = _h.background ? _h.background : 'rgba(232,232,255,1)';


        this.font = (this.bold ? "bold " : "") + (this.italic ? "italic " : "") + this.font_size + "px " + this.font_name;

        var _lang = theme.language ? theme.language : {};
        var _code = theme.code ? theme.code : {};

        this.code_style = new _LangStyle({
            font : this.font,
            color : this.color
        });
        this.lang_style_hash = {};

        this._initCode(_code);
        this._initLang(_lang);

    };
    _Theme.prototype = {
        _initCode : function(_code) {
            for(var s in _code) {
                var t = _code[s];
                var font = (t.bold?"bold ":"") + (t.italic?"italic ":"")+(t.font_size ? t.font_size : this.font_size)+"px "+(t.font_name? t.font_name:this.font_name);
                var color = t.color ? t.color : this.color;
                this.code_style.addStyle(s, {
                    font : font,
                    color: color
                });
            }
        },
        _initLang : function(_lang) {

            for(var ln in _lang) {
                var _l = _lang[ln];
                var _ls = this.code_style.copy();
                for(var s in _l) {
                    var t = _l[s];
                    var font = (t.bold?"bold ":"") + (t.italic?"italic ":"")+(t.font_size ? t.font_size : this.font_size)+"px "+(t.font_name? t.font_name:this.font_name);
                    var color = t.color ? t.color : this.color;
                    _ls.addStyle(s, {
                        font : font,
                        color: color
                    });
                }

                this._addLangStyle(ln, _ls);
            }
        },

        _addLangStyle : function(name, lang_style) {
            var ns = name.split(",");
            for(var i=0;i<ns.length;i++) {
                this.lang_style_hash[ns[i].trim()] = lang_style;
            }
        },
        getLanguageStyle : function(name) {
            var ls = this.lang_style_hash[name];
            if(ls == null) {
                return this.code_style;
            } else {
                return ls;
            }
        }
    };

    var _LangStyle = function(plain_style) {
        this.style_hash = plain_style ? {
            plain : 0
        } : {};
        this.style_array = plain_style ? [plain_style] : [];
    };
    _LangStyle.prototype = {
        getStyle : function(index) {
            return this.style_array[index];
        },
        addStyle : function(name, style) {
            var idx = this.style_hash[name];
            if(idx!=null) {
                this.style_array[idx] = style;
            } else {
                idx = this.style_array.length;
                this.style_array.push(style);
                this.style_hash[name] = idx;
            }
        },
        getStyleIndex : function(style_name) {
            var i = this.style_hash[style_name];
            return i ? i : 0;
        },
        copy : function() {
            var rtn = new _LangStyle();
            rtn.style_array.length = this.style_array.length;
            for(var s in this.style_hash) {
                var i = this.style_hash[s];
                rtn.style_hash[s] = i;
                rtn.style_array[i] = this.style_array[i];
            }
            return rtn;
        }
    };
    $.extend(D, {
        _theme_list : {},
        _theme_hash : {},
        DEFAULT_FONTSIZE : 16,
        DEFAULT_FONTNAME : "consolas",
        register : function(theme) {
            this._theme_list[theme.name] = theme;
            var key = theme.name + (theme.font_name?theme.font_name: D.DEFAULT_FONTNAME) + (theme.font_size?theme.font_size: D.DEFAULT_FONTSIZE);
            this._theme_hash[key] = new _Theme(theme);
        },
        get : function(name, config) {
            config = config ? config : {};
            var _t = this._theme_list[name];
            if(!_t) {
                _t = this._theme_list['plain'];
            }
            var key = _t.name + (config.font_name?config.font_name:(_t.font_name?_t.font_name: D.DEFAULT_FONTNAME)) + (config.font_size?config.font_size:(_t.font_size?_t.font_size: D.DEFAULT_FONTSIZE));
            var theme = this._theme_hash[key];
            if(!theme) {
                theme = new _Theme(_t, config.font_name, config.font_size);
                this._theme_hash[key] = theme;
            }
            return theme;

        }
    });

    D.register({
        name : 'plain',
        global : {
            background : 'white',
            color : 'black'
        },
        selected : {
            background : 'rgba(160,160,160,0.5)'
        },
        highlight : {
            background : 'rgba(210,210,210,0.1)'
        }
    });
})(dLighter._Theme, dLighter.$);(function(D, $) {

	$.extend(D._Lighter.prototype, {
        _getEventPoint : function(e) {
            var p = $.getEventPoint(e);
            p.x += this.scroll_left;
            p.y += this.scroll_top;
            return p;
        },
		_focus_handler : function(e) {
			this.focus();
		},
		_blur_handler : function(e) {
		    this.blur();
		},
		_deal_leftmouse_down : function(e, point) {
			if (this.__mouse_down_time__ === 1 && $.getPTPRange(this.__pre_point__, point) < 10) {
				this.__mouse_down_time__++;
				if (this.__mdt_timeout__ !== null) {
					window.clearTimeout(this.__mdt_timeout__);
					this.__mdt_timeout__ = null;
				}
				this.__mdt_timeout__ = window.setTimeout(this.__mdt_delegate__, 450);
				this._dblclick_handler(point);
			} else if (this.__mouse_down_time__ === 2 && $.getPTPRange(this.__pre_point__, point) < 10) {
				this.__mouse_down_time__ = 0;
				if (this.__mdt_timeout__ !== null) {
					window.clearTimeout(this.__mdt_timeout__);
					this.__mdt_timeout__ = null;
				}
				this._tplclick_handler(point);
			} else {
				if (!e.ctrlKey && !e.shiftKey) {
					this.__mouse_down_time__++;
					this.__mdt_timeout__ = window.setTimeout(this.__mdt_delegate__, 450);
				}
				var nc = this.cur_page._getCaret_xy(point.x, point.y);
				if (e.shiftKey) {
					this._shift_select(nc.index);
				} else {
                    this._setCaret(nc);
					if (this.cur_page.select_mode) {
						this.cur_page.select(null);
						this.render.paint();
					}
				}

			}
			this.__pre_pos__ = this.caret_pos;
			this.__pre_point__ = point;
			this.__down_pos__ = this.caret_pos;
		},
		_leftmousedown_handler : function(e) {
			this.__left_mouse_down__ = true;
			var p = this._getEventPoint(e);
			this._deal_leftmouse_down(e, p);

        },
		_mousedown_handler : function(e) {
			if (e.button === 0) {
				this._leftmousedown_handler(e);
			}
            /**
             * 非常重要的一行代码，防止点击canvas后caret失去焦点
             */
            e.preventDefault();

            if(typeof this.canvas.setCapture === 'function') {
                this.canvas.setCapture(true);
            }
		},
		_leftmouseup_handler : function(e, is_chrome) {
			this.__left_mouse_down__ = false;
		},
		_mouseup_handler : function(e, is_chrome) {
			//$.log('mup');
			if (e.button === 0) {
				this._leftmouseup_handler(e, is_chrome);
			}
            if(typeof this.canvas.setCapture === 'function') {
                this.canvas.setCapture(false);
            }
		},
		_deal_leftmouse_move : function(pos) {
            outif:
			if (pos.para !== this.__pre_pos__.para || pos.para_at !== this.__pre_pos__.para_at) {
				this._setCaret(pos);
				this.focus();
				var from = this.__down_pos__, to = pos;
				if (from.para === to.para && from.para_at === to.para_at && this.cur_page.select_mode) {
					this.cur_page.select(null);
					break outif;
				} else if (from.para > to.para || (from.para === to.para && from.para_at > to.para_at)) {
					from = pos;
					to = this.__down_pos__;

				}
				//$.log("select from %d,%d,line %d to %d,%d,line %d",from.para,from.para_at,from.line,to.para,to.para_at,to.line);
				this.cur_page.select(from, to);

			}
			this.render.paint();
			this.__pre_pos__ = pos;

		},
		_mousemove_handler : function(e) {
			if (this.__left_mouse_down__) {
				var p = this._getEventPoint(e);
				this._deal_leftmouse_move(this.cur_page._getCaret_xy(p.x, p.y));
			}

		},
		_chrome_mousemove_handler : function(e) {
			this._mousemove_handler(e, true);

		},
		_chrome_mouseup_handler : function(e) {

			this._mouseup_handler(e, true);

			$.delEvent(window, 'mousemove', this.__cmv_handler);
			$.delEvent(window, 'mouseup', this.__cmu_handler);

		},
		_chrome_mousedown_handler : function(e) {

			this._mousedown_handler(e);
			$.addEvent(window, 'mousemove', this.__cmv_handler);
			$.addEvent(window, 'mouseup', this.__cmu_handler);
		},
//
//		_copy_handler : function(e) {
//        	if (this.cur_page.select_mode) {
//                this.clipboard.setText(this.cur_page.copySelect(), e);
//			}
//			if (e != null)
//				$.stopEvent(e);
//		},
//
//		_cut_handler : function(e) {
//			this._copy_handler(e);
//		},

		_keydown_handler : function(e) {
			if (this._shortkey_handler(e)) {
				$.stopEvent(e);
			}
		},

		_dblclick_handler : function(p) {
			var ec = this.cur_page._getElementCaret_xy(p.x, p.y, true), e_arr = this.cur_page.text;

//			var sl = p.y <= ec.bottom ? 0 : Math.ceil((p.y - ec.bottom) / this.line_height),
//                sw = sl > 0 ? p.x : Math.abs(p.x - ec.left), sc = Math.floor(sw / this.render.SPACE_WIDTH);
//
//			if (sl === 0 && sc < 5 && e_arr[ec.index].type !== Text._Element.Type.NEWLINE) {
				var range = D._WordSeg.getRange(e_arr, ec.index);
            //$.log(range);
            this._setCaret(this.cur_page.selectByIndex(range.from, range.to));
				this.render.paint();
//			}
		},
		_tplclick_handler : function(p) {
			var para = this.cur_page.getParaIndex_xy(p.x, p.y);
			this._setCaret(this.cur_page.selectParaByIndex(para));
			this.render.paint();
		},

		initEvent : function() {
			this.initShortKey();

			this.__left_mouse_down__ = false;
			this.__pre_pos__ = null;

			if ( typeof this.canvas.setCapture === 'function') {

				$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._mousedown_handler));
				$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._mouseup_handler));
				$.addEvent(this.canvas, 'mousemove', $.createDelegate(this, this._mousemove_handler));

			} else {
				this.__cmv_handler = $.createDelegate(this, this._chrome_mousemove_handler);
				this.__cmu_handler = $.createDelegate(this, this._chrome_mouseup_handler);
				$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._chrome_mousedown_handler));
			}

			
			this.__mouse_down_time__ = 0;
			this.__mdt_timeout__ = null;
			this.__mdt_delegate__ = $.createDelegate(this, function() {
				this.__mouse_down_time__ = 0;
				this.__mdt_timeout__ = null;
			});

			$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._focus_handler));
            $.addEvent(this.caret, "keydown", $.createDelegate(this, this._keydown_handler));
            $.addEvent(this.caret, 'blur', $.createDelegate(this, this._blur_handler));

		}
		
	});
})(dLighter._Core, dLighter.$);(function(D, $){
	$.extend(D._Lighter.prototype, {
		initCaret : function(){
            /*
             * caret是一个<input type=text/>，如果里面的内容为空的话，在firefox下面ctrl+c快捷键无法触发copy事件.
             */
            this.caret.value = "@白羊座小葛 I love Daisy.南京大学软件学院";
			this.caret_interval = null;
			this.caret_timeout = null;
			this.caret_show = false;
			this.caret_flashing = false;
			this.caret_data = null;
			this.caret_flash_delegate = $.createDelegate(this, this._caretFlash);
			this.caret_delegate = $.createDelegate(this, this._resetCaret);


//            this._s_x = 0;
//            this._s_y = 0;
//            var me = this;
//            this.caret.onfocus = function(e){
//                $.log("%s,%s",me._s_x, me._s_y);
//                window.scrollTo(me._s_x, me._s_y);
//                $.stopEvent(e);
//            };
            this.caret.onkeydown = function(e) {
                /**
                 * 包括f1到f12,复制,页面缩放在内的系统快捷键会直接返回，以响应系统
                 * ctrl(meta) + 【c r = - 0】
                 * 其它操作包括输入字符，剪切和粘贴等都会被阻止
                 */
                if((e.ctrlKey || e.metaKey) && /[cr=\-0\ ]/.test(String.fromCharCode(e.keyCode).toLowerCase())){
                    return;
                } else if(e.keyCode>=112 && e.keyCode<=123) {
                    return;
                }
                $.stopEvent(e);
            };

		 
		},
		_caretFocus : function(){
			//$.log('focus')
//            this._s_x = window.scrollX;
//            this._s_y = window.scrollY;
//            $.log("%s,%s",this._s_x, this._s_y);

            this.caret.focus();
            this.caret.select();
			/*
			 * focus是在mouseup事件里触发的，而caret_timeout是在mousedown中设置的，
			 * 可能出现执行到这里的代码时，_setCaret已经执行了，但caret_timeout还没有执行，(尽管可能性很小，因为caret_timeout设置的时间是0)
			 * 如果是那样就不需要显示光标和开始闪烁
			 */
			if(this.caret_timeout===null){
				//this._caretShow();
				this._caretBeginFlash();
			}
		},
		_caretBlur : function(){
//			$.log('cc blur')
			this._caretStopFlash();
		},
		_caretBeginFlash : function(){
			this._caretShow();
			if(this.caret_flashing === false){
				//$.log('begin')
				this.caret_flashing = true;
				this.caret_interval = window.setTimeout(this.caret_flash_delegate, 100);
			}
		},
		_caretStopFlash : function(){
            this._caretHide();
			if(this.caret_flashing === true){
				//$.log('stop')
				this.caret_flashing = false;
				window.clearTimeout(this.caret_interval);
				this.caret_interval = null;
			}
		},
		_caretShow : function(){
			// $.log("show")
            if(!this.caret_show) {
			    this.render._showCaret(this.caret_left,this.caret_top, 1, this.caret_height, this.theme.caret_color);
                this.caret_show = true;
            }
		},
		_caretHide : function(){
			//$.log("hide")
            //this.render._showCaret(this.caret_left,this.caret_top, 1, this.caret_height, "black");
            if(this.caret_show) {
                this.render._hideCaret(this.caret_left-1,this.caret_top-1, this.caret_data);
                this.caret_show = false;
            }
		},
		_caretFlash : function(){
			//$.log(this.caret_show)
			if(!this.caret_show){
				this._caretShow();
			} else {
				this._caretHide();
			}
			this.caret_interval = window.setTimeout(this.caret_flash_delegate, 550);
		},
		
		_setCaret : function(caret) {
			if(this.caret_data!==null){
                this._caretStopFlash();
			}

            this.caret_pos = caret;
//
//                var st1 = this.caret_pos.top ,
//                    st2 = st1 + this.line_height - p.canvas_height;
//                if(st2 > p.scroll_top || st1 < p.scroll_top) {
//                    p.scroll_top = (st2>p.scroll_top?st2:st1)+10;
//                    p.scroll_ver.scroll(p.scroll_top);
//                    p.drawer.paint();
//                    p.texter.paint();
//                    /**
//                     * todo hor scroll
//                     */
//                }

			/**
			 * 把reset caret的操作延迟到当前函数之后。目的是为了让render.paint函数执行之后再resetCaret 
			 * 为了防止连续的两次timeout，先删除.
			 */
			if(this.caret_timeout!==null){
				window.clearTimeout(this.caret_timeout);
				this.caret_timeout = null;
			}
			this.caret_timeout = window.setTimeout(this.caret_delegate, 0);
		},
		_resetCaret : function() {
			this.caret_left = Math.round(this.caret_pos.left- this.scroll_left);
			this.caret_top = Math.round(this.caret_pos.top - this.scroll_top);
            this.caret.style.left = this.caret_left + "px";
            this.caret_data = this.render.ctx.getImageData(this.caret_left-1, this.caret_top-1, 3, this.caret_height+2);
			if(this.focused){
				this._caretBeginFlash();
			}
			this.caret_timeout = null;
		},
        moveCaret : function(dir) {
            var cp = this.caret_pos, p_idx = cp.para, p_at = cp.para_at, new_cp = cp;
            switch(dir) {
                case 'left':
                    if (p_at >= 0) {
                        p_at--;
                    } else if (p_idx > 0) {
                        p_idx--;
                        p_at = null;
                    }
                    new_cp = this.cur_page._getCaret_p(p_idx, p_at);
                    break;
                case 'right':
                    if (p_at < this.cur_page.para_info[p_idx].length - 1) {
                        p_at++;
                    } else if (p_idx < this.cur_page.para_info.length - 1) {
                        p_idx++;
                        p_at = -1;
                    }
                    new_cp = this.cur_page._getCaret_p(p_idx, p_at);
                    //$.log(new_cp);
                    break;
                case 'up':
                    new_cp = this.cur_page._getCaret_xy(cp.left, cp.top - this.line_height);
                    break;
                case 'down':
                    new_cp = this.cur_page._getCaret_xy(cp.left, cp.top + this.line_height);
                    break;
            }
            this.cur_page.select(null);
            this._caretStopFlash();
            this.render.paint();
            this._setCaret(new_cp);
        }
	});
	
})(dLighter._Core, dLighter.$);
(function(D, $) {

	$.extend(D._Lighter.prototype, {
		initShortKey : function() {
			this.SHORTKEY_TABLE = {
				'ctrl-a' : this._ctrl_a_handler,
//                'ctrl-c' : this._ctrl_c_handler,
//                'ctrl-x' : this._ctrl_x_handler,
				'ctrl-up' : this._ctrl_up_handler,
				'ctrl-down' : this._ctrl_down_handler,
				'ctrl-left' : this._ctrl_left_handler,
				'ctrl-right' : this._ctrl_right_handler,
				'left' : this._left_handler,
				'right' : this._right_handler,
				'up' : this._up_handler,
				'down' : this._down_handler,
				'shift-left' : this._shift_left_handler,
				'shift-right' : this._shift_right_handler,
				'shift-up' : this._shift_up_handler,
				'shift-down' : this._shift_down_handler,
				'ctrl-shift-left' : this._ctrl_shift_left_handler,
				'ctrl-shift-right' : this._ctrl_shift_right_handler,
				'ctrl-home' : this._ctrl_home_handler,
				'ctrl-end' : this._ctrl_end_handler,
				'shift-home' : this._shift_home_handler,
				'shift-end' : this._shift_end_handler,
				'ctrl-shift-home' : this._ctrl_shift_home_handler,
				'ctrl-shift-end' : this._ctrl_shift_end_handler,
				'home' : this._home_handler,
				'end' : this._end_handler,
				'pageup' : this._pageup_handler,
				'pagedown' : this._pagedown_handler
			};
			this.KEY_TABLE = {
				33 : 'pageup',
				34 : 'pagedown',
				36 : 'home',
				35 : 'end',
				37 : 'left',
				39 : 'right',
				38 : 'up',
				40 : 'down'
			}
		},
//		_ctrl_x_handler: function(){
//            if($.ie||$.firefox||$.opera){
//                this._copy_handler(null);
//                return true;
//            }
//		},
//		_ctrl_c_handler : function(){
//			if($.ie||$.firefox||$.opera){
//				this._copy_handler(null);
//				return true;
//			}
//		},

		_pageup_handler : function() {
			this.container.scrollTop -= 15 * this.line_height * this.render.scale;
		},
		_pagedown_handler : function() {
			this.container.scrollTop += 15 * this.line_height * this.render.scale;
		},

		_shift_home_handler : function() {
			if(this.caret_pos.para_at < 0)
				return;
			var p = this.cur_page.para_info[this.caret_pos.para], l_at = this.caret_pos.line - p.line_start,
				p_at = l_at===0?-1:p.lines[l_at-1].end_index;
			this._shift_select(p.index + p_at + 1, true);
		},
		_shift_end_handler : function() {
			var p = this.cur_page.para_info[this.caret_pos.para];
			if(this.caret_pos.para_at === p.length - 1)
				return;
			this._shift_select(p.index+p.lines[this.caret_pos.line - p.line_start].end_index+1);
		},
		_ctrl_shift_home_handler : function() {
			if(this.caret_pos.index < 0)
				return;
			this._shift_select(-1);
		},
		_ctrl_shift_end_handler : function() {
			if(this.caret_pos.index === this.cur_page.text.length - 1)
				return;
			this._shift_select(this.cur_page.text.length - 1);
		},
		_home_handler : function() {
			
			this._setCaret(this.cur_page.getCaretLineStart(this.caret_pos));
			this.cur_page.select(null);
			this.render.paint();
		},
		_end_handler : function() {
		
			this._setCaret(this.cur_page.getCaretLineEnd(this.caret_pos));
			this.cur_page.select(null);
			this.render.paint();
		},
		_ctrl_home_handler : function() {
			this._setCaret(this.cur_page.getCaretByIndex(-1));
			this.cur_page.select(null);
			this.render.paint();
		},
		_ctrl_end_handler : function() {
			this._setCaret(this.cur_page.getCaretByIndex(this.cur_page.text.length - 1));
			this.cur_page.select(null);
			this.render.paint();
		},

		_ctrl_a_handler : function() {
		 
			this._setCaret(this.cur_page.selectAll());
			this.render.paint();
		},
		_shift_left_handler : function() {
			if(this.caret_pos.index < 0)
				return;
			this._shift_select(this.caret_pos.index - 1);
		},
	
		_shift_select : function(idx, line_start) {
			var fc = this.caret_pos, fi = fc.index, p = this.cur_page;
			if(p.select_mode) {
				var sr = p.select_range;
				fc = (sr.from.index === fi ? sr.to : sr.from);
				fi = fc.index;
			}
			var n_c = null;
			if(line_start){
				n_c = p.getBeforeCaretByIndex(idx+1);
			} else {
				n_c = p.getCaretByIndex(idx);
			}
			if(idx === fi) {
				p.select(null);
			} else if(idx < fi) {
				p.select(n_c, fc);
			} else {
				p.select(fc, n_c);
			}
			this._setCaret(n_c);
			this.render.paint();
		},
		_shift_up_handler : function() {
		    this._shift_select(this.cur_page._getCaret_xy(this.caret_pos.left, this.caret_pos.top - this.line_height).index);
		},
		_shift_down_handler : function() {
//			var pi = this.cur_page.para_info, lp = pi[pi.length - 1];
//			if(this.caret_pos.top + this.line_height < (lp.line_start + lp.line_cross) * this.line_height) {
				this._shift_select(this.cur_page._getCaret_xy(this.caret_pos.left, this.caret_pos.top + this.line_height).index);
//			}

		},
		_shift_right_handler : function() {
			if(this.caret_pos.index >= this.cur_page.text.length - 1)
				return;
			this._shift_select(this.caret_pos.index + 1);
		},
		_ctrl_shift_left_handler : function() {
			if(this.caret_pos.index < 0)
				return;
			this._shift_select(D._WordSeg.getLeft(this.cur_page.text, this.caret_pos.index));
		},
		_ctrl_shift_right_handler : function() {
			if(this.caret_pos.index >= this.cur_page.text.length - 1)
				return;
			this._shift_select(D._WordSeg.getRight(this.cur_page.text, this.caret_pos.index + 1));
		},
		_ctrl_left_handler : function() {
			var idx = this.caret_pos.index;
			if(idx >= 0) {
				this._setCaret(this.cur_page.getCaretByIndex(D._WordSeg.getLeft(this.cur_page.text, idx)));
			}
			this.cur_page.select(null);
			this.render.paint();
		},
		_ctrl_right_handler : function() {
			var idx = this.caret_pos.index + 1, err = this.cur_page.text;
			if(idx < err.length) {
				this._setCaret(this.cur_page.getCaretByIndex(D._WordSeg.getRight(err, idx)));
			}
			this.cur_page.select(null);
			this.render.paint();
		},
		_ctrl_up_handler : function() {
			this.container.scrollTop -= this.line_height * this.render.scale;
		},
		_ctrl_down_handler : function() {
			this.container.scrollTop += this.line_height * this.render.scale;
		},
		_left_handler : function() {
			//向左按键
		    this.moveCaret("left");
		},
		_right_handler : function() {
			//向右s
			this.moveCaret("right");
		},
		_up_handler : function() {
			//向上
			this.moveCaret("up");
		},
		_down_handler : function() {
			//向下
			this.moveCaret("down");
		},
		_shortkey_handler : function(e) {
			var c = e.keyCode;
		    var ctrlKey = $.macOS ? e.metaKey : e.ctrlKey;
			var c_key = (ctrlKey ? "ctrl-" : "") + (e.shiftKey ? "shift-" : "") + (this.KEY_TABLE[c] == null ? String.fromCharCode(c).toLowerCase() : this.KEY_TABLE[c]), k_func = this.SHORTKEY_TABLE[c_key];
			if( typeof k_func === 'function') {
				//$.log(c_key);
				k_func.call(this);
				return true;
			}
			return false;
		}
	});
})(dLighter._Core, dLighter.$);
(function(D, $) {

	D._WordSeg = {
		TYPE : {
			DIG_WORD : 0,
			ASCII : 1,
			UNICODE : 2,
			OTHER : 3,
			SPACE : 4,
			ARAB : 5,
            NEWLINE : 6
		},
		_getCharType : function(c) {
			if(c === 32 || c === 9)
				return this.TYPE.SPACE;
            else if(c===10) {
                return this.TYPE.NEWLINE;
            }
			else if((c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57))
				return this.TYPE.DIG_WORD;
			else if(c>=0x600 && c<=0x6ff)
				return this.TYPE.ARAB;
			else if(c > 256)
				return this.TYPE.UNICODE;
			else
				return this.TYPE.ASCII;
		},
		getRange : function(arr, idx) {
			var ct = this._getCharType(arr.charCodeAt(idx));
				return {
					from : this._getLeft(arr, idx, ct),
					to : this._getRight(arr, idx, ct)
				}
		},
		getRight : function(arr, idx) {
			var ct = this._getCharType(arr.charCodeAt(idx)), r = idx;
			if(ct !== this.TYPE.SPACE) {
			    r = this._getRight(arr, idx, ct);
			}
			return this._getRight(arr, r, this.TYPE.SPACE);
		},
		getLeft : function(arr, idx) {
			var ct = this._getCharType(arr.charCodeAt(idx));
			var l =  this._getLeft(arr, idx, ct);
			if(ct === this.TYPE.SPACE && l>=0) {
				return this._getLeft(arr, l, this._getCharType(arr.charCodeAt(l)));
			} else
				return l;
		},
		/**
		 *
		 * @param {Object} arr
		 * @param {Object} idx
		 * @param {Object} type
		 * 根据chrome的规则，向右选择会选择一致类型的单词
		 */
		_getRight : function(arr, idx, type) {
			if(type === this.TYPE.UNICODE)
				return idx;
			for(var i = idx + 1; i < arr.length; i++) {
				if(this._getCharType(arr.charCodeAt(i)) !== type) {
					return i - 1;
				}
			}
			if(i === arr.length)
				return i - 1;
			else
				return idx;
		},
		_getLeft : function(arr, idx, type) {
			var i = idx - 1;
			if(type === this.TYPE.UNICODE)
				return i;
				
			for(; i >= 0; i--) {
				if(this._getCharType(arr.charCodeAt(i)) !== type) {
					break;
				}
			}
			return i;
		}
	}
})(dLighter._Core, dLighter.$);
/**
 * User: xiaoge
 * At: 12-12-21 10:58
 * Email: abraham1@163.com
 */
(function(D, $) {
    $.extend(D, {
       _str_to_arr : function(strs, arrs) {
            for(var j = 0; j < strs.length; j++) {
                var str = strs[j], arr = arrs[j], t = str.charCodeAt(0), len = str.length, c = 0;
                for(var i = 1; i < len; i++) {
                    if(t === 0)
                        arr[i - 1] = str.charCodeAt(i) - 1;
                    else {
                        var n = str.charCodeAt(i) - 1, v = str.charCodeAt(i + 1) - 1;
                        for(var k = 0; k < n; k++) {
                            arr[c] = v;
                            c++;
                        }
                        i++;
                    }
                }
            }
        },
        _lexer_hash : {},
        register : function(lexer) {
            var ns = lexer.name.split(",");
            for(var i=0;i<ns.length;i++) {
                this._lexer_hash[ns[i].trim()] = lexer.instance;
            }
        },
        get : function(name) {
            if(this._lexer_hash[name]) {
                return this._lexer_hash[name];
            } else {
                return this._lexer_hash['plain'];
            }
        }
    });

    D.register({
        name : 'plain',
        instance : {
            lex : function(src, style_callback, paint_callback) {
                //do nothing
                //style_callback(0, src.length, 'plain');
                //paint_callback();
            }
        }
    })
})(dLighter._Lexer, dLighter.$);
/**
 * User: xiaoge
 * At: 12-12-21 11:08
 * Email: abraham1@163.com
 */
(function(D, $) {
    var ACT_TYPE = {
        NO_ACTION : -1,
        UNKNOW_CHAR : -2,
        UNMATCH_CHAR : -3
    };

    D._LexerBase = function() {
        this.src = null;
        this.end = 0;
        this.idx = 0;
        this.chr = -1;
        this.START_ACTION = 0;
        this.i_s = 0;
        this.yydefault = "plain";
        this.yystyle = null;
        this.TABLE = null;
        this.sync = {
            finished : false,
            go : $.createDelegate(this, this._syncLex),
            init :$.createDelegate(this, this._syncInit),
            cur_step : 0,
            total_step : 0,
            cur_idx : 0,
            cur_para : 0
        };
    }
    D._LexerBase.prototype = {
        read_ch : function() {
            throw "must be overwrite";
        },
        action : function(action) {
            //do nothing, must be overwrite
            throw "must be overwrite";
        },
        do_lex : function(sync, b_time) {
            var go_on = true, t_s, c_s;
            this.idx = 0;
            if(sync) {
                t_s = new Date().getTime();
                c_s = t_s;
                this.idx = this.sync.cur_idx;
            }

            while(go_on) {
                var yylen = 0;
                var state = this.i_s, action = ACT_TYPE.NO_ACTION;
                var pre_idx = this.idx, pre_action = ACT_TYPE.NO_ACTION, pre_act_len = 0;

                while(true) {
                    if(this.read_ch() < 0) {
                        if(pre_action >= 0) {
                            action = pre_action;
                            yylen = pre_act_len;
                            this.idx = pre_idx + pre_act_len;
                        } else if(pre_idx < this.end) {
                            action = ACT_TYPE.UNMATCH_CHAR;
                            this.idx = pre_idx + 1;
                        }
                        if(pre_idx >= this.end) {
                            go_on = false;
                            this.sync.finished = true;
                        }
                        break;
                    } else {
                        yylen++;
                    }
                    var eqc = this.TABLE._eqc[this.chr];

                    if(eqc === undefined) {
                        if(pre_action >= 0) {
                            action = pre_action;
                            yylen = pre_act_len;
                            this.idx = pre_idx + pre_act_len;
                        } else
                            action = ACT_TYPE.UNKNOW_CHAR;
                        break;
                    }
                    var offset, next = -1, s = state;

                    while(s >= 0) {
                        offset = this.TABLE._base[s] + eqc;
                        if(this.TABLE._check[offset] === s) {
                            next = this.TABLE._next[offset];
                            break;
                        } else {
                            s = this.TABLE._default[s];
                        }
                    }

                    if(next < 0) {
                        if(pre_action >= 0) {
                            action = pre_action;
                            yylen = pre_act_len;
                            this.idx = pre_idx + pre_act_len;
                        } else {
                            action = ACT_TYPE.UNMATCH_CHAR;
                            this.idx = pre_idx + 1;
                        }
                        //跳出内层while，执行对应的action动作
                        break;
                    } else {
                        state = next;
                        action = this.TABLE._action[next];
                        if(action >= 0) {
                            /**
                             * 如果action>=0，说明该状态为accept状态。
                             */
                            pre_action = action;
                            pre_act_len = yylen;
                        }
                    }
                }

                this.action(action);
                this.style_callback(pre_idx, yylen, this.yystyle);

                if(sync && go_on) {
                    c_s = new Date().getTime();
                    if(c_s - t_s >= b_time) {
                        go_on = false;
                    }
                }
            }

        },
        yygoto : function(state) {
            this.i_s = state;
        },
        /**
         *
         * @param src 源文本
         * @param style_callback 设置区域的格式的回调函数，用来通知lighter设置文本的颜色格式
         */
        lex : function(src, style_callback) {
            this.src = src;
            this.style_callback = style_callback;
            this.end = this.src.length;
            this.i_s = this.START_ACTION;
//            var d = new Date().getTime();
            this.do_lex(false);
//            $.log("lex time:%s", new Date().getTime()-d);
        },
        _syncLex : function(scheduler) {
            var s = this.sync;
            if(s.finished) {
                scheduler.measure_step = s.total_step;
                return;
            }
            this.do_lex(true, scheduler.BREAK_TIME);
            s.cur_idx = this.idx;
            s.cur_step = s.cur_para;
            scheduler.lex_step = s.cur_step;
        },
        _syncInit : function(total_step, src, style_callback) {
            this.sync.finished = false;
            this.sync.cur_step = 0;
            this.sync.total_step = total_step;
            this.sync.cur_idx = 0;
            this.src = src;
            this.style_callback = style_callback;
            this.end = this.src.length;
            this.i_s = this.START_ACTION;
        }
    }
})(dLighter._Lexer, dLighter.$);
/**
 * User: xiaoge
 * At: 12-12-21 11:22
 * Email: abraham1@163.com
 */
(function(D, $) {
    var DEFAULT = 156, LINE_COMMENT = 157, BLOCK_COMMENT = 158, DOC_COMMENT = 159, STRING_A = 160, STRING_B = 161;
    var _lexer_js = function() {
        this.base();
        this.START_ACTION = 156;
        this.TABLE = {
            _base : (window.Int32Array ? new Int32Array(162) : new Array(162)),
            _default : (window.Int32Array ? new Int32Array(162) : new Array(162)),
            _check : (window.Int32Array ? new Int32Array(4841) : new Array(4841)),
            _next : (window.Int32Array ? new Int32Array(4841) : new Array(4841)),
            _action : (window.Int32Array ? new Int32Array(162) : new Array(162)),
            _eqc : (window.Int32Array ? new Int32Array(256) : new Array(256))
        };
        D._str_to_arr(["\0\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\1\2\2\2\1\1\1\1\1\1\2\1\1\1\11\10\2\1\1\1\30\1\77\x68\1\x91\1\xba\xe3\u010c\u0135\u015e\u0187\u01b0\u01d9\u0202\u022b\u0254\u027d\u02a6\u02cf\u02f8\u0321\u034a\u0373\u039c\u03c5\u03ee\u0417\u0440\u0469\u0492\u04bb\u04e4\u050d\u0536\u055f\u0588\u05b1\u05da\u0603\u062c\u0655\u067e\u06a7\u06d0\u06f9\u0722\u074b\u0774\1\u079d\u07c6\u07ef\u0818\u0841\u086a\u0893\u08bc\u08e5\u090e\u0937\u0960\u0989\u09b2\u09db\u0a04\u0a2d\u0a56\u0a7f\u0aa8\u0ad1\u0afa\u0b23\u0b4c\u0b75\u0b9e\u0bc7\u0bf0\u0c19\u0c42\u0c6b\u0c94\u0cbd\u0ce6\u0d0f\u0d38\u0d61\u0d8a\u0db3\u0ddc\u0e05\u0e2e\u0e57\u0e80\u0ea9\u0ed2\u0efb\u0f24\u0f4d\u0f76\u0f9f\u0fc8\u0ff1\u101a\1\1\u1043\u107b\u10b3\u10eb\1\u1123\u115b\u1194\u11cd\1\u1206\u123f\u1278\u12b1", "\1\43\0\2\24\3\26\2\43\2\0\3\47\2\0\2\52\3\0\2\55\2\0\2\55\54\0\2\55\67\0\3\55\5\0\2\x95\5\0\2\x9b\5\0", "\1\2\x9e\2\47\2\0\2\53\2\34\3\0\2\35\7\0\2\43\2\36\11\0\3\52\2\x94\3\0\2\46\5\0\3\47\2\0\4\47\2\24\2\46\2\26\2\27\2\30\2\31\2\32\2\33\2\25\2\37\2\40\2\44\2\45\3\0\2\41\2\42\3\52\2\0\4\52\2\54\3\0\27\54\2\0\20\54\2\55\3\0\27\55\2\0\20\55\2\57\3\0\27\57\2\0\20\57\2\61\3\0\27\61\2\0\20\61\2\62\3\0\27\62\2\0\20\62\2\63\3\0\27\63\2\0\20\63\2\64\3\0\27\64\2\0\20\64\2\65\3\0\27\65\2\0\20\65\2\66\3\0\27\66\2\0\20\66\2\67\3\0\27\67\2\0\20\67\2\70\3\0\27\70\2\0\20\70\2\71\3\0\27\71\2\0\20\71\2\72\3\0\27\72\2\0\20\72\2\73\3\0\27\73\2\0\20\73\2\74\3\0\27\74\2\0\20\74\2\75\3\0\27\75\2\0\20\75\2\76\3\0\27\76\2\0\20\76\2\77\3\0\27\77\2\0\20\77\2\x40\3\0\27\x40\2\0\20\x40\2\x41\3\0\27\x41\2\0\20\x41\2\x42\3\0\27\x42\2\0\20\x42\2\x43\3\0\27\x43\2\0\20\x43\2\x44\3\0\27\x44\2\0\20\x44\2\x45\3\0\27\x45\2\0\20\x45\2\x46\3\0\27\x46\2\0\20\x46\2\x47\3\0\27\x47\2\0\20\x47\2\x48\3\0\27\x48\2\0\20\x48\2\x49\3\0\27\x49\2\0\20\x49\2\x4a\3\0\27\x4a\2\0\20\x4a\2\x4b\3\0\27\x4b\2\0\20\x4b\2\x4c\3\0\27\x4c\2\0\20\x4c\2\x4d\3\0\27\x4d\2\0\20\x4d\2\x4e\3\0\27\x4e\2\0\20\x4e\2\x4f\3\0\27\x4f\2\0\20\x4f\2\x50\3\0\27\x50\2\0\20\x50\2\x51\3\0\27\x51\2\0\20\x51\2\x52\3\0\27\x52\2\0\20\x52\2\x53\3\0\27\x53\2\0\20\x53\2\x54\3\0\27\x54\2\0\20\x54\2\x55\3\0\27\x55\2\0\20\x55\2\x56\3\0\27\x56\2\0\20\x56\2\x57\3\0\27\x57\2\0\20\x57\2\x58\3\0\27\x58\2\0\20\x58\2\x59\3\0\27\x59\2\0\20\x59\2\x5a\3\0\27\x5a\2\0\20\x5a\2\x5b\3\0\27\x5b\2\0\20\x5b\2\x5d\3\0\27\x5d\2\0\20\x5d\2\x5e\3\0\27\x5e\2\0\20\x5e\2\x5f\3\0\27\x5f\2\0\20\x5f\2\x60\3\0\27\x60\2\0\20\x60\2\x61\3\0\27\x61\2\0\20\x61\2\x62\3\0\27\x62\2\0\20\x62\2\x63\3\0\27\x63\2\0\20\x63\2\x64\3\0\27\x64\2\0\20\x64\2\x65\3\0\27\x65\2\0\20\x65\2\x66\3\0\27\x66\2\0\20\x66\2\x67\3\0\27\x67\2\0\20\x67\2\x68\3\0\27\x68\2\0\20\x68\2\x69\3\0\27\x69\2\0\20\x69\2\x6a\3\0\27\x6a\2\0\20\x6a\2\x6b\3\0\27\x6b\2\0\20\x6b\2\x6c\3\0\27\x6c\2\0\20\x6c\2\x6d\3\0\27\x6d\2\0\20\x6d\2\x6e\3\0\27\x6e\2\0\20\x6e\2\x6f\3\0\27\x6f\2\0\20\x6f\2\x70\3\0\27\x70\2\0\20\x70\2\x71\3\0\27\x71\2\0\20\x71\2\x72\3\0\27\x72\2\0\20\x72\2\x73\3\0\27\x73\2\0\20\x73\2\x74\3\0\27\x74\2\0\20\x74\2\x75\3\0\27\x75\2\0\20\x75\2\x76\3\0\27\x76\2\0\20\x76\2\x77\3\0\27\x77\2\0\20\x77\2\x78\3\0\27\x78\2\0\20\x78\2\x79\3\0\27\x79\2\0\20\x79\2\x7a\3\0\27\x7a\2\0\20\x7a\2\x7b\3\0\27\x7b\2\0\20\x7b\2\x7c\3\0\27\x7c\2\0\20\x7c\2\x7d\3\0\27\x7d\2\0\20\x7d\2\x7e\3\0\27\x7e\2\0\20\x7e\2\x7f\3\0\27\x7f\2\0\20\x7f\2\x80\3\0\27\x80\2\0\20\x80\2\x81\3\0\27\x81\2\0\20\x81\2\x82\3\0\27\x82\2\0\20\x82\2\x83\3\0\27\x83\2\0\20\x83\2\x84\3\0\27\x84\2\0\20\x84\2\x85\3\0\27\x85\2\0\20\x85\2\x86\3\0\27\x86\2\0\20\x86\2\x87\3\0\27\x87\2\0\20\x87\2\x88\3\0\27\x88\2\0\20\x88\2\x89\3\0\27\x89\2\0\20\x89\2\x8a\3\0\27\x8a\2\0\20\x8a\2\x8b\3\0\27\x8b\2\0\20\x8b\2\x8c\3\0\27\x8c\2\0\20\x8c\2\x8d\3\0\27\x8d\2\0\20\x8d\2\x8e\3\0\27\x8e\2\0\20\x8e\2\x8f\3\0\27\x8f\2\0\20\x8f\2\x90\3\0\27\x90\2\0\20\x90\2\x91\3\0\27\x91\2\0\20\x91\2\x92\3\0\27\x92\2\0\20\x92\71\x95\71\x96\71\x97\71\x98\71\x9a\71\x9b\72\x9c\72\x9d\72\x9f\72\xa0\72\xa1\72\xa2", "\1\2\11\2\47\2\0\2\7\2\1\3\0\2\36\7\0\2\24\2\34\11\0\2\52\2\51\2\35\3\0\2\43\5\0\3\47\2\0\4\47\3\3\2\7\2\26\5\7\2\2\2\12\2\14\2\30\2\7\3\0\2\16\2\21\3\52\2\0\4\52\2\x5c\3\0\27\x5c\2\0\12\x5c\2\x8a\7\x5c\3\0\27\x5c\2\0\21\x5c\3\0\14\x5c\2\x5d\13\x5c\2\0\21\x5c\3\0\4\x5c\2\x93\23\x5c\2\0\21\x5c\3\0\4\x5c\2\x91\23\x5c\2\0\21\x5c\3\0\2\x8f\26\x5c\2\0\21\x5c\3\0\3\x5c\2\x8e\24\x5c\2\0\21\x5c\3\0\2\x5c\2\x8d\15\x5c\2\x42\10\x5c\2\0\21\x5c\3\0\5\x5c\2\x8b\22\x5c\2\0\21\x5c\3\0\6\x5c\2\x90\21\x5c\2\0\21\x5c\3\0\7\x5c\2\x93\20\x5c\2\0\21\x5c\3\0\7\x5c\2\x8e\20\x5c\2\0\21\x5c\3\0\3\x5c\2\x88\2\x73\23\x5c\2\0\21\x5c\3\0\10\x5c\2\x8e\17\x5c\2\0\21\x5c\3\0\7\x5c\2\x86\20\x5c\2\0\21\x5c\3\0\11\x5c\2\x92\16\x5c\2\0\21\x5c\3\0\2\x5c\2\x82\25\x5c\2\0\21\x5c\3\0\2\x80\26\x5c\2\0\21\x5c\3\0\12\x5c\2\x93\15\x5c\2\0\21\x5c\3\0\11\x5c\2\x7d\16\x5c\2\0\21\x5c\3\0\13\x5c\2\x87\14\x5c\2\0\21\x5c\3\0\13\x5c\2\x81\14\x5c\2\0\21\x5c\3\0\5\x5c\2\x7b\22\x5c\2\0\21\x5c\3\0\11\x5c\2\x7a\16\x5c\2\0\21\x5c\3\0\12\x5c\2\x79\15\x5c\2\0\21\x5c\3\0\15\x5c\2\x82\12\x5c\2\0\21\x5c\3\0\2\x76\26\x5c\2\0\21\x5c\3\0\11\x5c\2\x75\16\x5c\2\0\21\x5c\3\0\15\x5c\2\x74\12\x5c\2\0\21\x5c\3\0\11\x5c\2\x72\16\x5c\2\0\21\x5c\3\0\14\x5c\2\x70\13\x5c\2\0\21\x5c\3\0\13\x5c\2\x6f\14\x5c\2\0\21\x5c\3\0\6\x5c\2\x6d\21\x5c\2\0\21\x5c\3\0\2\x5c\2\x6c\25\x5c\2\0\21\x5c\3\0\6\x5c\2\x6b\21\x5c\2\0\21\x5c\3\0\6\x5c\2\x6a\21\x5c\2\0\21\x5c\3\0\2\x5c\2\x69\25\x5c\2\0\21\x5c\3\0\2\x5c\2\x68\25\x5c\2\0\21\x5c\3\0\11\x5c\2\x65\16\x5c\2\0\21\x5c\3\0\2\x5c\2\x64\25\x5c\2\0\21\x5c\3\0\27\x5c\2\0\4\x5c\2\x62\15\x5c\3\0\27\x5c\2\0\2\x5c\2\x61\17\x5c\3\0\27\x5c\2\0\11\x5c\2\x67\10\x5c\3\0\2\x5f\26\x5c\2\0\21\x5c\3\0\27\x5c\2\0\14\x5c\2\x67\5\x5c\3\0\27\x5c\2\0\16\x5c\2\x7f\3\x5c\3\0\3\x5c\2\x5b\24\x5c\2\0\21\x5c\3\0\11\x5c\2\x59\16\x5c\2\0\21\x5c\3\0\27\x5c\2\0\10\x5c\2\x58\3\x5c\2\x5a\2\x5c\2\x67\4\x5c\3\0\4\x5c\2\x57\23\x5c\2\0\21\x5c\3\0\27\x5c\2\0\3\x5c\2\x56\16\x5c\3\0\27\x5c\2\0\5\x5c\2\55\14\x5c\3\0\2\x55\26\x5c\2\0\21\x5c\3\0\13\x5c\2\x54\14\x5c\2\0\21\x5c\3\0\27\x5c\2\0\2\x5c\2\55\17\x5c\3\0\20\x5c\2\x94\7\x5c\2\0\21\x5c\3\0\23\x5c\2\x53\4\x5c\2\0\21\x5c\3\0\2\x5c\2\x51\25\x5c\2\0\21\x5c\3\0\2\x5c\2\x50\25\x5c\2\0\21\x5c\3\0\24\x5c\2\55\3\x5c\2\0\21\x5c\3\0\24\x5c\2\54\3\x5c\2\0\21\x5c\3\0\4\x5c\2\x4e\23\x5c\2\0\21\x5c\3\0\21\x5c\2\60\6\x5c\2\0\21\x5c\3\0\16\x5c\2\x4d\11\x5c\2\0\21\x5c\3\0\2\x4c\26\x5c\2\0\21\x5c\3\0\17\x5c\2\60\10\x5c\2\0\21\x5c\3\0\13\x5c\2\x4b\4\x5c\2\x7c\10\x5c\2\0\21\x5c\3\0\12\x5c\2\x4a\15\x5c\2\0\21\x5c\3\0\16\x5c\2\60\11\x5c\2\0\21\x5c\3\0\16\x5c\2\55\11\x5c\2\0\21\x5c\3\0\14\x5c\2\x48\13\x5c\2\0\21\x5c\3\0\13\x5c\2\x47\14\x5c\2\0\21\x5c\3\0\15\x5c\2\57\12\x5c\2\0\21\x5c\3\0\11\x5c\2\x46\16\x5c\2\0\21\x5c\3\0\4\x5c\2\x44\23\x5c\2\0\21\x5c\3\0\2\x43\26\x5c\2\0\21\x5c\3\0\13\x5c\2\x41\14\x5c\2\0\21\x5c\3\0\13\x5c\2\71\14\x5c\2\0\21\x5c\3\0\4\x5c\2\x40\23\x5c\2\0\21\x5c\3\0\4\x5c\2\77\23\x5c\2\0\21\x5c\3\0\4\x5c\2\75\23\x5c\2\0\21\x5c\3\0\3\x5c\2\76\24\x5c\2\0\21\x5c\3\0\11\x5c\2\64\16\x5c\2\0\21\x5c\3\0\11\x5c\2\60\16\x5c\2\0\21\x5c\3\0\3\x5c\2\x49\3\x5c\2\74\7\x5c\2\x90\12\x5c\2\0\21\x5c\3\0\7\x5c\2\73\13\x5c\2\x7f\5\x5c\2\0\21\x5c\3\0\6\x5c\2\73\7\x5c\2\x45\12\x5c\2\0\21\x5c\3\0\10\x5c\2\61\17\x5c\2\0\21\x5c\3\0\10\x5c\2\56\17\x5c\2\0\21\x5c\3\0\7\x5c\2\70\20\x5c\2\0\21\x5c\3\0\6\x5c\2\63\21\x5c\2\0\21\x5c\3\0\3\x5c\2\66\24\x5c\2\0\21\x5c\3\0\5\x5c\2\62\22\x5c\2\0\21\x5c\3\0\5\x5c\2\60\4\x5c\2\60\16\x5c\2\0\21\x5c\3\0\3\x5c\2\61\24\x5c\2\0\21\x5c\3\0\4\x5c\2\60\23\x5c\2\0\21\x5c\3\0\4\x5c\2\55\23\x5c\2\0\21\x5c\3\0\2\x5c\2\60\25\x5c\2\0\21\x5c\3\0\2\x5c\2\55\25\x5c\2\0\21\x5c\3\0\2\55\26\x5c\2\0\20\x5c\61\x99\2\46\5\x99\2\x9a\52\x99\2\x95\11\x99\2\46\5\x99\2\x9a\20\x99\2\x96\32\x99\2\x95\11\x99\2\46\5\x99\2\x9a\20\x99\2\x96\16\x99\2\x97\14\x99\2\x95\11\x99\2\46\5\x99\2\x9a\63\x99\2\x98\5\x99\2\x9a\3\x99\71\x9b\61\x99\2\25\2\4\10\x99\2\10\2\52\2\50\2\53\2\65\2\x7e\2\x78\2\x84\2\x83\3\x5c\2\x6e\2\72\2\x77\2\x8c\2\x85\2\x5c\2\x71\2\x5c\2\x4f\2\x5c\2\67\2\x52\2\x5c\2\x89\2\x66\2\10\2\x60\5\x5c\2\x63\2\x5e\3\52\2\x5c\4\52\3\x5c\2\27\2\44\2\31\2\45\2\32\2\33\2\7\2\x9c\4\7\3\10\2\6\2\5\61\13\2\37\11\13\61\15\2\40\11\15\2\20\66\17\2\41\2\20\2\17\2\23\66\22\2\42\2\22\2\23", "\1\2\4\2\15\2\20\2\7\2\25\2\21\2\6\2\31\2\10\2\13\2\14\2\16\2\17\2\23\2\22\2\24\2\27\2\26\2\30\2\20\2\12\7\6\4\0\2\14\2\17\2\22\2\26\2\20\3\31\2\20\2\1\2\31\2\0\2\1\2\6\3\4\2\3\3\2\x63\5\2\1\2\5\5\20\3\0\2\11\2\6\2\0\2\11\5\0", "\1\13\66\2\1\27\66\2\63\2\70\2\66\2\52\2\65\2\57\2\71\3\66\2\61\2\55\2\66\2\4\2\3\2\62\2\2\2\46\2\44\2\43\3\2\2\47\2\2\2\50\2\2\3\66\2\56\2\53\2\54\3\66\2\27\2\45\2\52\2\31\2\36\4\52\2\42\6\52\2\32\3\52\2\34\2\41\10\52\2\66\2\67\2\66\2\64\2\52\2\66\2\12\2\24\2\20\2\16\2\10\2\11\2\35\2\23\2\17\2\33\2\25\2\13\2\51\2\15\2\21\2\40\2\52\2\6\2\14\2\5\2\7\2\26\2\22\2\37\2\30\2\52\2\66\2\60\x84\66"], [this.TABLE._base, this.TABLE._default, this.TABLE._check, this.TABLE._next, this.TABLE._action, this.TABLE._eqc]);
    };
    _lexer_js.prototype = {
        read_ch : function() {
            if(this.idx >= this.end)
                return this.chr = -1;
            else {
                this.chr = this.src.charCodeAt(this.idx++);
                if(this.chr === 10) { // chr === '\n'
                    this.sync.cur_para++;
                }
                return this.chr;
            }
        },
        action : function(action) {
            switch(action) {
                case 3:
                    this.yystyle = "object";
                    break;
                case 2:
                    this.yystyle = "param";
                    break;
                case 12:
                    this.yystyle = "doc_comment";
                    this.yydefault = "doc_comment";
                    this.yygoto(DOC_COMMENT);
                    break;
                case 15:
                    this.yystyle = "regexp";
                    break;
                case 6:
                    this.yystyle = "comment";
                    this.yydefault = "comment";
                    this.yygoto(LINE_COMMENT);
                    break;
                case 9:
                    this.yystyle = "comment";
                    this.yydefault = "comment";
                    this.yygoto(BLOCK_COMMENT);
                    break;
                case 1:
                    this.yystyle = "keyword";
                    break;
                case 20:
                    this.yystyle = "string";
                    this.yydefault = "string";
                    this.yygoto(STRING_B);
                    break;
                case 16:
                    this.yystyle = "string";
                    this.yydefault = "string";
                    this.yygoto(STRING_A);
                    break;
                case 4:
                    this.yystyle = this.yydefault;
                    break;
                case 5:
                    this.yystyle = "operator";
                    break;
                case 0:
                    this.yystyle = "value";
                    break;
                case 24:
                    this.yystyle = "plain";
                    break;
                case 7:
                    this.yystyle = "comment";
                    this.yydefault = "plain";
                    this.yygoto(DEFAULT);
                    break;
                case 8:
                    this.yystyle = "comment";
                    break;
                case 10:
                    this.yystyle = "comment";
                    this.yydefault = "plain";
                    this.yygoto(DEFAULT);
                    break;
                case 11:
                    this.yystyle = "comment";
                    break;
                case 13:
                    this.yystyle = "doc_comment";
                    this.yydefault = "plain";
                    this.yygoto(DEFAULT);
                    break;
                case 14:
                    this.yystyle = "doc_comment";
                    break;
                case 18:
                    this.yystyle = "string";
                    break;
                case 17:
                    this.yystyle = "string";
                    break;
                case 19:
                    this.yystyle = "string";
                    this.yydefault = "plain";
                    this.yygoto(DEFAULT);
                    break;
                case 22:
                    this.yystyle = "string";
                    break;
                case 21:
                    this.yystyle = "string";
                    break;
                case 23:
                    this.yystyle = "string";
                    this.yydefault = "plain";
                    this.yygoto(DEFAULT);
                    break;
                default :
                    this.yystyle = this.yydefault;
                    break;
            }
        }
    };
    $.inherit(_lexer_js, D._LexerBase);

    D.register({
        name : 'javascript, js',
        instance : new _lexer_js()
    });
})(dLighter._Lexer, dLighter.$);/**
 * User: xiaoge
 * At: 12-12-26 11:11
 * Email: abraham1@163.com
 */
(function(D, $){
    /**
     * 默认主题，同时也是主题模板
     */
    D.register({
        name : 'dLighter',
        global : {
            /*
             * 这里的字体的大小和名称默认是没有作用的，因为会取代码所在dom元素的字体。
             * 但如果pre中明确指定use_theme_font=true则会使用这里设置的字体和大小
             */
            font_size : 16,
            font_name : 'Consolas',
            background : '#F2F4FF',
            color : 'black',
            caret_color : 'purple'
        },
        gutter : {
            number_color : '#afafaf',
            line_color : '#6ce26c'
        },
        selected : {
            background : '#B4D5FF'
        },
        /**
         * highlight为保留字段，目前还没有实现
         */
        highlight : {
            background : '#e0e0e0'
        },
        /**
         * 代码的高亮颜色和样式，这个是全局的，既适用于任何语言。
         * lexer中通过设置this.yystyle={key}则可以将相应区域的代码设置成key对应的样式。
         */
        code : {
            keyword : {color:'#006699', bold : true},
            value : {color:'#009900'},
            comment : {color: '#5f5a60', italic : true},
            operator: {color: 'black'},
            string : {color:'blue'}
        },
        /**
         * 特定代码的高亮样式。这一部分language是对上一部分code部分的补充，比如js代码里面会有正则表达式regexp。
         * 该部分也可以覆盖上一部分的样式。
         * 该部分的key是语言的名称，别名用逗号隔开，允许空格。
         */
        language : {
            'javascript, js' :
            {
                doc_comment : {color: '#008080', italic : true},
                regexp : {color:'#0066cc',bold:true},
                object : {color:'#ff1493'},
                param : {color:'#ff1493',italic:true}
            },
            'css' : {
                important : {color : 'red', italic: true}
            },
            'xml,html,xhtml,xslt' : {
                property : {color : '#ff1493'}
            }
        }
    });
})(dLighter._Theme, dLighter.$);