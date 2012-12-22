/**
 * User: xiaoge
 * At: 12-12-21 11:08
 * Email: abraham1@163.com
 */
(function(D, $) {
    var ACT_TYPE = {
        NO_ACTION : -1,
        UNKNOW_CHAR : -2,
        UNMATCH_CHAR : -3
    };

    D._LexerBase = function() {
        this.src = null;
        this.end = 0;
        this.idx = 0;
        this.chr = -1;
        this.START_ACTION = 0;
        this.i_s = 0;
        this.yydefault = "default";
        this.yystyle = null;
        this.TABLE = null;
    }
    D._LexerBase.prototype = {
        read_ch : function() {
            if(this.idx >= this.end)
                return this.chr = -1;
            else {
                return this.chr = this.src.charCodeAt(this.idx++);
            }
        },
        action : function(action) {
            //do nothing
        },
        do_lex : function() {
            var go_on = true;
            this.idx = 0;
            while(go_on) {
                var yylen = 0;
                var state = this.i_s, action = ACT_TYPE.NO_ACTION;
                var pre_idx = this.idx, pre_action = ACT_TYPE.NO_ACTION, pre_act_len = 0;

                while(true) {
                    if(this.read_ch() < 0) {
                        if(pre_action >= 0) {
                            action = pre_action;
                            yylen = pre_act_len;
                            this.idx = pre_idx + pre_act_len;
                        } else if(pre_idx < this.end) {
                            action = ACT_TYPE.UNMATCH_CHAR;
                            this.idx = pre_idx + 1;
                        }
                        if(pre_idx >= this.end) {
                            go_on = false;
                        }
                        break;
                    } else {
                        yylen++;
                    }
                    var eqc = this.TABLE._eqc[this.chr];

                    if(eqc === undefined) {
                        if(pre_action >= 0) {
                            action = pre_action;
                            yylen = pre_act_len;
                            this.idx = pre_idx + pre_act_len;
                        } else
                            action = ACT_TYPE.UNKNOW_CHAR;
                        break;
                    }
                    var offset, next = -1, s = state;

                    while(s >= 0) {
                        offset = this.TABLE._base[s] + eqc;
                        if(this.TABLE._check[offset] === s) {
                            next = this.TABLE._next[offset];
                            break;
                        } else {
                            s = this.TABLE._default[s];
                        }
                    }

                    if(next < 0) {
                        if(pre_action >= 0) {
                            action = pre_action;
                            yylen = pre_act_len;
                            this.idx = pre_idx + pre_act_len;
                        } else {
                            action = ACT_TYPE.UNMATCH_CHAR;
                            this.idx = pre_idx + 1;
                        }
                        //跳出内层while，执行对应的action动作
                        break;
                    } else {
                        state = next;
                        action = this.TABLE._action[next];
                        if(action >= 0) {
                            /**
                             * 如果action>=0，说明该状态为accept状态。
                             */
                            pre_action = action;
                            pre_act_len = yylen;
                        }
                    }
                }

                this.action(action);
                this.style_callback(pre_idx, yylen, this.yystyle);
            }

        },
        yygoto : function(state) {
            this.i_s = state;
        },
        /**
         *
         * @param src 源文本
         * @param style_callback 设置区域的格式的回调函数，用来通知lighter设置文本的颜色格式
         * @param paint_callback 重绘区域的回调函数，用来通知lighter我重绘显示区域。当前是在lex工作结束后调用。
         * todo 如果src文本巨大会导致卡，可以将文本分段，使用setTimeout来实现，每渲染一段调用一次paint_callback
         */
        lex : function(src, style_callback, paint_callback) {
            this.src = src;
            this.style_callback = style_callback;
            this.paint_callback = paint_callback;
            this.end = this.src.length;
            this.i_s = this.START_ACTION;
            this.do_lex();
            this.paint_callback();
        }
    }
})(dLighter._Lexer, dLighter.$);
