function CircleChart(canvas, options ) {
	this.percent = 0;
	if ( options ) {
		this.options = options;
	}
	else{
		this.options = { 
			"canvasSize" : 200,
			"radius" : 50,
			"stroke" : 10
		}
	}
	var r = Raphael(canvas, this.options.canvasSize, this.options.canvasSize),
    	R = this.options.radius,
		center = this.options.radius + this.options.stroke,
	    init = true,
	    param = {stroke: "#fff", "stroke-width": 10},
	    marksAttr = { stroke: "#555", "stroke-width": 10};
		r.circleChart = this;
		this.flatpath;
		
		$('#'+canvas).append('<span class="percentLine"></span>');
	
	r.customAttributes.arc = function (value, total, R, cxy ) {
		var newPercent = Math.floor(value);
		$('#'+canvas+" .percentLine").text( newPercent+"%");	
	        if(value == total){
				if ( this.circleChart ) {
					this.circleChart.flatpath.attr({stroke: "#fff"})
				}
			}
			else{
				/*if ( this.circleChart ) {
					if ( this.circleChart.options && this.circleChart.options.onUpdate ) this.circleChart.options.onUpdate( newPercent );
				}*/
				if ( this.circleChart ) {
					this.circleChart.flatpath.attr({stroke: "#333"})
				}
				var alpha = 360 / total * value,
			        a = (90 - alpha) * Math.PI / 180,
					x = cxy + R * Math.cos(a),
			        y = cxy - R * Math.sin(a)
					var color = "#fff",
			        path;
			    	path = [["M", cxy, cxy - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
				    return {path: path, stroke: color};
			}
	};
	
	this.callUpdate = function(percentUpdate){
		this.flatpath = r.circle(center,center, this.options.radius).attr(marksAttr);
		this.flatpath.circleChart = this;
		this.path = r.path().attr(param).attr({arc: [this.percent, 100, R, center ]});
		this.path.circleChart = this;
        this._updateVal(percentUpdate, this.options.radius, this.path, center);
	}
	this._updateVal = function(value, R, hand, cxy){
		var total = 100;
        if (this.percent == 0) {
            hand.animate({arc: [value, total, R, cxy ]}, 900, ">");
        } else {
            hand.animate({arc: [value, total, R, cxy ]}, 750);
        }
		this.percent = value;
	}
	return this;
}