/**
 * this file was auto-generated by AliceLex
 * https://github.com/YuhangGe/alicelex
 */
(function(D, $) {
    var DEFAULT = 38, TAG = 42, ATTR = 43, EQU = 44, SCRIPT = 45, STYLE = 46, CLOSE = 47;
    var lexer_html = function() {
        this.base();
        this.START_ACTION = 38;

        this.ig = true;

        var _i = window.Int32Array ? Int32Array : Array;

        this.TABLE = {
            _base : new _i(48),
            _default : new _i(48),
            _check : new _i(259),
            _next : new _i(259),
            _action : new _i(48),
            _eqc : new _i(256)
        };

        D._str_to_arr(["\0\1\1\1\1\1\1\1\1\1\1\1\1\2\2\1\3\1\1\1\1\1\1\2\4\7\3\3\3\3\24\24\44\64\x46\x59\x6c\x7f\x92\1\xa5\1\xb8\xcb\xde\50\2\27\xf1", "\1\47\0\2\43\2\0\2\46\4\0\2\42\2\44\2\45\2\0", "\1\2\0\2\47\2\56\2\14\2\15\2\16\2\20\2\30\2\17\2\27\2\21\2\22\2\23\2\24\2\25\2\26\2\31\2\32\2\33\2\34\2\35\2\36\2\37\2\57\3\37\2\0\2\36\2\0\12\37\2\40\2\55\3\40\2\0\2\55\2\0\12\40\2\41\2\0\3\41\4\0\12\41\4\42\2\0\17\42\2\43\2\0\22\43\2\44\2\0\22\44\2\45\2\0\22\45\24\46\24\50\24\52\24\53\24\54\24\60","\1\2\0\2\36\2\17\2\15\2\51\2\3\2\10\2\11\2\21\2\31\2\22\2\23\2\24\2\25\2\26\2\20\2\32\2\33\2\34\2\35\2\30\2\14\2\37\2\27\3\37\2\0\2\1\2\0\12\37\2\40\2\7\3\40\2\0\2\7\2\0\12\40\2\41\2\0\3\41\4\0\12\41\4\42\2\0\17\42\2\43\2\0\22\43\2\44\2\0\22\44\2\45\2\0\22\45\4\51\2\50\23\51\2\52\23\51\2\52\2\46\17\51\4\2\2\37\2\2\2\37\5\2\12\37\4\6\2\40\2\5\2\40\2\6\2\4\2\16\2\6\12\40\4\13\2\41\2\12\2\41\5\13\12\41", "\0\22\4\11\6\12\13\10\14\17\24\25\0\0\13\16\0\0\0\0\0\0\0\21\0\0\0\0\0\0\2\3\5\23\7\26\15\20\1\26\0\0\0\0\0\0\15\20\0", "\1\12\12\6\1\23\12\2\1\2\3\14\12\2\4\2\12\2\11\13\7\3\12\2\2\2\10\2\5\3\12\33\6\5\12\2\6\2\12\3\6\2\14\2\6\2\23\4\6\2\16\3\6\2\22\4\6\2\17\2\6\2\15\2\13\2\20\5\6\2\21\2\6\x86\12"], [this.TABLE._base, this.TABLE._default, this.TABLE._check, this.TABLE._next, this.TABLE._action, this.TABLE._eqc]);
    };
    lexer_html.prototype = {
        action : function(action) {
            switch(action) {
                case 0:
                    this.yystyle="comment";
                    break;
                case 17:
                    this.yygoto(CLOSE);
                    break;
                case 1:
                    this.yygoto(TAG);
                    break;
                case 21:

                    break;
                case 2:

                    this.yystyle="keyword";
                    switch(this.src.substr(this.yyidx, this.yylen).toLowerCase()) {
                        case 'script':
                            this.special_tag = SCRIPT;
                            break;
                        case 'style':
                            this.special_tag = STYLE;
                            break;
                        default:
                            this.special_tag = DEFAULT;
                            break;
                    }
                    this.yygoto(ATTR);

                    break;
                case 3:
                    this.yygoto(DEFAULT);
                    break;
                case 8:
                    this.yygoto(DEFAULT);
                    break;
                case 5:
                    this.yygoto(EQU);
                    break;
                case 9:

                    this.yy_pre_idx(this.yyidx+1);
                    this.yygoto(this.special_tag);

                    break;
                case 4:
                    this.yystyle="property";
                    break;
                case 10:

                    break;
                case 6:
                    this.yystyle="value";this.yygoto(ATTR);
                    break;
                case 7:

                    break;
                case 11:

                    this.yytask(this.pre_idx, this.yyidx-this.pre_idx, 'javascript');
                    this.yystyle="keyword";
                    this.yyidx+=2;
                    this.yylen-=3;
                    this.yygoto(DEFAULT);

                    break;
                case 13:

                    break;
                case 12:

                    break;
                case 14:

                    this.yytask(this.pre_idx, this.yyidx-this.pre_idx , 'css');
                    this.yystyle="keyword";
                    this.yyidx+=2;
                    this.yylen-=3;
                    this.yygoto(DEFAULT);

                    break;
                case 16:

                    break;
                case 15:

                    break;
                case 19:
                    this.yygoto(DEFAULT);
                    break;
                case 18:
                    this.yystyle="keyword";
                    break;
                case 20:

                    break;

                default :
                    break;
            }
        }
    };
    $.inherit(lexer_html, D._LexerBase);

    D.register({
        name : 'html,xhtml',
        instance : new lexer_html()
    });
})(dLighter._Lexer, dLighter.$);