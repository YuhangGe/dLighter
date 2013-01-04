/**
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
            this.break_line = true;
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
                if(this.cur_page.max_line_width > this.width) {
                    this.scroll_hor.setScrollMax(this.cur_page.max_line_width-this.width);
                    this.scroll_hor.setLength(this.width - this.scroll_breadth);
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
