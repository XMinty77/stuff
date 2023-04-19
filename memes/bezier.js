const DEFAULT_SAMPLING = 60 * 100;
const DEFAULT_TOLERANCY = 0.05;
const DEFAULT_URGENCE = 0.55;

class BezierCurve {
	tolerate;
	Control1;
	Control2;
	Samples;

	// Sampling: Number of this.Samples taken
	// Tolerancy:
	//   The ratio of tolerated distance error between this.Samples to the ideal distance
	//   1 is full tolerancy - any value is accepted
	//   0 is no tolerancy - only the exact ideal sample value is accepted
	// Urgence:
	//   How fast will the sampler try to go from one sample to the next
	//   0 is infinitely thorough (never finishes)
	//   1 is very impatient (tries to make a single jump)
	constructor(c1, c2, sampling = DEFAULT_SAMPLING, tolerancy = DEFAULT_TOLERANCY, urgence = DEFAULT_URGENCE)
	{
		this.Control1 = c1;
		this.Control2 = c2;

		// Prepare this.Samples list
		this.Samples = [];
		this.Samples.push([0, 0]);

		// Sampling state variables
		let count = 0;
		let t = 0, x = 0, cx = 0;
		// Distance between each sample
		let size = 1 / sampling;
		// Tolerated distance
		let tolerate = tolerancy * size;
		this.tolerate = tolerate * 3;
		while (true)
		{
			// Try to take evenly spaced this.Samples
			count++;
			x = size * count;
			if (x >= 1) break;

			// Too far from target sample X
			while (Math.abs(x - cx) > tolerate)
			{
				// Use the derivative to make an educated jump towards the next sample based on "urgence"
				// Calculate next guess for t the time parameter / x is always increasing
				t += (x - cx) * urgence / this.dx(t);
				// Calculate respective x value of t
				cx = this.x(t) * Math.sign(x - cx);
			}

			// Add the sample
			this.Samples.push([x, this.y(t)]);
		}

		this.Samples.push([1, 1]);
	}

	static Create(preset, sampling = DEFAULT_SAMPLING, tolerancy = DEFAULT_TOLERANCY, urgence = DEFAULT_URGENCE)
	{
		const DEL_STR = 13;
		const DEL_END = 1;
		preset = preset.substring(0, preset.length - DEL_END).substring(DEL_STR);
		var strs = preset.split(',');
		var factors = new Array(strs.length);
		for (let i = 0; i < strs.length; i++) factors[i] = Number(strs[i]);
		return new BezierCurve([factors[0], factors[1]], [factors[2], factors[3]], sampling, tolerancy, urgence);
	}

	x(t)
	{
		let tc = t * t * t;
		let ts = t * t;
		let f1 = 3 * tc - 6 * ts + 3 * t;
		let f2 = -3 * tc + 3 * ts;
		return this.Control1[0] * f1 + this.Control2[0] * f2 + tc;
	}

	y(t)
	{
		let tc = t * t * t;
		let ts = t * t;
		let f1 = 3 * tc - 6 * ts + 3 * t;
		let f2 = -3 * tc + 3 * ts;
		return this.Control1[1] * f1 + this.Control2[1] * f2 + tc;
	}

	dx(t)
	{
		let ts = t * t;
		let f1 = 9 * ts - 12 * t + 3;
		let f2 = -9 * ts + 6 * t;
		let f3 = 3 * ts;
		return this.Control1[0] * f1 + this.Control2[0] * f2 + f3;
	}

	dy(t)
	{
		let ts = t * t;
		let f1 = 9 * ts - 12 * t + 3;
		let f2 = -9 * ts + 6 * t;
		let f3 = 3 * ts;
		return this.Control1[1] * f1 + this.Control2[1] * f2 + f3;
	}

	anim(t)
	{
		let closest = [0, 0];
		let closestDist = t;
		let i = Math.floor(Math.max(0, Math.floor((t - this.tolerate) * this.Samples.length)));
		for (; true; i++)
		{
			if (i >= this.Samples.length)
			{
				closest = this.Samples[this.Samples.length - 1];
				break;
			}
			let val = this.Samples[i];
			let dist = Math.abs(t - val[0]);
			if (dist > closestDist) break;
			closestDist = dist;
			closest = val;
		}
		return closest[1];
	}
}