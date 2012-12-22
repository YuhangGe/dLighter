/**
 * User: xiaoge
 * At: 12-12-21 10:58
 * Email: abraham1@163.com
 */
(function(D, $) {
    $.extend(D, {
       _str_to_arr : function(strs, arrs) {
            for(var j = 0; j < strs.length; j++) {
                var str = strs[j], arr = arrs[j], t = str.charCodeAt(0), len = str.length, c = 0;
                for(var i = 1; i < len; i++) {
                    if(t === 0)
                        arr[i - 1] = str.charCodeAt(i) - 1;
                    else {
                        var n = str.charCodeAt(i) - 1, v = str.charCodeAt(i + 1) - 1;
                        for(var k = 0; k < n; k++) {
                            arr[c] = v;
                            c++;
                        }
                        i++;
                    }
                }
            }
        },
        _lexer_hash : {},
        register : function(lexer) {
            var ns = lexer.name.split(",");
            for(var i=0;i<ns.length;i++) {
                this._lexer_hash[ns[i].trim()] = lexer.instance;
            }
        },
        get : function(name) {
            if(this._lexer_hash[name]) {
                return this._lexer_hash[name];
            } else {
                return this._lexer_hash['plain'];
            }
        }
    });

    D.register({
        name : 'plain',
        instance : {
            lex : function(src, style_callback, paint_callback) {
                //do nothing
                //style_callback(0, src.length, 'plain');
                //paint_callback();
            }
        }
    })
})(dLighter._Lexer, dLighter.$);
