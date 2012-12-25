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
			return this.ctx.measureText(str).width;
		},
		_measure : function(para) {
			//$.log(para.rtl ? "right_to_left" : 'left_to_right')

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
