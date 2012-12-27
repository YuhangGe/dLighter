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
			//$.log("pl:%d,%d,%d",si,ei, p_idx)
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
