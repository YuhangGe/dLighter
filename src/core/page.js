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
        paint_callback : function() {
            this.lighter.paint();
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

            /*
             * 然后再对每个段落计算其排版
             */
            this.lighter.render.calc_padding_left(this.para_info.length);
            var ls = 0;
            for(var i=0;i<this.para_info.length;i++) {
                this.para_info[i].line_start = ls;
                this.para_info[i].line_cross = this.lighter.render._measure(this.para_info[i]);
                ls += this.para_info[i].line_cross;
            }
            this.line_number = ls;
            this.page_height = this.line_height * this.line_number;
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

			this.select_mode = true;
			this.select_range.from = fc;
			this.select_range.to = tc;
			//this.render.paint();
			return tc;
		},
        getCaretByIndex : function(index) {

            if (index === -1)
                return {
                    index : -1,
                    para : 0,
                    para_at : -1,
                    left :  0,
                    line : 0,
                    top : this.lighter.line_height - this.lighter.font_height
                };
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
					para_at : -1,
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
				this.select_mode = true;
				this.select(fc, tc);
			}
			return tc;
		},

		/**
		 * 复制
		 */
		copySelect : function() {
			var e_r = this.char_array, f = this.select_range.from, t = this.select_range.to, items = [];
			for (var i = f.index + 1; i <= t.index; i++) {
				items.push(e_r[i].copy());
			}
			return {
				items : items,
				ranges : this._copySelectRanges(f.index, t.index)
			};
		},

		findText : function(txt, start) {
			var arr = this.char_array, lf = this.last_find, t_next = lf.text === txt ? lf.next : (lf.next = $.getKmpNext(lf.text = txt));
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
