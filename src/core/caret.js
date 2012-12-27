(function(D, $){
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
