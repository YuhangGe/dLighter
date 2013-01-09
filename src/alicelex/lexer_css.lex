$lexname lexer_css
$argument alias css
$caseignore true

IMP     !\s*important
CMT   \/\*[\d\D]*\*\/

STR     (\"[^\"]*\")|(\'[^\']*\')
WORD    [\a-_]([\a-_\d]*)
NUM     \-?\d+(\.\d+)?

TAG     (\#|\.)?{WORD}
MAO  :
WEI_END  [^\a_-]


CSS_BEGIN \{

URL_VALUE_BEGIN url\(
URL_VALUE   [^\)]*
URL_VALUE_END   \)
VALUE [\w-_]+
COLOR_VALUE   #?[a-fA-F0-9]+


VALUE_END   [;\n]
CSS_END \}

OTHER [.\n]

$$

CMT {this.yystyle="comment";}
STR {this.yystyle="string";}
NUM {this.yystyle="number"}
TAG {}
MAO { this.yygoto(WEI); }
<WEI> WORD {this.yystyle="wei";}
<WEI> WEI_END {this.yygoto(DEFAULT);}

CSS_BEGIN { this.yygoto(CSS); }
<CSS> WORD { this.yystyle="keyword";}
<CSS> MAO { this.yygoto(VALUE);}
<CSS> CMT {this.yystyle="comment";}
<CSS> IMP {this.yystyle="important";};
<VALUE> STR { this.yystyle = "string";}
<VALUE> VALUE {this.yystyle="value";}
<VALUE> COLOR_VALUE {this.yystyle="number";}
<VALUE> URL_VALUE_BEGIN { this.yystyle="wei"; this.yygoto(URL);}
<VALUE> CMT {this.yystyle="comment"}

<URL>  URL_VALUE  {this.yystyle="string";}
<URL> URL_VALUE_END {this.yygoto(VALUE);this.yystyle="wei";}
<VALUE> VALUE_END { this.yygoto(CSS);}
<CSS> CSS_END {this.yygoto(DEFAULT);}

<WEI> OTHER {}
<CSS> OTHER {}
<VALUE> OTHER {}
<URL> OTHER {}
OTHER {}

$$