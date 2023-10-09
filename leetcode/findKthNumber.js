/**
 * @param {number} n
 * @param {number} k
 * @return {number}
 */
var prefixCount = function(prefix, n) {
    if(prefix.length > n.length) return 0;
    if(prefix == '') return n.length ? n : 1;
    if(prefix[0] < n[0]) return +'1'.repeat(n.length - prefix.length + 1);
    if(prefix[0] > n[0]) return +'1'.repeat(n.length - prefix.length);
    return prefix.length > 1 ? prefixCount(prefix.substr(1), n.substr(1)) : +n.substr(1)+1+(+'1'.repeat(n.length-prefix.length));
}

var findKthNumber = function(n, k) {
    console.log(n, k);
    n += '', k *= 1;
    let prefix = '', pcount;
    lp: while(k > 0) {
        for(let i=prefix==''?1:0; i<10; i++) {
            console.log(prefix+i);
            pcount = prefixCount(prefix+i, n);
            if(pcount == 0) break lp;
            if(k > pcount) {
                k -= pcount;
                continue;
            } else {
                prefix += i;
                k -= 1;
                break;
            }
        }
    }
    return prefix;
};



const N = 1e4;
let n, k, p;
for (let i=0; i<1e4; i++) {
    n = Math.random()*N|0;
    k = 10**(Math.random()*Math.log10(n))|0;
    p = findKthNumber(n, k);
    console.log(`n: ${n}, p: ${p}, k: ${k}`);
    console.log('==================================================');
}
