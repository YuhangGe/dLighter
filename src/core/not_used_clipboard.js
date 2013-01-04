/**
 * 该文件已经被废弃。
 * 之前的思路是复制时显示一个flash的按钮，提示点击复制，通过flash来复制，
 * 但后来决定完全不使用flash，复制只能通过ctrl+c快捷键进行。
 * 以后html5的Clipboard API出来后应该可以实现。所以这个文件暂时保留了代码。
 */
(function(D, $) {

    D._Clipboard = function(lighter) {
        this.lighter = lighter;
        this.text = "";
        this.c_dialog = null;
        this.hide_dialog_delegate = $.createDelegate(this, this._hide_dialog);
    }
    D._Clipboard.prototype = {
        _hide_dialog : function() {
            this.c_dialog.style.display = "none";
            $.delEvent(document.body, "mousedown", this.hide_dialog_delegate);
        },
        _init : function() {
           var _d = document.createElement("div");
           _d.style.background = "white";
           _d.style.position = "absolute";
           _d.style.display = "none";
           _d.innerHTML = "<a href='javascript:;'>点击复制</a>";
            $.addEvent(_d, "mousedown", function(e) {
                $.stopEvent(e);
            });
            this.lighter.container.appendChild(_d);
            this.c_dialog = _d;
        },
        _showCopyDialog : function() {
            if(this.c_dialog===null){
                this._init();
            }
            var cd = this.c_dialog;
            cd.style.display = "block";
            var li = this.lighter, _c = this.lighter.container, x = li.caret_left, y = li.caret_top;
            if(x+cd.offsetWidth>li.width){
                x -= cd.offsetWidth
            }
            cd.style.left = x + "px";
            cd.style.top = y + "px";
            $.addEvent(document.body, "mousedown", this.hide_dialog_delegate);
        },
		setText : function(text, e) {
            this.text = text;
            if(this.text.length === 0){
                return;
            }
            if(e && e.clipboardData) {
                e.clipboardData.setData("text/plain", this.text);
            } else if(window.clipboardData) {
                window.clipboardData.setData("text", this.text);
            } else {
                this._showCopyDialog();
            }
        }
	}
})(dLighter._Core, dLighter.$);

