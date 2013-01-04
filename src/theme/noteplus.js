(function(D, $){
	/**
	 * notepad++的默认主题
	 */
	D.register({
        name : "noteplus",
		global : {
            font_size : 16,
			font_name : 'Consolas',
			background : '#F2F4FF',
			color : 'black'
		},
		selected : {
			background : 'rgba(192,192,192,1)'
		},
		highlight : {
			background : 'rgba(232,232,255,1)'
		},
        code : {
            keyword : {color:'#000080',italic:true,bold:true},
            value : {color:'#FF0000'},
            comment : {color: '#008000'},
            string : {color:'#808080'},
            variable : {color:'black'},
            operator : {color: 'black'}
        },
		language : {
			'javascript, js' :
			 {
				doccomment : {color:"#008080"},
				regexp : {color:'#8000FF'},
				object : {color:'#275391'}	,
				param : {color:'#275391',italic:true}	
			}
		}
	});
})(dLighter._Theme, dLighter.$);