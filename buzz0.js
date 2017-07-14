var Buzz = function (arg) {
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
	var state = 0;
	var score = 0;
	var loaded = 0;
	var in_l = 0;
	var in_r = 0;
	var in_u = 0;
	var in_d = 0;
	var in_f = 0;
	var kas = 0;
	var bgcol = ['#ff00ff','#00ffff','#ffff00'];
	var sp_name = ['sp0'];
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
			if (th.checkifdead() == 0) th.lived++;
			var tv = in_f == 0 ? 2.2 : 1.1;
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
			if (state == 2 && th.age - th.lived >= 60) return 3;
			if (state == 1 && th.life <= 0) return 1;
			if (state == 2 && th.age - th.lived < 60) return 2;
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
		th.v = base.v || 0;
		th.dv = base.dv || 0;
		th.theta = base.theta || 0;
		th.tick = function () {
			th.v += th.dv;
			th.x += th.v * Math.cos(th.theta);
			th.y += th.v * Math.sin(th.theta);
			th.age ++;
			return th.age;
		};
		return th;
	};

	this.init = function () {
		state = 0;
		init0();
	};

	var init0 = function () {
		ene = [];
		bg = [];
		frag = [];
		blt_e = [];
		score = 0;
		kas = 0;
		level = 1;
		p = player({x: (w - 2) / 2, y: h - 16, v: 0});
		if (loaded == 0) {
			arg.document.getElementById("c1").style.visibility = 'hidden';
			for (var i = 0; i < sp_name.length; i++) {
				sp[i] = new Image();
				sp[i].src = sp_name[i]+".png";
			}
			ctx[1].font = "12px Consolas";
			loaded = 1;
		}
		for (var i = 0; i < cnt_bg1; i++) bg[i] = bg1({y:Math.random() * h});
		draw();
	};

	this.tick = function () {
		p.tick();
		if (state == 3) return;
		var pd = p.checkifdead();
		if (pd == 1) {
			p.lived = p.age;
			state = 2;
		}
		if (state != 3 && pd ==3) {
			state = 3;
			draw();
			return;
		}
													  
		
		if (ene_schedule[t] != null) {
			if (ene_schedule[t][0] == -1) {
				if (ene_schedule[t][1] == -1 || ene_schedule[t][1] == level) {
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
						life: ene_spec[ene_schedule[t][3]][0]
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
		if (t % 10 == 1 && bg.length < cnt_bg1) {
			bg[bg.length] = bg1({});
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
		if (state == 1 && p.life <= 0) {
			for (var i = 0; i < 100; i++) {
				frag[frag.length] = bg2({x: p.x, y: p.y, v: 3, life: 61});
			}
		}
		if (state == 1 && buzzed > 0) {
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
		if (state == 1) {
			ctx[1].save();
			ctx[1].translate(p.x, p.y);
			ctx[1].rotate(p.theta);
			ctx[1].translate(-p.x, -p.y);
			ctx[1].drawImage(sp[0],0,0,p.size,p.size,p.x-p.size/2,p.y-p.size/2,p.size,p.size);
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
			if (ene[i].ty == 99) {
				if (state == 1) ctx[1].fillText("LEVEL "+level, ene[i].x, ene[i].y);
			} else {
				ctx[1].drawImage(sp[0], tmp * D, 0, ene[i].size, ene[i].size, ene[i].x-ene[i].size/2,ene[i].y-ene[i].size/2,ene[i].size,ene[i].size);
			}      
			ctx[1].restore();
		}

		ctx[1].fillStyle = "#ffffff";
		for (var i = 0; i < blt_e.length;i++) {
			ctx[1].fillRect(blt_e[i].x - blt_e[i].size/2, blt_e[i].y - blt_e[i].size/2, blt_e[i].size, blt_e[i].size);
		}

		if (state == 3) {
			ctx[1].fillText("GAME OVER",145, h/2);
			ctx[1].fillText("hit '1' key to start new game", 100, h/2+25);
		} else if (state == 0) {
			ctx[1].fillText("hit '1' key to start new game", 100, 230);
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
		if (cd == 37) {
			in_l = val;
		} else if (cd == 38) {
			in_u = val;
		} else if (cd == 39) {
			in_r = val;
		} else if (cd == 40) {
			in_d = val;
		} else if (cd == 49) {
			in_f = val;
			if (state == 0 && val == 1) {
				state = 1;
				t = 0;
				init0();
			} else if (state == 3 && val == 1) {
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
			if (ene_mv[th.pt][th.age] != null) {
				if (ene_mv[th.pt][th.age][0] != -1) th.v = ene_mv[th.pt][th.age][0];
				if (ene_mv[th.pt][th.age][1] !== -1) th.dv = ene_mv[th.pt][th.age][1];
				if (ene_mv[th.pt][th.age][2] !== -99) th.theta = ene_mv[th.pt][th.age][2];
				if (ene_mv[th.pt][th.age][3] !== -99) th.dtheta = ene_mv[th.pt][th.age][3];
				if (ene_mv[th.pt][th.age][4] !== -99) th.btheta = ene_mv[th.pt][th.age][4];
				if (ene_mv[th.pt][th.age][5] !== -99) th.bdtheta = ene_mv[th.pt][th.age][5];
				if (ene_mv[th.pt][th.age][6] != -1) th.fptn[th.fptn.length] = [ene_mv[th.pt][th.age][6],0];
				console.log(th.fptn.length + " " + ene_mv[th.pt][th.age][6]);
			}
			if (th.bdtheta == -98) {
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
			if (th.pt != 99) {
				if (th.x <= th.size/2) th.x = th.size/2;
				if (th.y <= th.size/2) th.y = th.size/2;
				if (th.x > w - th.size/2) th.x = w - th.size/2;
				if (th.y > h - th.size/2) th.y = h - th.size/2;
			}
			for (var i = 0; i < th.fptn.length;) {
				if (th.fptn.length == 0) break;
				var tmp = fire_ptn[th.fptn[i][0]][th.fptn[i][1]];
				if (tmp != null) th.gen_bul[tmp]();
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
			'a1v2'     : function () {th.gen_bul['a1vx'](2,0);},
			'a1v3'     : function () {th.gen_bul['a1vx'](3,0);},
			'a1vx'     : function (av,at) {blt_e[blt_e.length] = bul({ty:7,x:th.x,y:th.y,v:av+(level-1)*0.4,theta:th.btheta+Math.PI*at,size:4});},
			'a3v3w2'   : function () {th.gen_bul['a1vx'](3,2/16);th.gen_bul['a1vx'](3,-2/16);},
			'arv2w180' : function () {
				for (var a = 0;a < 1*(1+level*0.2); a++) {
					blt_e[blt_e.length] = bul({ty:7, x:th.x, y:th.y, v:0.6+Math.random()*(1+(level-1)*0.3),theta: th.btheta-Math.PI/2 + Math.random()*Math.PI, size:4});
				}
			},
			'axvxw360' : function (an,av) {
				for (var a = 0;a < an; a++) {
					blt_e[blt_e.length] = bul({ty:7, x:th.x, y:th.y, v:av+(level-1)*0.2, theta: th.btheta+Math.PI*2*a/an, size:4});
				}
			},
			'a8v3w360' : function () {
				th.gen_bul['axvxw360'](8,3);
			}
		};
		return th;
	};
	
	var ene_spec = {
		'0' : [1,10],
		'1' : [1,10],
		'2' : [1,10],
		'3' : [1,10],
		'99': [1,1]
	};
	
	var ene_schedule = {
		'1': [-1,-1,99,99,w/2-35, h/2,  0,Math.PI*2,1000,""],
		'2': [0,  1, 0, 0,   w/2, -20,  3,Math.PI*2,2160   ],
//		'3': [1,  1, 0, 0,   w/2, -20,  3,Math.PI*2,2160   ],
		'0': [-1, 1, 1, 2,    25,h+20,0.5,        0,2800   ]
	};
	
	
	var ene_mv = {
		'0': {
			'0'     :[1,     0,  Math.PI/2,     0,       -0.3, 0.1,'a1v2p1lf50'],
			'80'    :[2, -0.03,          0,  0.01,        -99, -98,'a3v3p3lf20'],
			'120'   :[2, -0.02,    Math.PI, -0.01,        -99, -98,'a3v3p3lf20'],
			'170'   :[2, -0.02,          0,  0.01,        -99, -98,'a3v3p3lf20'],
			'230'   :[2, -0.02,    Math.PI,   -99,        -99, -98,'a1v1p5lf20'],
			'300'   :[0,     0,        -99,   -99,        -99, -98,'ar180v2p2lf50'],
			'350'   :[0,     0,        -99,   -99,        -99, -98,'ar180v2p2lf50'],
			'400'   :[1,     0,Math.PI*3/2,     0,          0, -98,'ar180v2p2lf50'],
			'450'   :[1,     0,Math.PI*3/2,     0,          0, -98,'ar180v2p2lf50'],
			'500'   :[0,     0,Math.PI*3/4,     0,          0, -98,'a1v2p1lf50'],
			'550'   :[0,     0,        -99,   -99,        -99, -98,'a1v2p1lf50'],
			'600'   :[0,     0,        -99,   -99,        -99, -98,'a1v2p1lf50'],
			'650'   :[0,     0,        -99,   -99,        -99, -98,'a1v2p1lf50'],
			'700'   :[2, -0.01,          0,     0,          0, -98,'a1v2p1lf50'],
			'750'   :[2, -0.01,          0,     0,          0, -98,'a1v1p5lf20'],
			'800'   :[2, -0.01,          0,     0,          0, -98,'a8_360v3p5lf50'],
			'850'   :[3, -0.02,    Math.PI,     0,          0,0.08,'a1v2p1lf50'],
			'900'   :[3, -0.02,        -99,     0,        -99,0.08,'a1v2p1lf50'],
			'950'   :[0.5,   0,  Math.PI/4,  0.01,        -99, -98,'a8_360v3p5lf50'],
			'1200'  :[1, 0.002,          0,  0.01,          0, 0.1,'a8_360v3p5lf50'],
			'1250'  :[0,     0,        -99,  0.01,        -99, 0.1,'a8_360v3p5lf50'],
			'1300'  :[0,     0,        -99,  0.01,        -99, 0.1,'a8_360v3p5lf50'],
			'1400'  :[3, -0.02,Math.PI*7/4, -0.01,          0, -98,'a8_360v3p5lf50'],
			'1650'  :[2, -0.02,Math.PI*3/4,     0,Math.PI*3/4,-0.1,'a1v2p1lf50'],
			'1700'  :[2, -0.02,        -99,     0,        -99,-0.1,'a1v2p1lf50'],
			'1800'  :[1,     0,          0,     0,          0, -98,'ar180v2p1lf20'],
			'1850'  :[1,     0,          0,     0,          0, -98,'none'],
			'1900'  :[1,     0,          0,     0,          0, -98,'ar180v2p1lf20'],
			'2000'  :[2,  0.05,Math.PI*7/4,     0,          0, -98,'a1v2p1lf50'],
			'2100'  :[3,     0,    Math.PI,-0.005,          0, -98,'a8_360v3p5lf50']
		    },
		'2': {
			'0'   :[1,0,Math.PI*3/2,0,  Math.PI/2,  0,'a1v3p3lf50'],
			'50'  :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'100' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'150' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'200' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'250' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'300' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'350' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'400' :[1,0,          0,0,    Math.PI,  0,'a1v3p3lf50'],
			'450' :[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'500' :[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'550' :[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'600' :[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'650' :[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'700' :[1,0,  Math.PI/2,0,Math.PI*3/2,-99,'a1v3p3lf50'],
			'750' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'800' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'850' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'900' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'950' :[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1000':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1050':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1100':[1,0,    Math.PI,0,          0,-99,'a1v3p3lf50'],
			'1150':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1200':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1250':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1300':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1350':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1400':[1,0,Math.PI*3/2,0,Math.PI*3/2,  0,'a1v3p3lf50'],
			'1450':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1500':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1550':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1600':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1650':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1700':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1750':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'1800':[1,0,          0,0,          0,  0,'a1v3p3lf50'],
			'1850':[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'1900':[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'1950':[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'2000':[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'2050':[1,0,        -99,0,        -99,  0,'a1v3p3lf50'],
			'2100':[1,0,  Math.PI/2,0,  Math.PI/2,-99,'a1v3p3lf50'],
			'2150':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2200':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2250':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2300':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2350':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2400':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2450':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2500':[1,0,    Math.PI,0,    Math.PI,-99,'a1v3p3lf50'],
			'2550':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2600':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2650':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2700':[1,0,        -99,0,        -99,-99,'a1v3p3lf50'],
			'2750':[1,0,        -99,0,        -99,-99,'a1v3p3lf50']
		},
		'99': {
			'0'  :[ 0,  0,0,0,0,0,-1],
			'100':[-1,0.3,0,0,0,0,-1]
		}
	};

	var fire_ptn = {
		'none' : {
			'lf':1
		},
		'a1v2p1lf50' : {
			'lf':50,
			'1':'a1v2','2':'a1v2','3':'a1v2','4':'a1v2','5':'a1v2','6':'a1v2','7':'a1v2','8':'a1v2','9':'a1v2','10':'a1v2',
			'11':'a1v2','12':'a1v2','13':'a1v2','14':'a1v2','15':'a1v2','16':'a1v2','17':'a1v2','18':'a1v2','19':'a1v2','20':'a1v2',
			'21':'a1v2','22':'a1v2','23':'a1v2','24':'a1v2','25':'a1v2','26':'a1v2','27':'a1v2','28':'a1v2','29':'a1v2','30':'a1v2',
			'31':'a1v2','32':'a1v2','33':'a1v2','34':'a1v2','35':'a1v2','36':'a1v2','37':'a1v2','38':'a1v2','39':'a1v2','40':'a1v2',
			'41':'a1v2','42':'a1v2','43':'a1v2','44':'a1v2','45':'a1v2','46':'a1v2','47':'a1v2','48':'a1v2','49':'a1v2','50':'a1v2'
		},
		'a3v3p3lf20' : {
			'lf':20,
			'0':'a3v3w2','3':'a3v3w2','6':'a3v3w2','9':'a3v3w2','12':'a3v3w2','15':'a3v3w2','18':'a3v3w2'
		},
		'a1v1p5lf20': {
			'lf':20,
			'0':'a1v2','5':'a1v2','10':'a1v2','15':'a1v2','20':'a1v2'
		},
		'ar180v2p2lf50': {
			'lf':50,
			'0':'arv2w180','2':'arv2w180','4':'arv2w180','6':'arv2w180','8':'arv2w180',
			'10':'arv2w180','12':'arv2w180','14':'arv2w180','16':'arv2w180','18':'arv2w180',
			'20':'arv2w180','22':'arv2w180','24':'arv2w180','26':'arv2w180','28':'arv2w180',
			'30':'arv2w180','32':'arv2w180','34':'arv2w180','36':'arv2w180','38':'arv2w180',
			'40':'arv2w180','42':'arv2w180','44':'arv2w180','46':'arv2w180','48':'arv2w180'
		},
		'a8_360v3p5lf50': {
			'lf':50,
			'0':'a8v3w360','5':'a8v3w360','10':'a8v3w360','15':'a8v3w360','20':'a8v3w360',
			'25':'a8v3w360','30':'a8v3w360','35':'a8v3w360','40':'a8v3w360','45':'a8v3w360','50':'a8v3w360'
		},
		'ar180v2p1lf20': {
			'lf':20,
			'0':'arv2w180','1':'arv2w180','2':'arv2w180','3':'arv2w180','4':'arv2w180',
			'5':'arv2w180','6':'arv2w180','7':'arv2w180','8':'arv2w180','9':'arv2w180',
			'10':'arv2w180','11':'arv2w180','12':'arv2w180','13':'arv2w180','14':'arv2w180',
			'15':'arv2w180','16':'arv2w180','17':'arv2w180','18':'arv2w180','19':'arv2w180'
		},
		'a1v3p3lf50': {
			'lf':50,
			'0':'a1v3','3':'a1v3','6':'a1v3','9':'a1v3','12':'a1v3',
			'15':'a1v3','18':'a1v3','21':'a1v3','24':'a1v3','27':'a1v3',
			'30':'a1v3','33':'a1v3','36':'a1v3','39':'a1v3','42':'a1v3',
			'45':'a1v3','48':'a1v3'
		}
	};
};
