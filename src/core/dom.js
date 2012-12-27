(function(D, $) {
    D.config = {
        tagName : "pre",
        theme : 'dLighter'
    }
    D.do = function() {
        if(! $.hasCanvas) {
            alert("dLighter is not supported by your browser");
            return;
        }
        var codes = document.getElementsByTagName(D.config.tagName);
        for(var i=0;i<codes.length;i++) {
            D.createLighter(codes[i]);
        }
    };

    D.__lighter__id = 0;
    D.createLighter = function(ce) {
        if(! $.hasCanvas) {
            alert("dLighter is not supported by your browser");
            return;
        }
        var _width = ce.offsetWidth;
        var _height = ce.offsetHeight;
        if(_width < 50 || _height < 50) {
            return;
        }
        var STYLE_NAMES = ['position', 'display', 'left', 'top'];
        var _theme = ce.getAttribute("theme") || D.config.theme || "plain";
        var _lang = ce.getAttribute("lang") || ce.getAttribute("language") || "plain";
        var _bk_line = ce.getAttribute("breakline") == "true" ? true : false;
        var _class = ce.getAttribute("class");
        var _line_start = ce.getAttribute("line_number_start") || ce.getAttribute("lns") || "1";
        var _container = document.createElement("div");
        var _s = window.getComputedStyle(ce, null);
        for(var i=0;i<STYLE_NAMES.length;i++) {
            _container.style[STYLE_NAMES[i]] = _s.getPropertyValue(STYLE_NAMES[i]);
        }
        var _id = D.__lighter__id++;
        _container.setAttribute("class", _class ? _class + " dLighter" : "dLighter");
        _container.setAttribute("id", "dLighter-"+ _id)
        _container.style.position = "relative";
        _container.style.overflow = "hidden";
        _container.style.width = _width + "px";
        _container.style.height = _height + "px";
        ce.parentElement.appendChild(_container);
        ce.style.display = "none";

        _container.innerHTML = '<!-- dLighter(http://xiaoge.me) -->'
            + '<canvas id="dLighter-canvas-'+_id+'" class="dLighter-canvas"></canvas>'
            + '<div id="dLighter-scroll-ver-bar-'+_id+'" class="dLighter-scroll-ver-bar">'
                + '<div id="dLighter-scroll-ver-button-'+_id+'" class="dLighter-scroll-ver-button"></div>'
            + '</div>'
            + '<div id="dLighter-scroll-hor-bar-'+_id+'" class="dLighter-scroll-hor-bar">'
                + '<div id="dLighter-scroll-hor-button-'+_id+'" class="dLighter-scroll-hor-button"></div>'
            + '</div>'
//            + '<textarea id="dLighter-caret-'+_id+'" spellcheck="false" cols="0" rows="0" class="dLighter-caret" wrap="wrap" style="position: absolute; left: 0px; top: 0px; width: 0px; height: 0px; opacity: 0;"></textarea>'
            + '<!-- dLighter end -->';
        /*
         * 把input放在container里面始终会有focus时窗口的滚动条会滚动，
         * 没有找到什么方法可以阻止这个行为。于是改变思路，把textarea直接放在documnet.body中，
         * 并且position设置为fixed, left位置和当前caret_pos.left一置，top为0。
         * 使用css的ime-mode:disabled是为了关闭ime输入法，否则用户在按键的时候还是会出现输入法的输入框.
         * chrome和safari下面没用，但不影响。
         */
        var _caret = document.createElement("textarea");

        _caret.style.imeMode = "disabled";
        _caret.setAttribute("class", "dLighter-caret");
        _caret.setAttribute("id", "dLighter-caret-"+_id);
        document.body.appendChild(_caret);

        var theme = D._Theme.get(_theme, {
            font_size : parseInt(_s.getPropertyValue("font-size"))
        });
        var lighter = new D._Core._Lighter(
            {
                container : _container,
                canvas : $("dLighter-canvas-"+_id),
                caret : _caret,
                ver_scroll : $("dLighter-scroll-ver-button-"+_id),
                hor_scroll : $("dLighter-scroll-hor-button-"+_id)
            }, {
            width : _width,
            height : _height,
            language : _lang,
            break_line : _bk_line,
            text : (ce.textContent || ce.innerText || "  ").replace(/\t/g,"    ").replace(/\r/g, ""),
            theme : theme,
            lexer :D._Lexer.get(_lang),
            line_number_start : parseInt(_line_start)
        });

        return lighter;
    }
})(dLighter, dLighter.$);