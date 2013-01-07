/**
 * User: xiaoge
 * At: 12-12-26 5:51
 * Email: abraham1@163.com
 * File: NodeJS文件，对js项目进行压缩
 */
(function(){

    var fs = require('fs');
    var exec = require("child_process").exec;

    function copy(origin,target) {
        if(!fs.existsSync(origin) || !fs.statSync(origin).isFile()){
            console.log("nothing to copy.");
        } else {
            fs.writeFileSync(target, fs.readFileSync(origin, ''));
            console.log("copied "+origin +" to "+target);
        }
    }

    var $ = {
        log : function(msg) {
            console.log(msg);
        }
    };

    var global_file = "src/core/utility.js";
	var core_file = ['src/core/dom.js','src/core/lighter.js',
			'src/core/page.js','src/core/render.js',
			'src/core/measure.js','src/core/scheduler.js',
			'src/core/scroll.js', 'src/core/theme.js',
			'src/core/event.js', 'src/core/caret.js',
			'src/core/shortkey.js', 'src/core/wordseg.js',
			'src/core/lexer.js', 'src/core/lexer_base.js'];
	var lex_file = ['src/lexer/lexer_js.js'];
	var theme_file = ['src/theme/dlighter.js'];


    $.log("build begin...");
    var s_time = new Date().getTime();

	var cnt = fs.readFileSync(global_file,"utf8");
	
	core_file.forEach(function(val,idx,arr){
		cnt += fs.readFileSync(val,"utf8");
	});
	lex_file.forEach(function(val, idx, arr){
		cnt += fs.readFileSync(val, "utf8");
	});
	theme_file.forEach(function(val, idx, arr){
		cnt += fs.readFileSync(val, "utf8");
	});
	fs.writeFileSync("build/dlighter.js", cnt, 'utf8');

    $.log("dlighter.js complete.")

    var exec_num = 0, exec_total = 2;
    var out_func = function(err, sout, serr) {
        if(sout.length>0) {
            console.log(sout);
        }
        if(serr && serr.length>0) {
            console.log(serr);
        }
        if(err && err.length>0) {
            console.log(err);
        }
        /**
         * 每执行一个yui的压缩，则exec_num+1，如果exec_num=exec_total说明
         * 压缩任务全部执行结束，可以将文件拷贝到plugin目录下。
         */
        exec_num++;
        if(exec_num === exec_total) {
            copy("build/dlighter.js", "wp_plugin/dLighter/dlighter.js");
            copy("build/dlighter.min.css", "wp_plugin/dLighter/dlighter.min.css");
            copy("build/dlighter.min.js", "wp_plugin/dLighter/dlighter.min.js");
            console.log("wp_plugin complete.");
            console.log("build finish! total time:" + (new Date().getTime() - s_time));
        }
    };

    copy("src/dLighter.css", "build/dlighter.css");
    $.log("dlighter.css complete.")

    exec("java -jar tools/yuicompressor.jar build/dlighter.js -o build/dlighter.min.js", function(err, st, se) {
        $.log("dlighter.min.js complete.");
        out_func(err, st, se);
    });
    exec("java -jar tools/yuicompressor.jar build/dlighter.css -o build/dlighter.min.css", function(err, st, se) {
        $.log("dlighter.min.js complete.");
        out_func(err, st, se);
    });

})();

