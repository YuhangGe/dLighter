(function(D, $){
	$.extend(D._Lighter.prototype, {
		initCaret : function(){
			this.caret_interval = null// window.setInterval(, 1000);
			this.caret_timeout = null;
			this.caret_show = false;
			this.caret_flashing = false;
			this.caret_data = null;
			this.caret_flash_delegate = $.createDelegate(this, this._caretFlash);
			this.caret_delegate = $.createDelegate(this, this._resetCaret);
			this.caret_focus_delegate = $.createDelegate(this, function(){
				this.caret.focus();
			});
		 
		},
		_caretFocus : function(){
			//$.log('focus')
			this.caret.focus();
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
			    this.render._showCaret(this.caret_left,this.caret_top, 1, this.caret_height, "white");
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
			this.caret_left = this.caret_pos.left- this.scroll_left;
			this.caret_top = this.caret_pos.top - this.scroll_top;
			this.caret.style.top = this.caret_top + 'px';
            this.caret_data = this.render.ctx.getImageData(this.caret_left-1, this.caret_top-1, 3, this.caret_height+2);
			if(this.focused){
				this._caretBeginFlash();
			}
			this.caret_timeout = null;
		}
	});
	
})(dLighter._Core, dLighter.$);
