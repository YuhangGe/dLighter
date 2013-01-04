/**
 * User: xiaoge
 * Date: 12-12-19 8:58
 * Email: abraham1@163.com
 * File: 滚动条处理
 */
(function(D, $) {
	D._Scroll = function(scroll_button, type){
		this.s_btn = scroll_button;
        this.type = type ? type : 'ver';// type: hor或者ver ，代表水平或垂直滚动条
        if(this.type !== 'ver' && this.type !== 'hor') {
            throw "unknow type of scroll bar at Scroll";
        }
		this.s_btn_lengh = 0;
		this.s_bar = scroll_button.parentElement;
		this.s_max = 0;
		this.s_value = 0;
		this.s_length = 0;
		this.s_list = [];
		this.wheel_handler = $.createDelegate(this, this._scrollwheel_handler);
		this._scroll_down_ = false;
		this.s_disable = false;
		this._initEvent();
	}

	D._Scroll.prototype = {
		setDisable : function(disable){
			if(disable===true){
				this.s_disable = true;
				this.s_btn.style.display = "none";
			} else {
				this.s_disable = false;
				this.s_btn.style.display = "block";
			}
		},
		setSize : function(breadth, length){
			this.setBreadth(breadth);
			this.setLength(length);
		},
        /*
         * 设置宽窄，对于水平滚动条，是设置高度，对于垂直滚动条是设置宽度
         */
		setBreadth : function(breadth){
            if(this.type==='ver') {
                this.s_bar.style.width = this.s_btn.style.width = breadth + "px";
            } else {
                this.s_bar.style.height = this.s_btn.style.height = breadth + "px";
            }
		},
        /*
         * 设置长度，对于水平滚动条，是设置宽度，对于垂直滚动条是设置高度
         */
		setLength : function(length){
            this.s_btn_lengh = Math.round(length / 5);
            if(this.s_btn_lengh<5) {
                this.s_btn_lengh = 5;
            } else if(this.s_btn_lengh>200) {
                this.s_btn_lengh = 200;
            }
            this.s_length = length - this.s_btn_lengh;
            this.s_max = length;
            if(this.type === 'ver') {
                this.s_bar.style.height = length + 'px';
                this.s_btn.style.height = this.s_btn_lengh + 'px';
            } else {
                this.s_bar.style.width = length + 'px';
                this.s_btn.style.width = this.s_btn_lengh + 'px';
            }

		},
		show : function(visible){
			this.s_bar.style.display = "block";
		},
		hide : function(){
			this.s_bar.style.display = "none";
		},
		addListener : function(listener){
			for(var i=0;i<arguments.length;i++){
				this.s_list.push(arguments[i]);
			}
		},
		attachWheelEvent : function(element){
            if(this.type === 'hor')
                return;
			for(var i=0;i<arguments.length;i++){
                $.log(arguments[i])
				$.addWheelEvent(arguments[i], this.wheel_handler);
			}
		},
		_initEvent : function(){
			if ( typeof this.s_bar.setCapture === 'function') {
			
				$.addEvent(this.s_bar, 'mousedown', $.createDelegate(this, this._scrolldown_handler));
				$.addEvent(this.s_bar, 'mouseup', $.createDelegate(this, this._scrollup_handler));
				$.addEvent(this.s_bar, 'mousemove', $.createDelegate(this, this._scrollmove_handler));
			
			} else {
				this.__scroll_move_handler = $.createDelegate(this, this._chrome_scrollmove_handler);
				this.__scroll_up_handler = $.createDelegate(this, this._chrome_scrollup_handler);
			
				$.addEvent(this.s_bar, 'mousedown', $.createDelegate(this, this._chrome_scrollclick_handler));
				$.addEvent(this.s_btn, 'mousedown', $.createDelegate(this, this._chrome_scrolldown_handler));
			
			}
		},
		setScrollMax : function(value){
			this.s_max = value;
		},
		scrollDelta : function(value){
			this.scroll(this.s_value + value);
		},
		scroll : function(value){
			if(typeof value !== 'number'){
				return this.s_value;
			}
			this.s_value = value < 0 ? 0 : (value > this.s_max ? this.s_max : value);
			this.s_btn.style.top = Math.round(this.s_value/this.s_max*this.s_length) + "px";
//            for(var i=0;i<this.s_list.length;i++){
//                this.s_list[i].onScrollValue(this.type, this.s_value);
//            }
		},
		_scroll : function(top){
			//$.log("%s,%s",top, this.s_length)
			top = top < 0 ? 0 : (top>this.s_length ? this.s_length : top);
			this.s_value = Math.round(top / this.s_length * this.s_max);
			if(this.type==='ver') {
                this.s_btn.style.top = top + "px";
            } else {
                this.s_btn.style.left = top + "px";
            }
			for(var i=0;i<this.s_list.length;i++){
                this.s_list[i].onScroll(this.type, this.s_value);
			}
		},
		scrollToMax : function() {
			this.scroll(this.s_max);
		},
		_scrolldown_handler : function(e){
			if(this.s_disable === false && e.button===0){
				if(e.target === this.s_btn){
					this._deal_scrolldown(e, false);
					this.s_bar.setCapture(true);
				} else {
					this._deal_scrollclick(e, false);
				}
				
			}
		},
		_chrome_scrolldown_handler : function(e){
			if(this.s_disable === false && e.button===0){
				this._deal_scrolldown(e, true);
				
				$.addEvent(window, 'mousemove', this.__scroll_move_handler);
				$.addEvent(window, 'mouseup', this.__scroll_up_handler);
			}
		},
		_chrome_scrollclick_handler : function(e){
			if(this.s_disable === false)
				this._deal_scrollclick(e, true);
		},
		_deal_scrollclick : function(e, is_chrome){
			var y = (this._getScrollOffset(e, is_chrome) > (this.type==='ver' ? this.s_btn.offsetTop : this.s_btn.offsetLeft)) ? 1 : -1;
            //$.log(y);
            this._scroll((this.type ==='ver' ? this.s_btn.offsetTop : this.s_btn.offsetLeft) + y * 50 );
			$.stopEvent(e);
		},
		_deal_scrolldown : function(e, is_chrome){
            var ot = is_chrome ? 0 : (this.type === 'ver' ? this.s_btn.offsetTop : this.s_btn.offsetLeft);
			this._scroll_down_ = true;
			this._pre_scroll_y = this._getScrollOffset(e, is_chrome) + ot;
			this._pre_scroll_top = ot;
			$.stopEvent(e);
		},
		_chrome_scrollmove_handler : function(e){
			if(this.s_disable === false && e.button===0){
				this._deal_scrollmove(e, true);
			}
		},
		_scrollmove_handler : function(e){
		
			if(e.button===0 && this._scroll_down_){
					//$.log('m')
				this._deal_scrollmove(e, false);
			}
		},
		_deal_scrollmove : function(e, is_chrome){
			//$.log('m')
			//$.log(this._pre_scroll_top + this._getScrollY(e, is_chrome) - this._pre_scroll_y)
			this._scroll(this._pre_scroll_top + this._getScrollOffset(e, is_chrome) - this._pre_scroll_y);
			$.stopEvent(e);
		},

		_chrome_scrollup_handler : function(e){
			if(e.button===0 && this._scroll_down_){
				this._scroll_down_ = false;
				$.delEvent(window, 'mousemove', this.__scroll_move_handler);
				$.delEvent(window, 'mouseup', this.__scroll_up_handler);
				$.stopEvent(e);
			}
		},
		_scrollup_handler : function(e){
			if(e.button===0 && this._scroll_down_){
				this._scroll_down_ = false;
				this.s_bar.releaseCapture(true);
			}
			
		},
		
		_scrollwheel_handler : function(e){
//			$.log('wheel')

			if(this.s_disable || e.ctrlKey || e.metaKey)
				return;
			var	deltaX = NaN, deltaY = NaN;
			if(typeof e.wheelDeltaX !== 'undefined') {
				deltaX = e.wheelDeltaX / 6;
                deltaY = e.wheelDeltaY / 6;
            } else if(typeof e.wheelDelta !== 'undefined') {
                deltaY = e.wheelDelta / 6;
            } else if(e.detail) {
                deltaY = -e.detail * 10;
            }
            var delta = this.type === 'hor' ? deltaX : deltaY;
            if(delta === NaN) {
                return;
            }else if(delta>0 && this.s_value===0) {
                return;
            } else if(delta<=0 && this.s_value===this.s_max) {
                return;
            }
            $.stopEvent(e);

            this._scroll(this.s_btn.offsetTop - delta);
			
		},
		_getScrollOffset : function(e, is_chrome) {
			var y = 0, x = 0;
//			if (is_chrome) {
//				var off = $.getOffset(this.s_bar);
//				y = e.y - off.top  + document.body.scrollTop;
//			} else
            if ( typeof e.offsetX !== 'undefined') {
				y = e.offsetY;
                x = e.offsetX;
			} else if ( typeof e.x !== 'undefined') {
				y = e.y
                x = e.x;
			} else if ( typeof e.layerX !== 'undefined') {
				y = e.layerY;
                x = e.layerX;
			} else {
				throw "no y in event(_getScrollOffset)";
			}
			//$.log('y:%s',y);
            //$.log("%s,%s",y,x);
			return (this.type === 'ver' ? y : x);
		}
	}
	
})(dLighter._Core, dLighter.$);
