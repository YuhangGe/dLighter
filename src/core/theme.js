/**
 * User: xiaoge
 * At: 12-12-20 11:20
 * Email: abraham1@163.com
 */
(function(D, $) {
    var _Theme = function(theme, font_name, font_size) {
        var _g = theme.global ? theme.global : {};
        this.font_size = font_size ? font_size : (_g.font_size ? _g.font_size : D.DEFAULT_FONTSIZE);
        this.font_name = font_name ? font_name : (_g.font_name ? _g.font_name : D.DEFAULT_FONTNAME);
        this.background = _g.background ? _g.background : 'white';
        this.color = _g.color ? _g.color : 'black';
        this.caret_color = _g.caret_color ? _g.caret_color : this.color;
        this.bold = _g.bold ? true : false;
        this.italic = _g.italic ? true : false;
        this.scroll_breadth = _g.scroll_breadth ? _g.scroll_breadth : 14;
        var _u = theme.gutter ? theme.gutter : {};
        this.gutter_number_color = _u.number_color ? _u.number_color : this.color;
        this.gutter_line_color = _u.line_color ? _u.line_color : this.background;
        var _s = theme.selected ? theme.selected : {};
        this.selected_background = _s.background ? _s.background : 'rgba(125,125,125,0.3)';
        var _h = theme.highlight ? theme.highlight : {};
        this.highlight_background = _h.background ? _h.background : 'rgba(232,232,255,1)';


        this.font = (this.bold ? "bold " : "") + (this.italic ? "italic " : "") + this.font_size + "px " + this.font_name;

        var _lang = theme.language ? theme.language : {};
        var _code = theme.code ? theme.code : {};

        this.code_style = new _LangStyle({
            font : this.font,
            color : this.color
        });
        this.lang_style_hash = {};

        this._initCode(_code);
        this._initLang(_lang);

    };
    _Theme.prototype = {
        _initCode : function(_code) {
            for(var s in _code) {
                var t = _code[s];
                var font = (t.bold?"bold ":"") + (t.italic?"italic ":"")+(t.font_size ? t.font_size : this.font_size)+"px "+(t.font_name? t.font_name:this.font_name);
                var color = t.color ? t.color : this.color;
                this.code_style.addStyle(s, {
                    font : font,
                    color: color
                });
            }
        },
        _initLang : function(_lang) {

            for(var ln in _lang) {
                var _l = _lang[ln];
                var _ls = this.code_style.copy();
                for(var s in _l) {
                    var t = _l[s];
                    var font = (t.bold?"bold ":"") + (t.italic?"italic ":"")+(t.font_size ? t.font_size : this.font_size)+"px "+(t.font_name? t.font_name:this.font_name);
                    var color = t.color ? t.color : this.color;
                    _ls.addStyle(s, {
                        font : font,
                        color: color
                    });
                }

                this._addLangStyle(ln, _ls);
            }
        },

        _addLangStyle : function(name, lang_style) {
            var ns = name.split(",");
            for(var i=0;i<ns.length;i++) {
                this.lang_style_hash[ns[i].trim()] = lang_style;
            }
        },
        getLanguageStyle : function(name) {
            var ls = this.lang_style_hash[name];
            if(ls == null) {
                return this.code_style;
            } else {
                return ls;
            }
        }
    };

    var _LangStyle = function(plain_style) {
        this.style_hash = plain_style ? {
            plain : 0
        } : {};
        this.style_array = plain_style ? [plain_style] : [];
    };
    _LangStyle.prototype = {
        getStyle : function(index) {
            return this.style_array[index];
        },
        addStyle : function(name, style) {
            var idx = this.style_hash[name];
            if(idx!=null) {
                this.style_array[idx] = style;
            } else {
                idx = this.style_array.length;
                this.style_array.push(style);
                this.style_hash[name] = idx;
            }
        },
        getStyleIndex : function(style_name) {
            var i = this.style_hash[style_name];
            return i ? i : 0;
        },
        copy : function() {
            var rtn = new _LangStyle();
            rtn.style_array.length = this.style_array.length;
            for(var s in this.style_hash) {
                var i = this.style_hash[s];
                rtn.style_hash[s] = i;
                rtn.style_array[i] = this.style_array[i];
            }
            return rtn;
        }
    };
    $.extend(D, {
        _theme_list : {},
        _theme_hash : {},
        DEFAULT_FONTSIZE : 16,
        DEFAULT_FONTNAME : "consolas",
        register : function(theme) {
            this._theme_list[theme.name] = theme;
            var key = theme.name + (theme.font_name?theme.font_name: D.DEFAULT_FONTNAME) + (theme.font_size?theme.font_size: D.DEFAULT_FONTSIZE);
            this._theme_hash[key] = new _Theme(theme);
        },
        get : function(name, config) {
            config = config ? config : {};
            var _t = this._theme_list[name];
            if(!_t) {
                _t = this._theme_list['plain'];
            }
            var key = _t.name + (config.font_name?config.font_name:(_t.font_name?_t.font_name: D.DEFAULT_FONTNAME)) + (config.font_size?config.font_size:(_t.font_size?_t.font_size: D.DEFAULT_FONTSIZE));
            var theme = this._theme_hash[key];
            if(!theme) {
                theme = new _Theme(_t, config.font_name, config.font_size);
                this._theme_hash[key] = theme;
            }
            return theme;

        }
    });

    D.register({
        name : 'plain',
        global : {
            background : 'white',
            color : 'black'
        },
        selected : {
            background : 'rgba(160,160,160,0.5)'
        },
        highlight : {
            background : 'rgba(210,210,210,0.1)'
        }
    });
})(dLighter._Theme, dLighter.$);