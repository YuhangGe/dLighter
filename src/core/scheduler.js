/**
 * User: xiaoge
 * At: 12-12-28 10:41
 * Email: abraham1@163.com
 * File : 对海量文本进行lex和measure时的调度逻辑
 */
(function(D, $) {
    D._Scheduler = function(lighter) {
        this.measure_step = 0;
        this.lex_step = 0;
        this.lighter = lighter;
        this.lexer = lighter.lexer;
        this.page = lighter.cur_page;
        this.render = lighter.render;
        this.s_delegate = $.createDelegate(this, this._scheduleHandler);
        this.post_delegate = $.createDelegate(this, this._postTaskHandler);
        this.s_timeout = null;
        this.post_lex_task = [];
        /**
         * sync_lex_info是异步lex时需要传给lexer的上下文信息。
         * 因为lexer是单例模式，即每类lexer的实例只有一个，
         * 当页面有几个不同的lighter的schedular在同时处理大文本时，
         * 调用lexer进行异步lex的时候就要把上下文传给lexer，
         * lexer会在lex的过程中修改上下文并返回，这样可以保证多个lighter之间不会相互影响。
         *
         * finished:当前lex工作是否已经全部完成
         * delta_step:这一次调用的lex过程实际处理了多少个段落。
         * src:需要lex的文本
         * cur_idx:当前lex从文本的哪个位置开始
         * break_time:这一次的lex过程最多允许执行多少时间（就必须返回以防止卡住导致用户体验不佳）
         * style_callback: 每match一段文本需要调用的设置该文本的颜色格式的回调函数。该函数在Daisy._Page中。
         * end:当前lex到文本的哪个位置结束
         * post_task:后继任务队列。比如html文档中嵌入的script脚本或php脚本段，就需要向post_task中添加后续任务，
         *           在当前lex工作结束后会继续调用其它lexer处理嵌入的文本。
         * pre_idx : 保存嵌入脚本的开始文本位置。这个参数是辅助参数。
         *           当lexer检测到嵌入脚本结束时，通过这个参数得到嵌入脚本的开始位置。
         */
        this.sync_lex_info = {
            finished : false,
            delta_step : 0,
            src : null,
            cur_idx : 0,
            break_time : D._Scheduler.BREAK_TIME,
            style_callback : this.page.style_delegate,
            end : 0,
            post_lex_task : this.post_lex_task,
            pre_idx : 0
        }
    }
    D._Scheduler.GAP = 800; //由于lex的速度远远高于measure，设定当lex的行数超过measure的行数的800行后就执行measure，否则连续执行lex
    D._Scheduler.BREAK_TIME = 30; //每次执行时间不应该超过20毫秒
    D._Scheduler.prototype = {
        /**
         * 这个函数名只是为了发泄下下～
         * 同时为了不和类名过于类似
         */
        fuck : function() {
            this.schedule();
        },
        stopFuck : function() {
            if(this.s_timeout!==null) {
                this.post_lex_task.length  = 0;
                window.clearTimeout(this.s_timeout);
                this.s_timeout = null;
            }
        },
        schedule : function() {
            /**
             * 如果文本小于两千行，则直接进行lex和measure，否则使用异步的方法防止浏览器卡住。
             * 两千行只是大概的取值，假设每一行的文本不超过100个字符，
             * 因为代码很难出现一行代码有上千上万行字符的情况。
             * 如果故意出现这种情况，也只能等着浏览器卡住了。
             */
            if(this.page.para_info.length < D._Scheduler.GAP) {
                this._directSchedule();
            } else {
                this.stopFuck();
                this._syncSchedule();
            }
        },
        _directSchedule : function() {

            var pt = this.post_lex_task;
            pt.length = 0;
            /*
             * lex_info的说明同this.sync_lex_info
             */
            var p = this.page, lex_info = {
                src : p.text,
                end : p.text.length,
                style_callback: p.style_delegate,
                break_time : D._Scheduler.BREAK_TIME,
                post_lex_task : pt,
                pre_idx : 0,
                cur_idx : 0
                }, lexer = this.lighter.lexer;

            lexer.lex(lex_info);
            while(pt.length>0) {
                var t = pt.pop();
                lexer = dLighter._Lexer.get(t.lexer_name);
                lex_info.cur_idx = t.start;
                lex_info.end = t.end;
                lexer.lex(lex_info);
            }

            this.page._measure();
            this.lighter.resize();
            this.render.paint();
        },
        _syncSchedule : function() {
            this.measure_step  = 0;
            this.lex_step = 0;
            this.lexer = this.lighter.lexer;
            this.page = this.lighter.cur_page;
//            this.lexer.sync.init(D._Scheduler.BREAK_TIME, this.page.text, this.page.style_delegate);
            var s = this.sync_lex_info;
            s.finished = false;
            s.src = this.page.text;
            s.end = this.page.text.length;
            s.cur_idx = 0;
            s.post_task.length = 0;
            s.pre_idx = 0;
            this.page.sync.init(D._Scheduler.BREAK_TIME);
            this._scheduleHandler();
        },
        _scheduleHandler : function() {
            if(this.page.sync.finished && this.sync_lex_info.finished) {
//                $.log("both finished. return.");
                this._adjust();
                if(this.post_lex_task.length>0) {
                    this.sync_lex_info.finished = false;
                    this.s_timeout = window.setTimeout(this.post_delegate, 0);
                } else {
                    this.s_timeout = null;
                }
                return;
            } else if(this.page.sync.finished) {
//                $.log("measure finished. do lexer");
                this.lex_step += this.lexer.sync_lex(this.sync_lex_info);
//                $.log(this.lex_step);
            } else if(this.sync_lex_info.finished) {
//                $.log("lexer finished. do measure");
                this.measure_step += this.page.sync.go();
//                $.log(this.measure_step);
                this._adjust();
            } else if(this.lex_step - this.measure_step >= D._Scheduler.GAP){
//                $.log("lexer has go ahead. do measure");
                this.measure_step += this.page.sync_lex(this.sync_lex_info);
//                $.log(this.measure_step);
                this._adjust();
            } else {
//                $.log("measure has come on. do lexer");
                this.lex_step += this.lexer.sync_lex(this.sync_lex_info);
//                $.log(this.lex_step);

            }
            this.s_timeout = window.setTimeout(this.s_delegate, 0);
        },
        _postTaskHandler : function() {
            var s = this.sync_lex_info, pt = this.post_lex_task,t;
            if(s.finished && pt.length===0) {
                this.s_timeout = null;
                this.render.paint();
                return;
            } else if(s.finished) {
                t = pt.pop();
                s.finished = false;
                s.cur_idx = t.start;
                s.end = t.end;
                this.lexer = dLighter._Lexer.get(t.lexer_name);
            }
            this.lexer.sync_lex(s);
            this.s_timeout = window.setTimeout(this.post_delegate, 0);
        },
        _adjust : function() {
            this.lighter.resize();
            this.render.paint();
        }
    }
})(dLighter._Core, dLighter.$);