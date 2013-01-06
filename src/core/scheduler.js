/**
 * User: xiaoge
 * At: 12-12-28 10:41
 * Email: abraham1@163.com
 * File : 对海量文本进行lex和measure时的调度逻辑
 */
(function(D, $) {
    D._Scheduler = function(lighter) {
        this.GAP = 1800; //由于lex的速度远远高于measure，设定当lex的行数超过measure的行数的1800行后就执行measure，否则连续执行lex
        this.BREAK_TIME = 280; //每次执行时间不应该超过280毫秒
        this.measure_step = 0;
        this.lex_step = 0;
        this.lighter = lighter;
        this.lexer = lighter.lexer;
        this.page = lighter.cur_page;
        this.render = lighter.render;
        this.s_delegate = $.createDelegate(this, this._scheduleHandler);
        this.s_timeout = null;
    }
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
            if(this.page.para_info.length < this.GAP) {
                this._directSchedule();
            } else {
                this.stopFuck();
                this._syncSchedule();
            }
        },
        _directSchedule : function() {
            this.lighter.lexer.lex(this.page.text, this.page.style_delegate);
            this.page._measure();
            this.lighter.resize();
            this.render.paint();
        },
        _syncSchedule : function() {
            this.measure_step  = 0;
            this.lex_step = 0;
            this.lexer = this.lighter.lexer;
            this.page = this.lighter.cur_page;
            this.lexer.sync.init(this.page.para_info.length, this.page.text, this.page.style_delegate);
            this.page.sync.init(this.page.para_info.length);
            this._scheduleHandler();
        },
        _scheduleHandler : function() {
            if(this.page.sync.finished && this.lexer.sync.finished) {
//                $.log("both finished. return.");
                this._adjust();
                this.s_timeout = null;
                return;
            } else if(this.page.sync.finished) {
//                $.log("measure finished. do lexer");
                this.lexer.sync.go(this);
            } else if(this.lexer.sync.finished) {
//                $.log("lexer finished. do measure");
                this.page.sync.go(this);
                this._adjust();
            } else if(this.lex_step - this.measure_step >= this.GAP){
//                $.log("lexer has go ahead. do measure");
                this.page.sync.go(this);
                this._adjust();
            } else {
//                $.log("measure has come on. do lexer");
                this.lexer.sync.go(this);
            }
            this.s_timeout = window.setTimeout(this.s_delegate, 100);
        },
        _adjust : function() {
            this.lighter.resize();
            this.render.paint();
//            $.log("paint");
        }
    }
})(dLighter._Core, dLighter.$);