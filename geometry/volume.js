/**
 * @param {number} D - Diameter of cut-area.
 * @param {number} H - Height of Cylinder.
 * @param {number} P - Density of Gas.
 */
function GasCylinder(D, H, P){
	//this.D=1.89, this.H=4.5, this.P=1176;
	this.D = D, this.H = H, this.P = P;
}

/**
 * @param {number} [d] - cylinder's diameter.
 * @param {number} [h] - cylinder's height.
 */
GasCylinder.prototype.v = function(d, h) {
	if(d == null) d = this.D;
	if(h == null) h = this.H;
	return Math.PI*(d/2)*(d/2)*h;
}

/**
 * @param {number} [d] - cylinder's diameter.
 * @param {number} [h] - cylinder's height.
 */
GasCylinder.prototype.moon_area = function(d, h) {
	if(d == null) d = this.D;
	if(h == null) h = this.H;
	let r = d/2;
	let a = Math.acos((h-r)/r) * 2;
	let moon_area = 1/2 * a * r*r - 1/2 * r*r * Math.sin(a);
	return moon_area;
}

/**
 * @param {number} d1 - height from bottom to the top of the inner-liquid 
 * of a flatwise cylinder.
 * @param {number} [d] - diameter of cylinder.
 * @param {number} [h] - length of a flatwise cylinder.
 * @param {number} [p] - density of the liquid in cylinder.
 * @returs {number} - the real volume of the liquid in cylinder.
 */
GasCylinder.prototype.realV = function(d1, d, h, p) {
	if(d == null) d = this.D;
	if(h == null) h = this.H;
	if(p == null) p = this.P;
	return (this.v(d,h)-this.moon_area(d,d1)*h)*p;
}

