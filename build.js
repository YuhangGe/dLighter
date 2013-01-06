/**
 * User: xiaoge
 * At: 12-12-26 5:51
 * Email: abraham1@163.com
 * File: NodeJS文件，对js项目进行压缩
 */
(function(){
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
	var fs = require("fs");
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

	console.log("build finish!");
})();

