$lexer_name lexer_html
$case_ignore true
$argument alias html,xhtml

CMT <!--[\d\D]*-->
WORD    [\a\-_]([\a\-_\d]*)

EQU     =
PRE   <
POST  >
CLOSE />
END </
VAL   [^\s\n\r>]+
CNT [^<]*

SCRIPT_END  </script>
STYLE_END </style>

OTHER [\d\D]

$$

CMT {this.yystyle="comment";}
PRE {this.yygoto(TAG);}

<TAG> WORD {
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
}
<TAG> OTHER {this.yygoto(DEFAULT);}

<ATTR> WORD {this.yystyle="property";}
<ATTR> EQU {this.yygoto(EQU);}

<EQU> VAL {this.yystyle="value";this.yygoto(ATTR);}
<EQU> OTHER {}

<ATTR> CLOSE { this.yygoto(DEFAULT);}
<ATTR> POST {
    this.yy_pre_idx(this.yyidx+1);
    this.yygoto(this.special_tag);
}
<ATTR> OTHER {}

<SCRIPT> SCRIPT_END {
    this.yytask(this.pre_idx, this.yyidx-this.pre_idx, 'javascript');
    this.yystyle="keyword";
    this.yyidx+=2;
    this.yylen-=3;
    this.yygoto(DEFAULT);
}
<SCRIPT> CNT {}
<SCRIPT> OTHER {}

<STYLE> STYLE_END {
    this.yytask(this.pre_idx, this.yyidx-this.pre_idx , 'css');
    this.yystyle="keyword";
    this.yyidx+=2;
    this.yylen-=3;
    this.yygoto(DEFAULT);
}
<STYLE> CNT {}
<STYLE> OTHER {}

END { this.yygoto(CLOSE);}

<CLOSE> WORD {this.yystyle="keyword";}
<CLOSE> POST {this.yygoto(DEFAULT);}
<CLOSE> OTHER {}

CNT {}
OTHER {}

$$

