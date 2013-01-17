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
        this.ig = false;// 是否忽略大小写
        this.yydefault = "plain";
        this.yystyle = null;
        this.yyidx  = 0;
        this.yylen = 0;
        this.TABLE = null;
        this.sync = null;
        this.is_sync = false;
        this.post_lex_task = null;
        this.pre_idx = 0;
    }
    D._LexerBase.prototype = {
        read_ch : function() {
            if(this.idx >= this.end)
                return this.chr = -1;
            else {
                this.chr = this.src.charCodeAt(this.idx++);
                if(this.ig && this.chr >= 65 && this.chr <= 90)
                    this.chr += 32;
                else if(this.is_sync && this.chr === 10) { // chr === '\n'
                    this.sync.delta_step++;
                }
                return this.chr;
            }
        },
        action : function(action) {
            //do nothing, must be overwrite
            throw "must be overwrite";
        },
        do_lex : function() {
            var go_on = true, t_s, c_s;
            this.idx = this.cur_idx;
            if(this.is_sync) {
                t_s = new Date().getTime();
                c_s = t_s;
            }

            while(go_on) {
                var yylen = 0;
                var state = this.i_s, action = ACT_TYPE.NO_ACTION;
                var yyidx = this.idx, pre_action = ACT_TYPE.NO_ACTION, pre_act_len = 0;

                while(true) {
                    if(this.read_ch() < 0) {
                        if(pre_action >= 0) {
                            action = pre_action;
                            yylen = pre_act_len;
                            this.idx = yyidx + pre_act_len;
                        } else if(yyidx < this.end) {
                            action = ACT_TYPE.UNMATCH_CHAR;
                            this.idx = yyidx + 1;
                        }
                        if(yyidx >= this.end) {
                            go_on = false;
                            if(this.is_sync) {
                                this.sync.finished = true;
                            }
                        }
                        break;
                    } else {
                        yylen++;
                    }
                    var eqc = this.TABLE._eqc[this.chr];

                    if(eqc === undefined) {
                       continue;
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
                            this.idx = yyidx + pre_act_len;
                        } else {
                            action = ACT_TYPE.UNMATCH_CHAR;
                            this.idx = yyidx + 1;
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
                this.yyidx = yyidx;
                this.yylen = yylen;
                this.action(action);
                this.style_callback(this.yyidx, this.yylen, this.yystyle);

                if(this.is_sync && go_on) {
                    c_s = new Date().getTime();
                    if(c_s - t_s >= this.sync.break_time) {
                        go_on = false;
                    }
                }
            }

        },
        yy_pre_idx : function(idx) {
            this.pre_idx = idx;
            if(this.is_sync) {
                this.sync.pre_idx = idx;
            }
        },
        yygoto : function(state) {
            this.i_s = state;
        },
        yytask : function(idx, len, lexer_name) {
            var t = {
                start : idx,
                end : idx + len - 1,
                lexer_name : lexer_name
            };
            this.post_lex_task.unshift(t);
        },
        /**
         *
         * @param src 源文本
         * @param style_callback 设置区域的格式的回调函数，用来通知lighter设置文本的颜色格式
         */
        lex : function(argv) {
            this.src = argv.src;
            this.style_callback = argv.style_callback;
            this.end = argv.end;
            this.i_s = this.START_ACTION;
            this.is_sync = false;
            this.post_lex_task = argv.post_lex_task;
            this.pre_idx = argv.pre_idx;
            this.cur_idx = argv.cur_idx;
            this.do_lex();
        },
        sync_lex : function(sync_lex_info) {
            this.sync = sync_lex_info;
            var s = this.sync;
            this.src = s.src;
            this.post_lex_task = s.post_lex_task;
            this.is_sync = true;
            this.pre_idx = s.pre_idx;
            this.style_callback = s.style_callback;
            this.end = s.end;
            this.cur_idx = s.cur_idx;
            if(s.finished) {
                return;
            }
            s.delta_step = 0;
            this.do_lex();
            s.cur_idx = this.idx;
            return s.delta_step;
        }

    }
})(dLighter._Lexer, dLighter.$);
