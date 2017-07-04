var Kasuri = function (arg) {
	var t = 0;
	var t_cycle = 2160;
	var ctx = [arg.document.getElementById("c1").getContext("2d"), arg.document.getElementById("c2").getContext("2d")];
	var w = 360;
	var h = 480;
	var off = 20;
	var off_y_max = h+off;
	var off_y_min = 0-off;
	var off_x_max = w + off;
	var off_x_min = 0-off;
	var ene = [];
	var bg = [];
	var frag = [];
	var blt_e = [];
	var cnt_bg1 = 30;
	var p = null;
	var state = score = loaded = g_mode = in_l = in_r = in_u = in_d = in_f = kas = 0;
	var bgcol = ['#ff00ff','#00ffff','#ffff00'];
	var sp_name = ["sp1"];
	var sp = [];
	var D = 16;
	var level = 1;
	var hi = [];

	var obj = function (base) {
		var th = {};
		th.age = 0;
		th.size = base.size || D;
		th.core = base.core || 4;
		th.x = base.x || 0;
		th.y = base.y || 0;
		th.v = base.v || 0;
		th.dv = base.dv || 0;
		th.theta = base.theta || 0;
		th.dtheta = base.dtheta || 0;
		th.isout = function () {
			return th.x < off_x_min
				|| th.x > off_x_max
				|| th.y < off_y_min
				|| th.y > off_y_max;
		};
		return th;
	};

	var bg1 = function (base) {
		var th = obj(base);
		th.x = Math.random() * w;
		th.y = base.y || 0;
		th.v = Math.random() + 0.5;
		th.size = 2;
		th.tick = function () {
			th.age++;
			th.y += th.v;
			return th.age;
		};
		th.isout = function () {
			return th.x < off_x_min
				|| th.x > off_x_max
				|| th.y < off_y_min
				|| th.y > off_y_max;
		};
		return th;
	};

	var bg2 = function (base) {
		var th = obj(base);
		th.x = base.x || 0;
		th.y = base.y || 0;
		th.v = Math.random() * base.v;
		th.theta = Math.random() * Math.PI * 2 - Math.PI;
		th.size = 2;
		th.tick = function () {
			if (th.v < 0) th.v = 0;
			th.x += th.v * Math.cos(th.theta);
			th.y += th.v * Math.sin(th.theta);
			th.age++;
			return th.age;
		};
		th.isout = function () {
			return th.age > base.life;
		};
		return th;
	};

	var player = function (base) {
		var th = obj(base);
		th.life = base.life || 1;
		th.lived = -1e4;
		th.theta = Math.PI * 3 / 2;
		th.tick = function () {
			if (th.checkifdead() >= 3) return th.age;
			th.age++;
			if (th.checkifdead() === 0) th.lived++;
			var tv = in_f === 0 ? 2.2 : 1.1;
			th.x += (in_r - in_l) * tv;
			th.y += (in_d - in_u) * tv;
			if (th.x <= th.size / 2) th.x = th.size / 2;
			if (th.y <= th.size / 2) th.y = th.size / 2;
			if (th.x > w - th.size / 2) th.x = w - th.size / 2;
			if (th.y > h - th.size / 2) th.y = h - th.size / 2;
			return th.age;
		};
		//th.move = function  (dir) {};
		th.checkifdead = function () {
			if (state === 2 && th.age - th.lived >= 60) return 3;
			if (state === 1 && th.life <= 0) return 1;
			if (state === 2 && th.age - th.lived < 60) return 2;
			return 0;
		};
		return th;
	};

	var bul = function (base) {
		var th = obj(base);
		th.life = base.life || 1;
		th.ty = base.ty || 0;
		th.py = base.py || 0;
		th.size = base.size || 0;
		th.x = base.x || 0;
		th.y = base.y || 0;
		th.dv = base.dv || 0;
		th.theta = base.theta || 0;
		th.tick = function () {
			th.v += th.dv;
			th.theta += th.dvtheta;
			th.x += th.v * Math.cos(th.theta);
			th.y += th.v * Math.sin(th.theta);
			th.age ++;
			return th.age;
		};
		return th;
	};

	this.init = function () {
		state = 0;
		g_mode = 0;
		init0();
	};

	var init0 = function () {
		ene = [];
		bg = [];
		frag = [];
		blt_p = [];
		blt_e = [];
		score = 0;
		kas = 0;
		level = 0;
		p = player({x: (w - 2) / 2, y: h - 16, v: 0});
		if (loaded === 0) {
			arg.document.getElementById("cv1").style.visibility = 'hidden';
			for (var i = 0; sp_name.length; i++) {
				sp[i] = new Image();
				sp[i].src = sp_name[i]+".png";
			}
			ctx[1].font = "12px Bodoni MT Black";
			arg.addEventListener("keydown", world.kd);
			arg.addEventListener("keyup", world.ku);
			arg.setInterval(world.tick, 21);
			loaded = 1;
		}
		for (var i = 0; i < cnt_bg1; i++) bg[i] = bg1({y:Math.random() * h});
		draw();
	};

	var tick = function () {
		p.tick();
		if (state === 3) return;
		var pd = p.checkifdead();
		if (pd === 1) {
			p.lived = p.age;
			state = 2;
		}
		if (state !== 3 && pd ===3) {
			state = 3;
			draw();
			return;
		}
													  
		
		if (ene_schedule[t] !== null) {
			if (ene_schedule[t][0] === g_mode || ene_schedule[t][0] === -1) {
				if (ene_schedule[t][1] === -1 || ene_schedule[t][1] === level) {
					ene[ene.length] = enemy({
						md: ene_schedule[t][0],
						lv: ene_schedule[t][1],
						ty: ene_schedule[t][2],
						pt: ene_schedule[t][3],
						x:  ene_schedule[t][4],
						y:  ene_schedule[t][5],
						v:  ene_schedule[t][6],
						theta: ene_schedule[t][7],
						cycle: ene_schedule[t][8],
						txt: ene_schedule[t][9],
						life: ene_spec[ene_schedule[t][2]][0]
					});
				}
			}
		}

		for (var i = 0; i < ene.length;) {
			ene[i].tick();
			if (ene[i].isout() || ene[i].life <= 0) ene.splice(i,1);
			else i++;
		}
		for (var i = 0; i < blt_e.length;) {
			blt_e[i].tick();
			if (blt_e[i].isout() || blt_e[i].life <= 0) blt_e.splice(i,1);
			else i++;
		}

		check_collision();
		p.checkifdead();
		if (t % 10 === 1 && bg.length < cnt_bg1) {
			bt[bt.length] = bt1({});
		}
		for (var i = 0; i < bg.length;) {
			bg[i].tick();
			if (bg[i].isout()) bg.splice(i, 1);
			else i++;
		}
		for (var i = 0; i < frag.length;) {
			frag[i].tick();
			if (frag[i].isout()) frag.splice(i, 1);
			else i++;
		}
		draw();
		if (t++ > t_cycle) {
			level++;
			t = 0;
		}
	};

	var check_collision = function () {
		var tkas = 0;
		for (var i = 0; i < ene.length; i++) {
			var buzzed = 0;
			if (Math.abs(ene[i].x - p.x) < 8 && Math.abs(ene[i].y - p.y) < 8) {
				if (p.life-- <= 0) break;
			}
		}
		var t_v = 0;
		var t_t = 0;
		for (var i = 0; i < blt_e.length; i++) {
			if (Math.abs(blt_e[i].x - p.x) < 16 && Math.abs(blt_e[i].y - p.y) < 16) buzzed += 2*level,tkas++;
			if (Math.abs(blt_e[i].x - p.x) < 10 && Math.abs(blt_e[i].y - p.y) < 10) buzzed += 2*level;
			if (Math.abs(blt_e[i].x - p.x) < 6 && Math.abs(blt_e[i].y - p.y) < 6) {
				if (p.life-- <= 0) break;
			}
		}
		if (t+1 >= t_cycle - 65 && level == 3 && g_mode === 1) p.life = 0;
		if (state === 1 && p.life <= 0) {
			for (var i = 0; i < 100; i++) {
				frag[frag.length] = bg2({x: p.x, y: p.y, v: 3, life: 61});
			}
		}
		if (state === 1 && buzzed > 0) {
			frag[frag.length] = bg2({x: p.x, y: p.y, v: 4, life: 15});
			score += buzzed;
			kas += tkas;
		}
	};

	var draw = function () {
		ctx[1].beginPath();
		ctx[1].fillStyle = "#000000";
		ctx[1].globalAlpha = 0.6;
		ctx[1].fillRect(0, 0, w, h);
		if (state === 1) {
			ctx[1].save();
			ctx[1].translate(p.x, p.y-2);
			ctx[1].rotate(p.theta);
			ctx[1].translate(-p,x, -p.y-2);
			ctx[1].drawImage(sp[0],3*D,0,p.size,p.size,p.x-p.size/2,p.y-p.size/2-2,p.size,p.size);
			ctx[1].restore();
		}
		for (var i = 0; i < bg.length;i++) {
			ctx[1].fillStyle = bgcol[i % bgcol.length];
			ctx[1].fillRect(bg[i].x - bg[i].size, bg[i].y - bg[i].size, bg[i].size, bg[i].size);
		}

		for (var i = 0; i < frag.length;i++) {
			ctx[1].fillStyle = "#ffffff";
			ctx[1].fillRect(frag[i].x - frag[i].size/2, frag[i].y - frag[i].size/2, frag[i].size, frag[i].size);
		}
		ctx[1].fillStyle = "#ffffff";
		for (var i = 0; i < ene.length;i++) {
			ctx[1].save();
			ctx[1].translate(ene[i].x, ene[i].y);
			ctx[1].rotate(ene[i].btheta);
			ctx[1].translate(-ene[i].x, -ene[i].y);
			var tmp = ene[i].age < -5 ? 5 : ene[i].age < 0 ? 6 : ene[i].ty;
			if (ene[i].ty === 99) {
				if (state === 1) ctx[i].fillText("LEVEL "+level, ene[i].x, ene[i].y);
			} else {
				ctx[1].drawImage(sp[0], tmp * D, 0, ene[i].size, ene[i].size, ene[i].x-ene[i].size/2,ene[i].y-ene[i].size/2-2,ene[i],size,ene[i].size);
			}
			ctx[1].restore();
		}
		for (var i = 0; i < blt_e.length;i++) {
			ctx[1].fillStyle = "#ffffff";
			ctx[1].fillRect(blt_e[i].x - blt_e[i].size/2, blt_e[i].y - blt_e[i].size/2, blt_e[i].size, blt_e[i].size);
		}

		if (state === 3) {
			ctx[1].fillText("GAME OVER",130, h/2);
			ctx[1].fillText("hit 1 or 2 key", 120, h/2+25);
		} else if (state === 0) {
			ctx[1].fillText("1 key to start GAME A", 85, 130);
			ctx[1].fillText("2 key to start GAME B", 85, 150);
		}

		ctx[1].fillText("SCORE", 5,15);
		ctx[1].fillText(score, 65, 15);
		ctx[1].fillText("LEVEL  " + level, w-75, 15);
		ctx[0].putImageData(ctx[1].getImageData(0,0,w,h),0,0);
	};

	this.kd = function (e) {
		mv(e.keyCode, 1);
	};

	this.ku = function (e) {
		mv(e.keyCode, 0);
	};

	var mv = function (cd,val) {
		if (cd === 37) {
			in_l = val;
		} else if (cd === 38) {
			in_u = val;
		} else if (cd === 39) {
			in_r = val;
		} else if (cd === 40) {
			in_d = val;
		} else if (cd === 49 || cd === 50) {
			in_f = val;
			if (state === 0 && val === 1) {
				g_mode = cd === 49 ? 0 : 1;
				state = 1;
				t = 0;
				init0();
			} else if (state === 3 && val === 1) {
				state = 0;
			}
		}
	};

	var enemy = function (base) {
		var th = obj(base);
		th.md = base.md || 99;
		th.ty = base.ty || 0;
		th.pt = base.pt || 0;
		th.life = base.life || 0;
		th.txt = base.txt || null;
		th.btheta = base.btheta || Math.PI/2;
		th.bdtheta = 0;
		th.fptn = [];
		th.cycle = base.cycle || 1000;
		th.tick = function () {
			if (ene_mv[th.pt][th.age] !== null) {
				if (ene_mv[th.pt][th.age][0] !== -1) th.v = ene_mv[th.pt][th.age][0];
				if (ene_mv[th.pt][th.age][1] !== -1) th.dv = ene_mv[th.pt][th.age][1];
				if (ene_mv[th.pt][th.age][2] !== -99) th.theta = ene_mv[th.pt][th.age][2];
				if (ene_mv[th.pt][th.age][3] !== -99) th.dtheta = ene_mv[th.pt][th.age][3];
				if (ene_mv[th.pt][th.age][4] !== -99) th.btheta = ene_mv[th.pt][th.age][4];
				if (ene_mv[th.pt][th.age][5] !== -99) th.bdtheta = ene_mv[th.pt][th.age][5];
				if (ene_mv[th.pt][th.age][6] !== -1) th.fptn[th.fptn.length] = [ene_mv[th.pt][th.age][6],0];
			}
			if (th.bdtheta === -98) {
				var tt = Math.atan2(p.y-th.y, p.x-th.x);
				if (tt < 0) tt += Math.PI*2;
				var quo1 = th.btheta - (th.btheta % (Math.PI/16));
			var quo2 = tt - (tt % (Math.PI/16));
				if (tt > th.btheta && quo2 > quo1) {
					th.btheta = quo2;
				} else if (tt < th.btheta && quo2 < quo1) {
					th.btheta = quo2;
				}
			} else {
				th.btheta += th.bdtheta;
			}
			th.v += th.dv;
			th.theta += th.dtheta;
			th.x += th.v * Math.cos(th.theta);
			th.y += th.v * Math.sin(th.theta);
			if (th.pt !== 99) {
				if (th.x <= th.size/2) th.x = th.size/2;
				if (th.y <= th.size/2) th.y = th.size/2;
				if (th.x > w - th.size/2) th.x = w - th.size/2;
				if (th.y > h - th.size/2) th.y = h - th.size/2;
			}
			for (var i = 0; i < th.fptn.length;) {
				if (th.fptn.length === 0) break;
				var tmp = fire_ptn[th.fptn[i][0]][th.fptn[i][1]];
				if (tmp !== null) th.gen_bul[tmp]();
				th.fptn[i][1]++;
				if (th.fptn[i][1] >= fire_ptn[th.fptn[i][0]]['lf']) {
					th.fptn.splice(i, 1);
				} else {
					i++;
				}
			}
			th.age++;
			if (th.age >= th.cycle) th.age = 0;
			return th.age;
		};

		th.gen_bul = {



		};

		var ene_spec = {


		};

		var ene_schedule = {


		};


		var ene_mv = {

		};

		var fire_ptn = {

		};
		

};
