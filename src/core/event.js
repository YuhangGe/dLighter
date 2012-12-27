(function(D, $) {

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
})(dLighter._Core, dLighter.$);