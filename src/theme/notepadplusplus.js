(function(D, $){
	/**
	 * notepad++的默认主题
	 */
	D.register({
        name : "notepadplusplus",
        author : "xiaoge",
        email : "abraham1@163.com",
		global : {
            font_size : 18,
			font_name : 'Courier New',
			background : '#F2F4FF',
			color : 'black'
		},
		selected : {
			background : 'rgba(192,192,192,1)'
		},
		highlight : {
			background : 'rgba(232,232,255,1)'
		},
		languages : {
			'javascript, js' :
			 {
				keyword : {color:'#000080',italic:true,bold:true},
				value : {color:'#FF0000'},
				comment : {color: '#008000'},
				doccomment : {color:"#008080"},
				operator: {color:'black'},
				string : {color:'#808080'},
				regexp : {color:'#8000FF'},
				id : {color:'black'},
				object : {color:'#275391'}	,
				param : {color:'#275391',italic:true}	
			},
			'visualbasic, vb' :
			{
				keyword : {color:'#0000FF'},
				value : {color:'#ff0000'},
				comment : {color: '#008000'},
				operator: {color: '#000000'},
				string : {color:'#808080'},
				id : {color:'black'}
			}
		}
	});
})(dLighter._Theme, dLighter.$);