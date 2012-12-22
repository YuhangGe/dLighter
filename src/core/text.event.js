(function(Text, $) {

	$.extend(Text._Editor.prototype, {
        _getEventPoint : function(e) {
            var p = $._getEventPoint(e);
            p.x += this.parent.scroll_left;
            p.y += this.parent.scroll_top;
            return p;
        },
		_focus_handler : function(e) {
			this.focus();
		},
		_blur_handler : function(e) {
			/**
			 * hack. 如果e.explicitOriginalTarget===this.canvas(firefox, chrome, safari)
			 *       或者 document.activeElement === this.container(ie9)
			 *       表明当前失去焦点后的目标是canvas或者container，即相当于整个编辑器没有失去焦点，则让caret重新得到焦点。
			 *   否则处理失去焦点。
			 */
			if (e.explicitOriginalTarget === this.canvas || document.activeElement === this.container) {
				/**
				 * 设置timeout是因为直接caret.focus是没有作用的，当前代码本身就在caret的blur事件中运行。
				 * $.stopEvent也不能阻止caret失去焦点。
				 */
				window.setTimeout(this.caret_focus_delegate, 0);

			} else {
				$.log('texter blur');
				this.blur();
			}
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
		_leftmousedown_handler : function(e, is_chrome) {
			this.__left_mouse_down__ = true;
//            $.log(e);

			var p = this._getEventPoint(e);
		
			this._deal_leftmouse_down(e, p);
			
			if (is_chrome)
				$.stopEvent(e)
		},
		_mousedown_handler : function(e, is_chrome) {

			if (e.button === 0) {
				this._leftmousedown_handler(e, is_chrome);
			}
//不再使用右键处理手写，使用专门的手写板
//            else if (e.button === 2) {
//				this._rightmousedown_handler(e, is_chrome);
//			} else {
//				$.stopEvent(e);
//			}

		},
		_leftmouseup_handler : function(e, is_chrome) {
			var p = this._getEventPoint(e);

			this._resetStyle();
			var range = this.cur_page._getRange_xy(p.x, p.y);
			if (range !== null && (range.type === Text._Range.Type.TODO || e.ctrlKey)) {
				range.onClick(this.cur_page);
				this.__mouse_down_time__ = 0;
				if (this.__mdt_timeout__ !== null) {
					window.clearTimeout(this.__mdt_timeout__);
					this.__mdt_timeout__ = null;
				}
			}

			this.__left_mouse_down__ = false;
		},
		_mouseup_handler : function(e, is_chrome) {
			//$.log('mup');
			if (e.button === 0) {
				this._leftmouseup_handler(e, is_chrome);
			}
            //不再使用右键处理手写，使用专门的手写板
//            else if (e.button === 2) {
//				this._rightmouseup_handler(e, is_chrome);
//			} else {
//				$.stopEvent(e);
//			}

		},
		_deal_leftmouse_move : function(pos) { outif:
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
            //不再使用右键处理手写，使用专门的手写板

//            else if (this.__right_mouse_down__) {
//				this._rightmousemove_handler(e, is_chrome);
//			}
//			$.stopEvent(e);
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

			this._mousedown_handler(e, true);
			$.addEvent(window, 'mousemove', this.__cmv_handler);
			$.addEvent(window, 'mouseup', this.__cmu_handler);
		},

		_textinput_handler : function(e) {
			this.insert(this.caret.value);
			this.caret.value = "";
			this._adjust_caret_opera("");
		},
		_watch_input_handler : function() {
			this._adjust_caret_opera(this.caret.value);
		},
		_adjust_caret_opera : function(s) {
			if (this.__ime_preval__ === s) {
				return;
			} else {
				this.__ime_preval__ = s;
			}
			this._adjust_caret(s);
		},
		_adjust_caret : function(s) {
			this.render.ctx.font = this.caret.style.font;
            var p = this.parent;
			var w = this.render.ctx.measureText(s).width + 4, dw = p.canvas_width - this.caret_pos.left;
			if (w > p.canvas_width) {
				this.caret.style.height = Math.round(this.font_height * Math.ceil(w / p.canvas_width)) + "px";
			} else {
				this.caret.style.width = Math.round(w) + "px";
				if (w > dw)
					this.caret.style.left = Math.round(p.canvas_width - w) + "px";
			}
		},
		_copy_handler : function(e) {

			var rtn = false;
			if (this.cur_page.select_mode) {
				this.clipboard.setData("item", this.cur_page.copySelect(), e);
				rtn = true;	
			}
			if (e != null)
				$.stopEvent(e);
			return rtn;
		},
		_cut_handler : function(e) {
			if (this._copy_handler(e)) {
				this._delOrBack();
			}
		},
		_paste_handler : function(e) {
			this.clipboard.getData(e, $.createDelegate(this, this._deal_paste));
		},
		_firefox_paste_handler : function(e) {
			if (this.clipboard.getData(e, $.createDelegate(this, this._deal_paste)) === false) {
				window.setTimeout($.createDelegate(this, this._firefox_paste_timeout), 5);
			}
		},
		_firefox_paste_timeout : function() {
			this._deal_paste({
				type : 'text',
				value : this.caret.value
			});
			this.caret.value = "";
		},
		_paste_html : function(html) {

			var dom_p = document.createElement("div");

			dom_p.innerHTML = html;

			var images = dom_p.getElementsByTagName("img");

			if (images.length === 0)
				return;

			var left = this.caret_pos.left, top = this.caret_pos.top + this.line_height, doo_arr = [];
			for (var i = 0; i < images.length; i++) {
				var src = images[i].getAttribute("src");
				if (/^file:/.test(src)) {
					/* 去除本地文件  这个在word拷贝时会出现 */
					continue;
				}
				doo_arr.push(Daisy._Doodle.create(Daisy._Doodle.Type.IMAGE, 2, 'black', [], src, [1, 0, left, 0, 1, top]));
				left += 5;
				top += 5;
			}
			if (doo_arr.length > 0) {
				this.insertDoodle(doo_arr);
			}
			/*
			 * 插入图片后将当前模式切换成涂鸦模式。
			 * ctrlSwitch 函数不是editor的，是全局的函数。
			 */
			window.setTimeout(function() {
				ctrlSwitch("doodle-edit");
			}, 60);
		},
		_deal_paste : function(data) {
			if (data == null)
				return;
			if (data.type === "image") {
				var doo = Daisy._Doodle.create(Daisy._Doodle.Type.IMAGE, 2, 'black', [], data.value, [1, 0, this.caret_pos.left, 0, 1, this.caret_pos.top + this.line_height]);
				this.insertDoodle(doo);
				/*
				 * 插入图片后将当前模式切换成涂鸦模式。
				 * ctrlSwitch 函数不是editor的，是全局的函数。
				 */
				window.setTimeout(function() {
					ctrlSwitch("doodle-edit");
				}, 60);

			} else if (data.type === 'html') {
				this.insert(data.value[1]);
				this._paste_html(data.value[0]);
			} else if (data.type === 'text' || data.type === 'url') {
				this.insert(data.value);
			} else if (data.type === 'item') {
				/**
				 * 从剪切版复制Text._Element元素时，对剪切版中的元素进行拷贝后插入到文本中。
				 */
				var items = [], T = Text._Range.Type;
				for (var i = 0; i < data.value.items.length; i++)
					items.push(data.value.items[i].copy());

				var p_idx = this.caret_pos.index;

				this.insert(items);

				for (var i = 0; i < data.value.ranges.length; i++) {
					var r = data.value.ranges[i], cl = r.copy();
					cl.from = p_idx + r.from;
					cl.to = p_idx + r.to + 1;
					if (cl.type === T.TODO) {
						cl.item = items[r.to];
					}
					this.cur_page.range_array.push(cl);
				}
				/**
				 * 如果当前粘贴到了一个Link的内部，将格式转成链接的格式
				 */
				//$.log(this.caret_pos.index)
				var nnl = this.cur_page._getRangeContain_index(this.caret_pos.index);

				if (nnl !== null && nnl.type === Text._Range.Type.LINK) {
					for (var i = 0; i < items.length; i++) {
						items[i].style.setStyle(this.link_style);
					}
					this.render.paint();
				}

			}

		},
		_drop_handler : function(e) {
			$.stopEvent(e);

			var files = e.dataTransfer.files;
			if (files == null)
				return;
			if (files.length <= 0)
				return;
			for (var i = 0; i < files.length; i++) {
				var f = files[i], fr = new FileReader();
				if (/text/.test(f.type)) {
					fr.onload = $.createDelegate(this, function(e) {
						this.insert(e.target.result)
					});
					fr.readAsText(f);
				} else if (/image/.test(f.type)) {
					fr.onload = $.createDelegate(this, function(e) {
						var doo = Daisy._Doodle.create(Daisy._Doodle.Type.IMAGE, 2, 'black', [], e.target.result, [1, 0, this.caret_pos.left, 0, 1, this.caret_pos.top + this.line_height]);
						this.insertDoodle(doo);
						/*
						 * 插入图片后将当前模式切换成涂鸦模式。
						 * ctrlSwitch 函数不是editor的，是全局的函数。
						 */
						window.setTimeout(function() {
							ctrlSwitch("doodle-edit");
						}, 60);
					});
					fr.readAsDataURL(f);
				}
			}
		},
		_compositionstart_handler : function(e) {
			this.__ime_on__ = true;
			//$.log('c start')
			var p = this.parent;
			this.caret.style.left = (this.caret_left - 1) + "px";
			this.caret.style.top = (this.caret_pos.top - p.scroll_top + p.line_height - this.font_height  + this.baseline_offset) + "px";
			this.caret.style.height =this.font_height + "px";
			this.caret.style.opacity = 1;
			this.caret.style.border = "1px dashed green";
			this.caret.style.borderColor = "rgba(28,148,164,0.3)";
			this.caret.style.background = "#FFFFCC";
			this._caretHide();
			this._caretStopFlash();
		},
		_compositionupdate_handler : function(e) {
			if (this.__ime_on__) {
				e.data || (e.data = this.caret.value);
				if (e.data === "") {
					this._compositionend_handler(e)
				} else {
					this._adjust_caret(e.data);
				}

			}
		},
		_compositionend_timeout_handler : function() {
			this.caret.value = "";
			this.caret.style.left = "0px";
			this.caret.style.top = this.caret_top + 'px';
			this.caret.style.height = "0px";
			this.caret.style.width = "0px";
			this.caret.style.opacity = 0;
		},
		_compositionend_handler : function(e) {
			this.__ime_on__ = false;
			//$.log('c end')
			if (e.data !== "") {
				this.insert(e.data ? e.data : this.caret.value);
			} else {
				this._caretShow();
				this._caretBeginFlash();
			}
			/**
			 * 在chrome下面直接设置caret.value=""会出现bug
			 */
			setTimeout(this._compositionend_timeout, 0);

		},
		_keydown_handler : function(e) {
			//$.log(this.read_only);

			if (this._shortkey_handler(e)) {
				$.stopEvent(e);
				return;
			}
			/**
			 * 对ctrl-c 和ctrl-v ctrl-x单独处理，因为不同 浏览器这三个快捷键处理不一样。
			 *
			 * firefox 和 ie 下面当caret(即textarea)为空时，快捷键ctrl+c不能触发 oncopy事件，
			 * 需要手动处理
			 *
			 */
            var ctrlKey = $.macOS ? e.metaKey : e.ctrlKey;
			if (ctrlKey && e.keyCode === 67 && ($.ie || $.firefox || $.opera)) {
				//$.log('cp')
				this._copy_handler(null);
				$.stopEvent(e);
				return;
			} else if (ctrlKey && e.keyCode === 88 && ($.ie || $.firefox || $.opera)) {
				this._cut_handler(null);
				$.stopEvent(e);
				return;
			} else if (ctrlKey && e.keyCode === 86 && ($.opera || $.ie)) {
				this._paste_handler(null);
				$.stopEvent(e);
				return;
			} else if (this.cur_mode === 'readonly') {
				$.stopEvent(e);
				return;
			}

			switch(e.keyCode) {
				case 13:
					/**
					 * 处理回车键
					 */
					this._enter();
					/**
					 * 在ie下面要stopEvent，让keypress不要触发，否则回车会多一个\r。由于不影响其它浏览器，统一stopEvent.
					 */
					$.stopEvent(e);
					break;
				case 8:
					//退格（删除）
					this._delOrBack(false);
					break;
				case 9:
					/*
					 * 处理tab键
					 */
					this._tab();
					$.stopEvent(e);
					break;
				case 46:
					//del键
					this._delOrBack(true);
					break;
                /*
                 * 暂时停用轮询监控输入内容的逻辑
				case $.IME_KEY:
					if ($.opera) {
						if (this.__ime_check__ == null) {
							this.__ime_check__ = window.setInterval($.createDelegate(this, this._watch_input_handler), 10);
						}
					}
					break;
			    */

			}
		},
		_keypress_handler : function(e) {
			var ec = e.charCode, ev = String.fromCharCode(ec), ctrlKey = $.macOS ? e.metaKey : e.ctrlKey;
            if(ec<32 || (ctrlKey && /[abcixvzyr\-=0]/i.test(ev))){
                return;
            }
			if (this.cur_mode==='keyboard') {
				this.insert(String.fromCharCode(ec));
			}
            $.stopEvent(e);

        },
		_stop_handler : function(e) {
			$.stopEvent(e);
		},
		_dblclick_handler : function(p) {
			var ec = this.cur_page._getElementCaret_xy(p.x, p.y, true), e_arr = this.cur_page.ele_array;

			var sl = p.y <= ec.bottom ? 0 : Math.ceil((p.y - ec.bottom) / this.line_height), sw = sl > 0 ? (this.RTL ? this.render.width - p.x : p.x) : Math.abs(p.x - ec.left), sc = Math.floor(sw / this.render.SPACE_WIDTH);

			if (sl === 0 && sc < 5 && e_arr[ec.index].type !== Text._Element.Type.NEWLINE) {
				var range = this.wordSeg.getRange(e_arr, ec.index);
				this._setCaret(this.cur_page.selectByIndex(range.from, range.to));
				this.render.paint();
			} else if(this.floated!==true) {
				var s_str = "";
				for (var i = 0; i < sl; i++) {
					s_str += "\n";
				}
				for (var i = 0; i < sc; i++) {
					s_str += " ";
				}
				this._setCaret(ec);
				this.insert(s_str);
			}

		},
		_tplclick_handler : function(p) {
			var para = this.cur_page.getParaIndex_xy(p.x, p.y);
			this._setCaret(this.cur_page.selectParaByIndex(para));
			this.render.paint();
		},

		initEvent : function() {
			this.initShortKey();

			this.__left_mouse_down__ = false;
			this.__right_mouse_down__ = false;
			this.__pre_pos__ = null;
			this.__ime_on__ = false;
			this.__ime_check__ = null;
			this.__ime_preval__ = "";

			if ( typeof this.canvas.setCapture === 'function') {

				$.addEvent(this.canvas, 'mousedown', $.createDelegate(this, this._mousedown_handler));
				$.addEvent(this.canvas, 'mouseup', $.createDelegate(this, this._mouseup_handler));
				$.addEvent(this.canvas, 'mousemove', $.createDelegate(this, this._mousemove_handler));

			} else {
				this.__cmv_handler = $.createDelegate(this, this._chrome_mousemove_handler);
				//$.log(this.__cmv_handler)
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
			$.addEvent(this.caret, 'mouseup', $.createDelegate(this, this._mouseup_handler));
			$.addEvent(this.caret, 'blur', $.createDelegate(this, this._blur_handler));
			$.addEvent(this.caret, "keydown", $.createDelegate(this, this._keydown_handler));

			/**
			 * 下面的代码处理IME事件。IME事件的标准事件是三个： compositionstart, compositionupdate, compositionend
			 * 分别对应开始输入，输入过程的修改，输入确定。但是现在只有firefox支持完善，其它浏览器都在处理上有问题。详情见下面代码注释。
			 * 与此同时，在chrome, safri和ie9下面有input事件对应compositionupdate和textInput（ie9下是textinput）事件对应
			 * compositionend事件，并且处理完善。
			 *
			 * 下面的代码有冗余的地方，可以先判断需要加载的事件的名称再加载事件（节省代码大小）。但为了逻辑上的可读性，没有精简代码。
			 */
			if ($.opera) {
				/**
				 * opera不支持IME的相关事件, 使用window.setInterval来检测文字输入过程中的变化
				 */
				$.addEvent(this.caret, 'input', $.createDelegate(this, this._textinput_handler));
			} else {
				this._compositionend_timeout = $.createDelegate(this, this._compositionend_timeout_handler);
				$.addEvent(this.caret, 'compositionstart', $.createDelegate(this, this._compositionstart_handler));
				if ($.chrome || $.safri) {
					/**
					 * chrome和safri下面中文符号如句号逗号的输入不能触发compositionend事件，所以使用textInput事件代替
					 * 同时esc键不能触发compositionupdate事件，使用input事件代替.
					 */
					$.addEvent(this.caret, 'textInput', $.createDelegate(this, this._compositionend_handler))
					$.addEvent(this.caret, 'input', $.createDelegate(this, this._compositionupdate_handler));
				} else if ($.ie) {
					/**
					 * ie9下面如果使用compositionupdate事件会有奇怪的bug，输入过程中会闪烁。使用input事件。
					 * ie9下面compositionend和textinput表现完全等价，可以任意使用。
					 */
					$.addEvent(this.caret, 'compositionend', $.createDelegate(this, this._compositionend_handler))
					$.addEvent(this.caret, 'input', $.createDelegate(this, this._compositionupdate_handler));
				} else {
					/**
					 * firefox下面使用 ime事件
					 */
					$.addEvent(this.caret, 'compositionend', $.createDelegate(this, this._compositionend_handler))
					$.addEvent(this.caret, 'compositionupdate', $.createDelegate(this, this._compositionupdate_handler));
					$.addEvent(this.caret, 'keypress', $.createDelegate(this, this._keypress_handler));
				}

			}
			/**
			 * chrome 和 safri可以使用copy, cut, paste事件操作剪贴板。
			 * firefox和ie当input为空时ctrl-c不能触发copy事件，只通过检测按键来实现。但firefox粘贴空数据也能触发ctrl-v，所以使用paste事件
			 * opera 没有copy, cut, paste事件，也 只通过检测按键来实现。
			 */
			if ($.chrome || $.safri) {
				$.addEvent(this.caret, 'copy', $.createDelegate(this, this._copy_handler));
				$.addEvent(this.caret, 'cut', $.createDelegate(this, this._cut_handler));
				$.addEvent(this.caret, 'paste', $.createDelegate(this, this._paste_handler));
			} else if ($.firefox) {
				$.addEvent(this.caret, 'paste', $.createDelegate(this, this._firefox_paste_handler));
			}

			$.addEvent(this.canvas, 'contextmenu', function(e) {
				$.stopEvent(e);
			});

			$.addEvent(this.canvas, "dragenter", $.createDelegate(this, this._stop_handler));
			$.addEvent(this.canvas, "dragexit", $.createDelegate(this, this._stop_handler));
			$.addEvent(this.canvas, "dragover", $.createDelegate(this, this._stop_handler));
			$.addEvent(this.canvas, "drop", $.createDelegate(this, this._drop_handler));
		}
		
	});
	/**MODULE END**/
})(Daisy.Text, Daisy.$); 