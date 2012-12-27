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
            this.width = config.width;
            this.height = config.height;
            this.canvas.parentElement.style.background = this.theme.background;
            this.canvas_width = this.width - this.scroll_breadth;
            this.canvas_height = this.height;
            this.canvas.width = this.canvas_width;
            this.canvas.height = this.canvas_height;
            this.scroll_left = 0;
            this.scroll_top = 0;
            this.line_number_start = config.line_number_start;
            this.cur_page = new D._Page(this);
//            this.clipboard = new D._Clipboard(this);
            this.caret_pos = {
                index : -1,
                para : 0,
                para_at : -1,
                left : 0,
                line : 0,
                top : 0
            }

            this.render = new D._Render(this);

            this.caret_left = 0;
            this.caret_top = 0;
            this.caret_height = this.font_height;
            this.focused = false;

            this.scroll_ver.addListener(this);
            this.scroll_hor.addListener(this);
            this.scroll_ver.attachWheelEvent(this.canvas);
            this.scroll_ver.setBreadth(this.scroll_breadth);
            this.scroll_hor.setBreadth(this.scroll_breadth);
            this.scroll_ver.hide();
            this.scroll_hor.hide();
            this.paint_delegate = $.createDelegate(this, this.paint_handelr);
            this.lex_delegate = $.createDelegate(this, this.lex_handler);

            this.container_origin_height = this.container.offsetHeight;
            this.initCaret();
            this.initEvent();

            if(typeof config.text === 'string') {
                this.setText(config.text);
            }
        }
        D._Lighter.prototype = {
            resize : function() {
                var ph = this.cur_page.page_height, h = ph;
                if(this.cur_page.max_line_width > this.width) {
                    this.scroll_hor.show();
                    h += this.scroll_breadth;
                } else {
                    this.scroll_hor.hide();
                }
                this.canvas_height = ph;
                this.render.height = this.canvas_height;
                this.canvas.height = ph;
                this.height = h;
                if(h > this.container_origin_height) {
                    this.container.style.height = h + "px";
                } else {
                    this.container.style.height = this.container_origin_height + "px";
                }
            },
            paint_handelr : function() {
                this.paint();
            },
            lex_handler : function() {
                this.lexer.lex(this.cur_page.text, this.cur_page.style_delegate, this.paint_delegate);
            },
            setText : function(text) {
                this.cur_page.setText(text);
                this.resize();
                this.paint();
                window.setTimeout(this.lex_delegate, 0);
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
                this.render.paint();
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
