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
        this.yydefault = "plain";
        this.yystyle = null;
        this.TABLE = null;
        this.sync = {
            finished : false,
            go : $.createDelegate(this, this._syncLex),
            init :$.createDelegate(this, this._syncInit),
            cur_step : 0,
            total_step : 0,
            cur_idx : 0,
            cur_para : 0
        };
    }
    D._LexerBase.prototype = {
        read_ch : function() {
            throw "must be overwrite";
        },
        action : function(action) {
            //do nothing, must be overwrite
            throw "must be overwrite";
        },
        do_lex : function(sync, b_time) {
            var go_on = true, t_s, c_s;
            this.idx = 0;
            if(sync) {
                t_s = new Date().getTime();
                c_s = t_s;
                this.idx = this.sync.cur_idx;
            }

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
                            this.sync.finished = true;
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

                this.yystyle = this.yydefault;
                this.action(action);
                this.style_callback(pre_idx, yylen, this.yystyle);

                if(sync && go_on) {
                    c_s = new Date().getTime();
                    if(c_s - t_s >= b_time) {
                        go_on = false;
                    }
                }
            }

        },
        yygoto : function(state) {
            this.i_s = state;
        },
        /**
         *
         * @param src 源文本
         * @param style_callback 设置区域的格式的回调函数，用来通知lighter设置文本的颜色格式
         */
        lex : function(src, style_callback) {
            this.src = src;
            this.style_callback = style_callback;
            this.end = this.src.length;
            this.i_s = this.START_ACTION;
//            var d = new Date().getTime();
            this.do_lex(false);
//            $.log("lex time:%s", new Date().getTime()-d);
        },
        _syncLex : function(scheduler) {
            var s = this.sync;
            if(s.finished) {
                scheduler.measure_step = s.total_step;
                return;
            }
            this.do_lex(true, scheduler.BREAK_TIME);
            s.cur_idx = this.idx;
            s.cur_step = s.cur_para;
            scheduler.lex_step = s.cur_step;
        },
        _syncInit : function(total_step, src, style_callback) {
            this.sync.finished = false;
            this.sync.cur_step = 0;
            this.sync.total_step = total_step;
            this.sync.cur_idx = 0;
            this.src = src;
            this.style_callback = style_callback;
            this.end = this.src.length;
            this.i_s = this.START_ACTION;
        }
    }
})(dLighter._Lexer, dLighter.$);
