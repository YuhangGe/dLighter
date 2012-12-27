(function(D, $) {

	D._WordSeg = {
		TYPE : {
			DIG_WORD : 0,
			ASCII : 1,
			UNICODE : 2,
			OTHER : 3,
			SPACE : 4,
			ARAB : 5,
            NEWLINE : 6
		},
		_getCharType : function(c) {
			if(c === 32 || c === 9)
				return this.TYPE.SPACE;
            else if(c===10) {
                return this.TYPE.NEWLINE;
            }
			else if((c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57))
				return this.TYPE.DIG_WORD;
			else if(c>=0x600 && c<=0x6ff)
				return this.TYPE.ARAB;
			else if(c > 256)
				return this.TYPE.UNICODE;
			else
				return this.TYPE.ASCII;
		},
		getRange : function(arr, idx) {
			var ct = this._getCharType(arr.charCodeAt(idx));
				return {
					from : this._getLeft(arr, idx, ct),
					to : this._getRight(arr, idx, ct)
				}
		},
		getRight : function(arr, idx) {
			var ct = this._getCharType(arr.charCodeAt(idx)), r = idx;
			if(ct !== this.TYPE.SPACE) {
			    r = this._getRight(arr, idx, ct);
			}
			return this._getRight(arr, r, this.TYPE.SPACE);
		},
		getLeft : function(arr, idx) {
			var ct = this._getCharType(arr.charCodeAt(idx));
			var l =  this._getLeft(arr, idx, ct);
			if(ct === this.TYPE.SPACE && l>=0) {
				return this._getLeft(arr, l, this._getCharType(arr.charCodeAt(l)));
			} else
				return l;
		},
		/**
		 *
		 * @param {Object} arr
		 * @param {Object} idx
		 * @param {Object} type
		 * 根据chrome的规则，向右选择会选择一致类型的单词
		 */
		_getRight : function(arr, idx, type) {
			if(type === this.TYPE.UNICODE)
				return idx;
			for(var i = idx + 1; i < arr.length; i++) {
				if(this._getCharType(arr.charCodeAt(i)) !== type) {
					return i - 1;
				}
			}
			if(i === arr.length)
				return i - 1;
			else
				return idx;
		},
		_getLeft : function(arr, idx, type) {
			var i = idx - 1;
			if(type === this.TYPE.UNICODE)
				return i;
				
			for(; i >= 0; i--) {
				if(this._getCharType(arr.charCodeAt(i)) !== type) {
					break;
				}
			}
			return i;
		}
	}
})(dLighter._Core, dLighter.$);
