const N = 2e8;
const Prms = primsGenerator();
function primsGenerator(n=N) {
  const prms = [2,3];
  const buffer = new ArrayBuffer(n);
  const sieve = new Uint8Array(buffer);
  for(let i=0; i<n; i++) {
    sieve[i] = 0;
  }
  let m;
  for(let x=1; 3*x*x<n; x++) {
    for(let y=1; y*y<n; y++) {
      m = 4*x*x + y*y;
      if(m<n && (m%12==1 || m%12==5)) {
        sieve[m] ^= 1;
      }
      
      m = 3*x*x + y*y;
      if(m<n && m%12==7) {
        sieve[m] ^= 1;
      }
      
      if(x>y) {
        m = 3*x*x - y*y;
        if(m<n && m%12==11) sieve[m] ^= 1;
      }
    }
  }
  for(let r=5; r*r<n; r++) {
    if(sieve[r]) {
      for(let i=r*r; i<n; i+=r*r) {
        sieve[i] = 0;
      }
    }
  }
  for(let r=5; r<n; r++) {
    if(sieve[r]) {
      prms.push(r);
    }
  }
  return prms;
}
class Primes {
  static *stream() {
      for(let i=0; i<Prms.length; i++) {
        yield Prms[i];
      }
      return;
  }
}
