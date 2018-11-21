const currency = (function(){
	function asyncCurrency({base, from, to, start, end, num}={}, cb) {

		const Http = new XMLHttpRequest();

		base  = base  || from;
		base  = base  && base.trim().toUpperCase();
		to    = to    && to.trim().toUpperCase();
		start = start && start.trim();
		end   = end   && end.trim();
		num   = num   || 1;


		if(!base || !base.length) {
			base = 'CNY';
		}

		if(start && start.length) {
			if(!end || !end.length) {
				let now = new Date;
				end = now.toISOString().replace(/T.*/, '');
			}
			if(!start.includes('-')) {
				start = start.replace(/^\d{6}/, r=>r+'-').replace(/^\d{4}/, r=>r+'-');
			}
		}

		let url = `https://api.exchangeratesapi.io/${start && 'history' || 'latest'}?base=${base}${to && to.length && '&symbols='+to || ''}${start && start.length && '&start_at='+start+'&end_at='+end || ''}`;

		function handleOutput(rawData) {
			let outputStr = '';
			let echo = function(s) {
				outputStr = outputStr + s;
			}
			echo('\n');
			echo('-------------------------------------------\n');
			echo(` BASE : ${base}\n`);
			to && to.length && echo(` TO   : ${to}\n`);
			if(start && start.length) {
				echo(` START: ${start}     \n`);
				echo(` END  : ${end}\n`);
				echo('-------------------------------------------\n');
				echo(' to    date           value \n');
				let rates = rawData['rates'];
				let rows = [];
				for(let date in rates) {
					for(let to in rates[date]) {
						rows.push([to, date, num*rates[date][to]]);
					}
				}
				rows.sort((a,b)=>a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : (a[1] < b[1] ? -1 : 1)))
				let toTitle = '';
				for(let row of rows) {
					if(toTitle == row[0]) {
						toTitle = row[0];
						row[0] = '';
					} else {
						echo('\n');
						toTitle = row[0];
					}
					echo(' '.repeat(4-row[0].length)+row[0]+'   '+row[1]+'     '+row[2]+'\n');
				}
			} else {
				echo(` DATE: ${rawData.date}\n`);
				echo('\n-------------------------------------------\n');
				echo('   to     value    \n');
				Object.keys(rawData['rates']).forEach(i=>echo('   '+i+'    '+num*rawData['rates'][i]+'\n'));
			}
			return outputStr;
		}

		let output = '';

		Http.open("GET", url);
		Http.send();
		Http.onreadystatechange=(e)=>{
			if(Http.readyState == Http.DONE) {
				const rawData = Http.responseText;
				output = handleOutput(JSON.parse(rawData));
				cb(output);
			}
		}
	};

	return function(args) {
		if(window && window.terminal) {
			asyncCurrency(args, window.terminal.echo);
		}else {
			asyncCurrency(args, console.log);
		}
	}
})();
