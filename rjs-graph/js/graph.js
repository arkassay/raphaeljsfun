function RJSGraph( canvas, options ) {
	var gvar = {};
	gvar.options = options;
	gvar.options = {
		 "height" : 100,
		 "leftgutter" : 20,
	     "bottomgutter" : 20,
	     "topgutter" : 20,
		 "graphPortion" : (gvar.options.graphPortion) ? gvar.options.graphPortion : "top",
	}
	
	gvar.getAnchors = function(p1x, p1y, p2x, p2y, p3x, p3y) {
		var l1 = (p2x - p1x) / 2,
            l2 = (p3x - p2x) / 2,
            a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
            b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
        a = p1y < p2y ? Math.PI - a : a;
        b = p3y < p2y ? Math.PI - b : b;
        var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
            dx1 = l1 * Math.sin(alpha + a),
            dy1 = l1 * Math.cos(alpha + a),
            dx2 = l2 * Math.sin(alpha + b),
            dy2 = l2 * Math.cos(alpha + b);
        return {
            x1: p2x - dx1,
            y1: p2y + dy1,
            x2: p2x + dx2,
            y2: p2y + dy2
        };
	}
	gvar.init = function(data){
		gvar.labels = [2000,"","","",2004,"","","",2008,"","","",2012,"","","","","",2018];
		gvar.baseLine = data[0];  //get the data for 2000
		// Draw
		gvar._drawGraph(gvar.baseLine, data, gvar.options);
	}
	gvar._drawGraph = function(breakLine, data, gc){
	        width = $(window).width()-gc.leftgutter;
			txt = {font: '12px Helvetica, Arial', fill: "#fff"},
	        X = (width - gc.leftgutter) / gvar.labels.length,
	        max = Math.max.apply(Math, data),
	        Y = (gc.height - gc.bottomgutter - gc.topgutter) / max;
			
			if(gc.graphPortion == "top"){
				var color = "#FFF";
			}
			else{
				var color = "#FF0000";
			}
			var graphBaselineY = Math.round(gc.height - gc.bottomgutter - Y * breakLine);
			if(gc.graphPortion == "top"){
				gvar.r = Raphael(canvas, width, graphBaselineY);
				gvar.graphBaseline = gvar.r.path("M"+40+","+graphBaselineY+"L"+(width-20)+","+graphBaselineY).attr({"stroke-width": 1, stroke: "#FFFFFF"}).toFront();
			}
			else{
				gvar.r = Raphael(canvas, width, gc.height - graphBaselineY);
			}
		 	var path = gvar.r.path().attr({stroke: color, "stroke-width": 4, "stroke-linejoin": "round"}),
		        bgp = gvar.r.path().attr({stroke: "none", opacity: .3, fill: color}),
				label = gvar.r.set(),
		    	lx = 0, ly = 0,
		        is_label_visible = false,
		        leave_timer,
		        blanket = gvar.r.set();
		        
			var p, bgpp;
			for (var i = 0, ii = gvar.labels.length; i < ii; i++) {
		        if(gc.graphPortion == "top") var y = Math.round((gc.height - gc.bottomgutter - Y * data[i])); 
				else var y = Math.round((gc.height - gc.bottomgutter - Y * data[i])-graphBaselineY);
		        var x = Math.round(gc.leftgutter + X * (i + .5));	
		        if (!i) {
		            p = ["M", x, y, "C", x, y];
					if(gc.graphPortion == "top")bgpp = ["M", gc.leftgutter + X * .5, gc.height - gc.bottomgutter, "L", x, y, "C", x, y];
					else bgpp = ["M", gc.leftgutter + X * .5, 0, "L", x, y, "C", x, y];
		        }
		        if (i && i < ii - 1) {
		            var Y0 = Math.round(gc.height - gc.bottomgutter - Y * data[i - 1]),
		                X0 = Math.round(gc.leftgutter + X * (i - .5)),
		                Y2 = Math.round(gc.height - gc.bottomgutter - Y * data[i + 1]),
		                X2 = Math.round(gc.leftgutter + X * (i + 1.5));
		            var a = gvar.getAnchors(X0, Y0, x, y, X2, Y2);
		            p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
		            bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
		        }
				var dot2 = gvar.r.circle(x, y, 4).attr({fill: "#333", stroke: color, "stroke-width": 2});
				
				if(gc.graphPortion == "top"){
					if(gvar.labels[i] != ""){
						var line = gvar.r.path("M"+x+","+y+"L"+x+","+20).attr({"stroke-width": 1, stroke: "#FFFFFF"}).toFront();
					}
					t = gvar.r.text(x, 10, gvar.labels[i]).attr(txt).toFront()
				}
		        /*DATA ON HOVER*/
				blanket.push(gvar.r.rect(gc.leftgutter + X * i, 0, X, gc.height - gc.bottomgutter).attr({stroke: "none", fill: "#fff", opacity: 0}));
		        var rect = blanket[blanket.length - 1];
				(function (x, y, data, lbl, line, dot2) {
					rect.hover(function(){
						
						$('.'+canvas+'-data').html(data);
						$('#'+canvas).on('mousemove', function(e){
							$('.'+canvas+'-data').css({
						       left:  e.pageX-10,
						       top:   e.pageY-20
						    });
						});
						$('#'+canvas).mouseover(function(){
							$('.'+canvas+'-data').css('display' , 'block');
						});
						$('#'+canvas).mouseout(function(){
							$('.'+canvas+'-data').css('display' , 'none').html("");
						});
						dot2.attr("r", 6);
						
					}, function(){
						dot2.attr("r", 4);
						
					});
				})(x, y, data[i], gvar.labels[i], line, dot2);	
		    }
		    p = p.concat([x, y, x, y]);
		    
		    if(gc.graphPortion == "top") bgpp = bgpp.concat([x, y, x, y, "L", x, gc.height - gc.bottomgutter, "z"]);
			else bgpp = bgpp.concat([x, y, x, y, "L", x, 0, "z"]);
			
		    path.attr({path: p});
		    bgp.attr({path: bgpp});
		
		console.log( gvar );
	}
	gvar.redraw = function(){
		gvar.r.clear();
		gvar.init(data);
	}

	return gvar;
}