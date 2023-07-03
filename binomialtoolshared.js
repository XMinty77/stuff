export const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
export const MAX_SAFE_BIGINT_HALF = BigInt(Number.MAX_SAFE_INTEGER) / 2n;
export const MAX_SAFE_INTEGER_LOG2 = Math.log2(Number.MAX_SAFE_INTEGER);
export const CONV_PRECISION_NUMBER = 1e15;
export const CONV_PRECISION_BIGINT = BigInt(CONV_PRECISION_NUMBER);
export const CONV_PRECISION_BIGINT_SQ = CONV_PRECISION_BIGINT ** 2n;
export const FLOAT_BIT_COUNT_NUMBER = 51;
export const FLOAT_BIT_COUNT_BIGINT = BigInt(FLOAT_BIT_COUNT_NUMBER);

export function ncr(n, r) {
	n = BigInt(n);
	r = BigInt(r);
	let res = 1n;
	
	let start, remain;
	
	if (r > n/2n) {
		start = r;
		remain = n-r;
	} else {
		start = n-r;
		remain = r;
	}
	
	for (let p = start + 1n; p <= n; p++) {
		res *= p;
	}
	
	for (let p = 2n; p <= remain; p++) {
		res /= p;
	}
	
	return res;
}

export function ncrlogold(n, r) {
	// calculate n choose r
	let cr = ncr(n, r);
	// copy
	let crn = cr;
	let i = 1n;
	// find greater neighboring power of two
	while (crn > 1n) {
		crn >>= 1n;
		i++;
	}
	
	let shp, p2;
	// less than or equal to mantissa bits
	if (i <= FLOAT_BIT_COUNT_BIGINT) {
		// no shifting
		shp = 0n;
		i = Number(i);
		// take as many bits as we have
		p2 = i;
	} else {
		// shift until we have mantissa bits
		shp = i - FLOAT_BIT_COUNT_BIGINT;
		i = Number(i);
		// take full mantissa bits
		p2 = FLOAT_BIT_COUNT_NUMBER;
	}
	
	// floaten and normalize
	let crp = Number(cr >> shp) / (1 << p2);
	// log
	return i + Math.log2(crp);
}

export function ncrlog(n, r) {
	let res = 0;
	let start, remain;
	
	if (r > (n>>1)) {
		start = r;
		remain = n-r;
	} else {
		start = n-r;
		remain = r;
	}
	
	for (let p = 2; p <= n; p++) {
		if (p > start) {
			if (p > remain) res += Math.log2(p);
		}
		else if (p <= remain) res -= Math.log2(p);
	}
	
	return res;
}

export const LOG_SQRT_TWO_PI = Math.log(2 * Math.PI) / 2;

export function factlog2(n) {
	let x = n + 1;
	let ln = (x - 1/2) * Math.log(x) - x + LOG_SQRT_TWO_PI + 1/(12*x) - 1/(360*x**3);
	return ln / Math.LN2;
}

export function ncrlogex(n, r) {
	return factlog2(n) - factlog2(r) - factlog2(n-r);
}

export function ncrlool(n, r) {
	return [ncrlog, ncrlogex].map(f => benchmark(f, n, r));
}

export function ncrlol(n, r) {
	return [ncrlog, ncrlogex].map(f => f(n, r)).map(x => [x, 2**x]);
}

export function benchmark(f, n, r) {
	let start = performance.now();
	for (let i = 0; i < 100000; i++) {
		f(n, r);
	}
	let end = performance.now();
	return end - start;
}

export function binoold(n, r, p) {
	let pf = 1-p;
	let pr = p**r;
	let pn = pf**(n-r);
	let cr = ncr(n, r);
	return Number(cr) * pr * pn;
}

export function binoacc(n, r, p) {
	let pf = Math.log2(1-p);
	let ps = Math.log2(p);
	let cr = ncrlog(n, r);
	return 2 ** (cr + ps*r + pf*(n-r));
}

export function bino(n, r, p) {
	let pf = Math.log2(1-p);
	let ps = Math.log2(p);
	let cr = ncrlogex(n, r);
	return 2 ** (cr + ps*r + pf*(n-r));
}

export function binolog(n, r, p) {
	let pf = Math.log2(1-p);
	let ps = Math.log2(p);
	let cr = ncrlogex(n, r);
	return cr + ps*r + pf*(n-r);
}

export function binosumprec(n, rs, re, p) {
	let binos = new Array(re - rs + 1);
	let i = 0, mini = 0, min = 0, minabs = Number.POSITIVE_INFINITY;
	for (let r = rs; r <= re; r++) {
		let chance = (binos[i] = binolog(n, r, p));
		let chanceabs = Math.abs(chance);
		if (chanceabs < minabs) {
			min = chance;
			minabs = chanceabs;
			mini = i;
		}
		i++;
	}
	let mul1 = 2 ** min;
	let mul2 = 0;
	for (i = 0; i < binos.length; i++) {
		mul2 += 2 ** (binos[i] - min);
	}
	
	return mul1 * mul2;
}

export function binosum(n, rs, re, p) {
	let total = 0;
	for (let r = rs; r <= re; r++) {
		total += bino(n, r, p);
	}
	if (total > 1) total = 1;
	return total;
}

export function binolessold(n, r, p) {
	let pf = Math.log2(1-p);
	let ps = Math.log2(p);
	let cr = ncrlogold(n, r);
	return 2 ** (cr + ps*r + pf*(n-r));
}

export function fastlog2(x) {
	// to be implemented because js doens't have bitwise float ops
}