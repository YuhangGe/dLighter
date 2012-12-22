/**
 * User: xiaoge
 * Date: 12-12-19 8:58
 * Email: abraham1@163.com
 */
(function(D, $) {
        D._Lighter = function(canvas, caret, ver_scroll, hor_scroll, config) {
            this.canvas = canvas;
            this.caret = caret;
            this.scroll_ver = new D._Scroll(ver_scroll, 'ver');
            this.scroll_hor = new D._Scroll(hor_scroll, 'hor');

            //this.clipboard = D.Clipboard.getInstance();
            this.theme = dLighter._Theme.get(config.theme);
            this.lang_style = this.theme.getLanguageStyle(config.language);
            this.lexer = dLighter._Lexer.get(config.language);
            this.font_height = $.getFontHeight(this.theme.font_size, this.theme.font_name);
            this.line_height = this.font_height;
            this.break_line = true;
            this.scroll_breadth = this.theme.scroll_breadth;
            this.width = config.width;
            this.height = config.height;
            this.canvas.parentElement.style.background = this.theme.background;
            this.canvas_width = this.width - this.scroll_breadth;
            this.canvas_height = this.height - this.scroll_breadth;
            this.canvas.width = this.canvas_width;
            this.canvas.height = this.canvas_height;
            this.scroll_left = 0;
            this.scroll_top = 0;

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
            //this.initCaret();
            //this.initEvent();
            this.scroll_ver.addListener(this);
            this.scroll_hor.addListener(this);
            this.scroll_ver.attachWheelEvent(this.canvas);
            this.scroll_ver.setBreadth(this.scroll_breadth);
            this.scroll_hor.setBreadth(this.scroll_breadth);

            //this.wordSeg = new Text._WordSeg(this);
            if(typeof config.text === 'string') {
                this.setText(config.text);
            }
        }
        D._Lighter.prototype = {
            setText : function(text) {
                this.cur_page.setText(text);
                this.paint();
            },
            beforeScroll : function() {
                if(this.caret_data!==null){
                    this._caretStopFlash();
                    this._caretHide();
                }
            },
            afterScroll : function(){
                this._resetCaret();
                this.paint();
            },

            /**
             * 缩放设置宽高，文本不会重新布局，但显示的整体大小会一起缩放。
             */
            resize : function() {
                var p = this.parent;
                this.canvas.width = p.canvas_width;
                this.canvas.height = p.canvas_height ;
                this.render.height = p.canvas_height;
                this.render.width = p.canvas_width;
                this.render._resetPageWidth();
                if(this.render.page_width===-1) {
                    this.cur_page.refreshLayout();
                    this._setCaret(this.cur_page._getCaret_p(this.caret_pos.para, this.caret_pos.para_at));
                }
//			this.render.scale = p.scale;
//			this.caret_height = Math.round(p.line_height * p.scale);
//			this.caret.style.font = Math.round(this.style.font_size * p.scale) + "px " + this.style.font_name;

                this.render.paint();
                this._resetCaret();
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

            _resetStyle : function() {
                var cp = this.cur_page, len = cp.ele_array.length, idx = (cp.select_mode ? cp.select_range.from.index + 1 : this.caret_pos.index);
                var para = cp.para_info[cp.select_mode?cp.select_range.from.para:this.caret_pos.para];
                //	$.log(idx)

                var style = {
                    color : "black",
                    font_size : 35,
                    underline : false

                };

                if (len > 0 && idx >= 0 && cp.ele_array[idx].type === Text._Element.Type.CHAR && cp._getRange_before(idx) === null) {
                    style = cp.ele_array[idx].style;
                }
                this.style.setStyle(style);

                style.align = para.align;
                /**
                 * 调用全局控制函数重新改变工具样的值。
                 */
                Control.callback("style", style);

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
                        } else if (p_idx < this.cur_page.para_number - 1) {
                            p_idx++;
                            p_at = -1;
                        }
                        new_cp = this.cur_page._getCaret_p(p_idx, p_at);
                        //$.log(new_cp);
                        break;
                    case 'up':
                        if (cp.top - this.line_height > 0)
                            new_cp = this.cur_page._getCaret_xy(cp.left, cp.top - this.line_height);
                        break;
                    case 'down':
                        var pi = this.cur_page.para_info, lp = pi[pi.length - 1];
                        if (cp.top + this.line_height < (lp.line_start + lp.line_cross) * this.line_height)
                            new_cp = this.cur_page._getCaret_xy(cp.left, cp.top + this.line_height);
                        break;
                }
                this.cur_page.select(null);
                this._caretStopFlash();
                this.render.paint();
                this._setCaret(new_cp);
                this._resetStyle();
            },
            getThumb : function() {
                return this.render.getThumb();
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
