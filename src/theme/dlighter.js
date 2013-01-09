/**
 * User: xiaoge
 * At: 12-12-26 11:11
 * Email: abraham1@163.com
 */
(function(D, $){
    /**
     * 默认主题，同时也是主题模板
     */
    D.register({
        name : 'dLighter',
        global : {
            /*
             * 这里的字体的大小和名称默认是没有作用的，因为会取代码所在dom元素的字体。
             * 但如果pre中明确指定use_theme_font=true则会使用这里设置的字体和大小
             */
            font_size : 16,
            font_name : 'Consolas',
            background : '#F2F4FF',
            color : 'black',
            caret_color : 'purple'
        },
        gutter : {
            number_color : '#afafaf',
            line_color : '#6ce26c'
        },
        selected : {
            background : '#B4D5FF'
        },
        /**
         * highlight为保留字段，目前还没有实现
         */
        highlight : {
            background : '#e0e0e0'
        },
        /**
         * 代码的高亮颜色和样式，这个是全局的，既适用于任何语言。
         * lexer中通过设置this.yystyle={key}则可以将相应区域的代码设置成key对应的样式。
         */
        code : {
            keyword : {color:'#006699', bold : true},
            value : {color:'#009900'},
            comment : {color: '#5f5a60', italic : true},
            operator: {color: 'black'},
            string : {color:'blue'}
        },
        /**
         * 特定代码的高亮样式。这一部分language是对上一部分code部分的补充，比如js代码里面会有正则表达式regexp。
         * 该部分也可以覆盖上一部分的样式。
         * 该部分的key是语言的名称，别名用逗号隔开，允许空格。
         */
        language : {
            'javascript, js' :
            {
                doc_comment : {color: '#008080', italic : true},
                regexp : {color:'#0066cc',bold:true},
                object : {color:'#ff1493'},
                param : {color:'#ff1493',italic:true}
            },
            'css' : {
                wei : {color : '#008080'},
                number : {color : '#ff1493'},
                important : {color : 'red', italic: true, bold:true}
            },
            'xml,html,xhtml,xslt' : {
                property : {color : '#ff1493'}
            }
        }
    });
})(dLighter._Theme, dLighter.$);