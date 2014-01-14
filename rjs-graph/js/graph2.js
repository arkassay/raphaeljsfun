Raphael.el.addClass = function(className) {
    this.node.setAttribute("class", className);
    return this;
};

function RJSGraph( canvas, id, options ) {
	var gvar = {};
	gvar.options = options;
	gvar.options = {
		 "height" : 100,
		 "leftgutter" : 20,
	     "bottomgutter" : 20,
	     "topgutter" : 40,
		 "graphPortion" : (gvar.options.graphPortion) ? gvar.options.graphPortion : "top",
		 "timing" : 700,
		  "dot2"  : {}
	}			
	gvar.init = function(data){
		var max = Math.max.apply(Math, data),
			line,
			shadingPath,
			values = [];
		gvar.canvasHeight = 100;
		gvar.Y = gvar.canvasHeight/max;
		gvar.containerWidth = $(".graph-wrapper").width();
		gvar.labels = [2000,"","","","",2005,"","","","",2010,"","","","",2015,"","",2018];
		gvar.baseLine = data[0];  //get the data for 2000
		// Draw
		//initialize the graph
		gvar.graphBaselineY = Math.round(gvar.canvasHeight - gvar.Y * gvar.baseLine)+gvar.options.topgutter;
		if(gvar.options.graphPortion == "top"){
			gvar.r = Raphael(canvas, gvar.containerWidth, gvar.graphBaselineY);
			shadingPath = "L"+gvar.containerWidth+",100 10,100z";
		}
		else{
			gvar.r = Raphael(canvas, gvar.containerWidth, gvar.canvasHeight - gvar.graphBaselineY+gvar.options.topgutter);
			shadingPath = "L"+gvar.containerWidth+",0 10,0z";
		}
		gvar.c = gvar.r.path("M0,0").attr({fill: "none", "stroke-width": 2, "stroke-linecap": "round"}),
        bg = gvar.r.path("M0,0").attr({stroke: "none", opacity: .3})
        values[0] = gvar.setPath(19, data, gvar.graphBaselineY);
        if(gvar.options.graphPortion == "top") clr = "#FFF";
		else clr = "#FF0000";
		
		gvar.c.attr({path: values[0], stroke: clr});
        
    	bg.attr({path: values[0], fill: clr});
		//animate the graph
		
		values[0] = gvar.changePath(19, data, gvar.graphBaselineY);
		var anim = Raphael.animation({path: values[0], stroke: clr}, gvar.options.timing, "<>");
        gvar.c.animate(anim);	
        bg.animateWith(gvar.c, anim, {path: values[0] + shadingPath, fill: clr}, gvar.options.timing, "<>");
		gvar.drawBaseLine();
	}
	
	gvar.labelPoint = function(index, x, y, value){
		gvar.options.dot2[index] = gvar.r.circle(x, y, 4).attr({fill: "#333", stroke: "#FFF", "stroke-width": 2}).data("pointInfo", value);
		if(gvar.options.graphPortion == "top" && gvar.labels[index] !== ""){
			line = gvar.r.path("M"+x+","+(gvar.graphBaselineY-10)).attr({"stroke-width": 1, stroke: "#FFFFFF"});
			var anim = Raphael.animation({path: "M"+x+","+(gvar.graphBaselineY-10)+"L"+x+",20"}, gvar.options.timing, "<>");
			if(index == 0) t = gvar.r.text(x, 10, 2000+index).attr({font: '12px Helvetica, Arial', fill: "#fff", 'text-anchor' : 'start'}).toFront();
			else if(index == gvar.labels.length-1) gvar.r.text(x, 10, 2000+index).attr({font: '12px Helvetica, Arial', fill: "#fff", 'text-anchor' : 'end'}).toFront();
			else t = gvar.r.text(x, 10, 2000+index).attr({font: '12px Helvetica, Arial', fill: "#fff"}).toFront();
			
			line.animate(anim);
		}
		
		gvar.options.dot2[index].hover(function(){
			gvar.options.dot2[index].attr("r", 6);
			$('.'+canvas+'-data').html(this.data('pointInfo'));
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
		}, function(){
			gvar.options.dot2[index].attr("r", 4);
		});
	}
	gvar.setPath = function(length,data2){
		var path = "",
            spacing = gvar.containerWidth/length,
			x = 10
			if(gvar.options.graphPortion == "bottom") y = 0;
			else y = gvar.graphBaselineY; 
			
        for (var i = 0; i < length; i++) {
            if (i) {
                x += spacing;
                path += "," + [x, y];
            } else path += "M" + [10, y] + "R";
            
			gvar.labelPoint(i, x, y, data2[i]);
        }
        return path;
	}
	gvar.changePath = function(length,data){
		var path = "",
			spacing = gvar.containerWidth/length,
            x = 10, y = data;
        for (var i = 0; i < length; i++) {
			if(gvar.options.graphPortion == "bottom"){
				ypos = (gvar.canvasHeight - gvar.Y * y[i])-gvar.graphBaselineY+gvar.options.topgutter;
			}
			else{
				ypos = gvar.canvasHeight - gvar.Y * y[i]+gvar.options.topgutter;
			}
            
			if (i) {
                x += spacing;
                path += "," + [x, ypos];
            } else {
                path += "M" + [10, ypos] + "R";
            }
		if(gvar.options.graphPortion == "top") gvar.options.dot2[i].animate({transform: "t0, "+(ypos-gvar.graphBaselineY)+"r90"}, gvar.options.timing, "<>");
		else gvar.options.dot2[i].animate({transform: "t0, "+ypos+"r90"}, gvar.options.timing, "<>");
        }
        return path;
	}
	
	gvar.drawBaseLine = function(baseline){
		if(gvar.options.graphPortion == "top"){
			gvar.graphBaseline = gvar.r.path("M0,"+gvar.graphBaselineY+"L"+(gvar.containerWidth)+","+gvar.graphBaselineY).attr({"stroke-width": 1, stroke: "#FFFFFF"});
		}
	}
	
	gvar.redraw = function(){
		gvar.r.clear();
		gvar.init(data);
	}

	return gvar;
}