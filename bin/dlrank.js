const DLRank = (function() {

	function getPn({n,p}){

		const win = p || 0.6, loss = 1-win;
		n = n || 100;
		const Keys = [    'a0',
						  'a1',
						  'a2',
						  'a3',
						  'a4',
						  'b00', 'b01', 'b02',
						  'b10', 'b11', 'b12',
						  'b20', 'b21', 'b22',
						  'b30', 'b31', 
						  'b40', 
			//rank c only has wins-in-rows
						  'c00', 'c01', 'c02',
						  'c10',
						  'c20',
						  'c30',
						  'c40', 
						  'd0'
		];

		const Labels = [  '传1，净胜0',
						  '传1，净胜1',
						  '传1，净胜2',
						  '传1，净胜3',
						  '传1，净胜4',
						  '传2，净胜0，连输0', '传2，净胜0，连输1', '传2，净胜0，连输2',
						  '传2，净胜1，连输0', '传2，净胜1，连输1', '传2，净胜1，连输2',
						  '传2，净胜2，连输0', '传2，净胜2，连输1', '传2，净胜2，连输2',
						  '传2，净胜3，连输0', '传2，净胜3，连输1', 
						  '传2，净胜4，连输0', 
						  '传3，连胜0', '传3，连输1', '传3，连输2',
						  '传3，连胜1',
						  '传3，连胜2',
						  '传3，连胜3',
						  '传3，连胜4', 
						  '决斗王'
		];

		const P = (function() {
			let t = Keys.reduce((o,e)=>(o[e]=Keys.reduce((ob,el)=>(ob[el]=0,ob), {}),o), {});
			t['a1']['a0']   = win;  t['a0']['a0']   = loss;
			t['a2']['a1']   = win;  t['a0']['a1']   = loss;
			t['a3']['a2']   = win;  t['a1']['a2']   = loss;
			t['a4']['a3']   = win;  t['a2']['a3']   = loss;
			t['b00']['a4']  = win;  t['a3']['a4']   = loss;

			t['b10']['b00'] = win;  t['b01']['b00'] = loss;
			t['b10']['b01'] = win;  t['b02']['b01'] = loss;
			t['b10']['b02'] = win;  t['a0' ]['b02'] = loss;
			t['b20']['b10'] = win;  t['b01']['b10'] = loss;
			t['b20']['b11'] = win;  t['b02']['b11'] = loss;
			t['b20']['b12'] = win;  t['a0' ]['b12'] = loss;
			t['b30']['b20'] = win;  t['b11']['b20'] = loss;
			t['b30']['b21'] = win;  t['b12']['b21'] = loss;
			t['b30']['b22'] = win;  t['a0' ]['b22'] = loss;
			t['b40']['b30'] = win;  t['b21']['b30'] = loss;
			t['b40']['b31'] = win;  t['b22']['b31'] = loss;
			t['c00']['b40'] = win;  t['b31']['b40'] = loss;

			t['c10']['c00'] = win;  t['c01']['c00'] = loss;
			t['c10']['c01'] = win;  t['c02']['c01'] = loss;
			t['c10']['c02'] = win;  t['b00']['c02'] = loss;
			t['c20']['c10'] = win;  t['c01']['c10'] = loss;
			t['c30']['c20'] = win;  t['c01']['c20'] = loss;
			t['c40']['c30'] = win;  t['c01']['c30'] = loss;
			t['d0' ]['c40'] = win;  t['c01']['c40'] = loss;

			t['d0' ]['d0' ] = 1;
			return t;
		})();

		const A0 = Keys.reduce((o,e)=>(o[e]=0,o), {}); A0['a0'] = 1;

		function getAn(n) {
			if((n|0) != n) throw new Error('n must be integer: n='+n);
			let stateMatrix = Keys.map(e=>[A0[e]]);
			let pMatrix = Keys.map(to=>Keys.map(from=>P[to][from]));
			while(n!=0) {
				stateMatrix = math.multiply(pMatrix, stateMatrix);
				n--;
			}
			return stateMatrix.reduce((o,e,i)=>(o[Labels[i]]=e[0],o), {});
		}

		function strlen(str) {
			let len = 0;
			for(let c of str) {
				if (c.charCodeAt() < 256) {
					len += 1;
				}
				else {
					len += 1.7;
				}
			}
			return len;
		}

		let an = getAn(n);

		let summary = '\n', llen = 20;
		summary += '  胜率：' + (win*100).toFixed(2)+'%, 决斗次数： '+n+', 段位分布概率如下：\n\n';
		for(let label in an) {
			summary += ' '.repeat(llen-strlen(label))+label+'  :    '+an[label].toFixed(3)+'\n';
		}
		summary += '\n';

		return summary;
	}

	return {
		getPn: getPn
	}
})();
