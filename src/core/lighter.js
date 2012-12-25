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

            //this.clipboard = D.Clipboard.getInstance();
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

            this.initCaret();
            this.initEvent();

            //this.wordSeg = new Text._WordSeg(this);
            if(typeof config.text === 'string') {
                this.setText(config.text);
            }
        }
        D._Lighter.prototype = {
            resize : function() {
                var ph = this.cur_page.page_height + 5, h = ph;
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
                this.container.style.height = h + "px";
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
            _getScrollY : function(e, is_chrome) {
                var y = 0;
                if (is_chrome) {
                    var s_p = this.scroll.parentElement, off = $.getOffset(s_p);
                    y = e.y - off.top + document.body.scrollTop;
                } else if ( typeof e.offsetX !== 'undefined') {
                    y = e.offsetY;
                } else if ( typeof e.x !== 'undefined') {
                    y = e.y
                } else if ( typeof e.layerX !== 'undefined') {
                    y = e.layerY;
                } else {
                    throw "no y in event(_getScrollY)";
                }
                //$.log('y:%s',y);
                return y;
            },

            focus : function() {
                //if(this.cur_mode==="handword" || this.cur_mode==="readonly"){
                if (this.focused === false) {
                    this.focused = true;
                    this._caretFocus();
                }
                //$.log('focus')
                //}
            },
            blur : function() {
                this.focused = false;
                this._caretBlur();
            },

            _ajustScroll : function(p_num, c_num) {
                if(p_num!==c_num){
                    if(this.parent && typeof this.parent.onLineNumberChange==="function") {
                        this.parent.onLineNumberChange(c_num, p_num);
                    }

                }
            },
            _ajustHorScroll : function(m_width) {
                if(this.max_line_width<m_width) {
                    this.max_line_width = m_width;
                    this.parent._resetHorScrollBar();
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
