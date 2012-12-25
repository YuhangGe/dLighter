(function(D, $){
	/**
	 * aptana 3 的主题
	 */
	D.register({
        name : 'aptana3',
        author : 'xiaoge',
        email : 'abraham1@163.com',
		global : {
			font_size : '20',
            font_name : 'consolas',
			background : 'black',
			color : 'white',
		},
		selected : {
			background : 'rgba(160,160,160,0.5)'
		},
		highlight : {
			background : 'rgba(210,210,210,0.1)'
		},
		languages : {
			'javascript, js' :
			 {
				keyword : {color:'#F9EE98'},
				value : {color:'#B4431F'},
				comment : {color: '#5f5a60', italic : true},
				operator: {color: '#CDA869'},
				string : {color:'#8f9d6a'},
				regexp : {color:'#E9C062',bold:true},
				id : {color:'white'},
				object : {color:'#9E89A0'}	,
				param : {color:'#7587A6',italic:true}	
			},
			'visualbasic, vb' :
			{
				keyword : {color:'#F9EE98'},
				value : {color:'#B4431F'},
				comment : {color: '#5f5a60', italic : true},
				operator: {color: '#CDA869'},
				string : {color:'#8f9d6a'},
				id : {color:'white'}
			}
		}
	});
})(dLighter._Theme, dLighter.$);