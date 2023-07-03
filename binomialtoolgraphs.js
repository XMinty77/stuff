const X_LABELS = 20;
const Y_LABELS = 20;
const X_LABELS_MUL = 1 / X_LABELS;
const Y_LABELS_MUL = 1 / Y_LABELS;

export async function plot(points, xLabeller = undefined, yLabeller = undefined, range = {}, highlights = [], pow_labels = false) {
	if (xLabeller == undefined) xLabeller = (x) => x.toFixed(0);
	if (yLabeller == undefined) yLabeller = (x) => (x * 100).toFixed(3) + "%";
	
	const WIDTH			= 4000;
	const HEIGHT		= 4000;
	const MARGIN_X		= 512;
	const MARGIN_Y		= 312;
	const LABEL_X		= 50;
	const LABEL_Y		= 50;
	const LABEL_SPACE_X	= MARGIN_Y / 3;
	const LABEL_SPACE_Y	= MARGIN_X / 4;
	const WIDTH_TOT		= WIDTH + MARGIN_X * 2;
	const HEIGHT_TOT	= HEIGHT + MARGIN_Y * 2;
	const LABEL_FONT	= "72px Cambria MAth";
	
	const cvs = new OffscreenCanvas(WIDTH_TOT, HEIGHT_TOT);
	const ctx = cvs.getContext("2d");
	
	let minx = Number.POSITIVE_INFINITY, maxx = Number.NEGATIVE_INFINITY;
	let miny = Number.POSITIVE_INFINITY, maxy = Number.NEGATIVE_INFINITY;
	
	let rangeMinx = range.hasOwnProperty("minx");
	let rangeMaxx = range.hasOwnProperty("maxx");
	let rangeMiny = range.hasOwnProperty("miny");
	let rangeMaxy = range.hasOwnProperty("maxy");
	
	for (let i = 0; i < points.length; i += 2) {
		let x = points[i];
		let y = points[i + 1];
		if (!rangeMinx && x < minx) minx = x;
		if (!rangeMaxx && x > maxx) maxx = x;
		if (!rangeMiny && y < miny) miny = y;
		if (!rangeMaxy && y > maxy) maxy = y;
	}
	
	if (rangeMinx) minx = range.minx;
	if (rangeMaxx) maxx = range.maxx;
	if (rangeMiny) miny = range.miny;
	if (rangeMaxy) maxy = range.maxy;
	
	const mulx = maxx - minx;
	const muly = maxy - miny;
	
	const LABEL_X_MAX_WIDTH = X_LABELS_MUL * mulx;
	const LABEL_Y_MAX_WIDTH = MARGIN_X * 0.75;
	
	ctx.fillStyle = "#121212";
	ctx.fillRect(0, 0, WIDTH_TOT, HEIGHT_TOT);
	
	ctx.strokeStyle = "white";
	
	let xToCoord = (x) => {
		return (x - minx) * WIDTH / mulx + MARGIN_X;
	};
	let yToCoord = (y) => {
		return HEIGHT - ((y - miny) * HEIGHT / muly) + MARGIN_Y;
	};
	
	
	// x/y axes
	ctx.lineWidth = 15;
	
	ctx.beginPath();
	ctx.moveTo(xToCoord(minx), yToCoord(maxy));
	ctx.lineTo(xToCoord(minx), yToCoord(Math.min(0, miny)));
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(xToCoord(0), yToCoord(0));
	ctx.lineTo(xToCoord(maxx), yToCoord(0));
	ctx.stroke();
	
	
	// plot points
	ctx.beginPath();
	ctx.moveTo(xToCoord(points[0]), yToCoord(points[1]));
	
	for (let i = 2; i < points.length; i += 2) {
		let x = xToCoord(points[i]);
		let y = yToCoord(points[i + 1]);

		ctx.lineTo(x, y);
	}
	
	ctx.stroke();
	
	
	// highlight
	ctx.lineWidth = 12;
	ctx.setLineDash([30, 60]);
	
	for (const highlight of highlights) {
		let highlight_x = xToCoord(highlight.x);
		let highlight_y = yToCoord(highlight.y);
		
		ctx.beginPath();
		ctx.moveTo(highlight_x, highlight_y);
		ctx.lineTo(xToCoord(minx), highlight_y);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(highlight_x, highlight_y);
		ctx.lineTo(highlight_x, yToCoord(0));
		ctx.stroke();
	}
	
	
	// labels
	ctx.setLineDash([]);
	ctx.lineWidth = 10;
	ctx.fillStyle = "white";
	ctx.font = LABEL_FONT;
	
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	
	// let x_labels = Math.min(X_LABELS, points.length / 2);
	// let x_labels_inc = Math.floor(mulx / x_labels);
	// if (x_labels_inc == 0) x_labels_inc = 1;
	// if (int_labels) x_labels = Math.floor(mulx / x_labels_inc);
	// let x_labels_mul = 1 / x_labels;
	// for (let i = 0; i <= x_labels; i++) {
		// let ix = int_labels ? (i * x_labels_inc) : (i * x_labels_mul * mulx + minx);
		// let x = xToCoord(ix);
		// let y = yToCoord(0);
		// let label = xLabeller(ix);
		
		// ctx.beginPath();
		// ctx.moveTo(x, y + LABEL_X);
		// ctx.lineTo(x, y - LABEL_X);
		// ctx.stroke();
		
		// ctx.fillText(label, x, y + LABEL_SPACE_X);
	// }
	
	let labels = Math.min(X_LABELS, points.length / 2);
	let label_inc = Math.max(1, Math.floor(mulx / labels));
	labels = Math.floor(mulx / label_inc);
	if ((labels * label_inc) > maxx) labels--;
	for (let i = 0; i <= labels; i++) {
		let ix = i * label_inc + minx;
		let x = xToCoord(ix);
		let y = yToCoord(0);
		let label = xLabeller(ix);
		
		if (i > 0) {
			ctx.beginPath();
			ctx.moveTo(x, y + LABEL_X);
			ctx.lineTo(x, y - LABEL_X);
			ctx.stroke();
		}
		
		ctx.fillText(label, x, y + LABEL_SPACE_X);
	}
	
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	for (let i = 1; i <= Y_LABELS; i++) {
		let iy = i * Y_LABELS_MUL * muly;
		let x = xToCoord(minx);
		let y = yToCoord(iy);
		let label = yLabeller(iy);
		
		ctx.beginPath();
		ctx.moveTo(x + LABEL_Y, y);
		ctx.lineTo(x - LABEL_Y, y);
		ctx.stroke();
		
		ctx.fillText(label, x - LABEL_SPACE_Y, y);
	}
	
	let blob = await cvs.convertToBlob();
	return blob;
}