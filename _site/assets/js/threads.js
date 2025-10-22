function vertwiggle(iterations, color, draw, durations, bead){
	this.draw = draw
	this.color = color
	this.bead = random_beads(10)	
	this.width = draw.width()
	this.height = draw.height()

	this.margin = this.width / 2

	

	this.iterations = iterations


	this.d = this.height/this.iterations // distance between inflection points
	this.max_r = 2*this.d/3 //maximum radius of control points	

	this.r = this.max_r * Math.random()
	
	this.M_x = this.margin + (Math.random()-.5) * (this.max_r/3) //first point x
	this.M_y = 0 // first point y

	this.L_x = this.margin + (Math.random()-.5) * (this.max_r/3) //last point x
	this.L_y = this.height //last point y

	this.theta = (Math.random() - 0.5) * (Math.PI/2) //angle of the first and last control points

	this.C1_x = function(){ return this.M_x + this.r*Math.cos(this.theta)} // first control point x
	this.C1_y = function(){ return this.M_y + this.r*Math.sin(this.theta)} // first control point y

	this.Cn_x = function(){ return this.L_x + this.r*Math.cos(this.theta)} // last control point x
	this.Cn_y = function(){ return this.L_y + this.r*Math.sin(this.theta)} // last control point y


	//Each inflection point also manages the control points directly before and after it in the path
	// to make it easier to ensure that they're colinear using some trig. 
	function inflection_point(X, index, d, r){
		this.theta = ( Math.random() * Math.PI ) + (Math.PI / 2) //control point angle
		this.max_r = r
		
		this.I_x = X + ((Math.random()-0.5) * r/4) //inflection point x- close to the original x val
		this.I_y = d*index //inflection point y- determined by this points index along the path

		this.r1 =  this.max_r * Math.random() //first control radius- the distance between the inflection point and cp1
		this.c1_x = function(){ return this.I_x - this.r1*Math.cos(this.theta) } //just trig
		this.c1_y = function(){ return this.I_y - this.r1*Math.sin(this.theta) }

		this.r2 = this.max_r * Math.random() // same as above
		this.c2_x = function(){ return this.I_x + this.r1*Math.cos(this.theta) } //again, just trig
		this.c2_y = function(){ return this.I_y + this.r1*Math.sin(this.theta) }

		this.tweak = function(){
			//Adjust the values of some parameters to get new points for the animation.
			this.r1 =  this.max_r * Math.random()
			this.theta = ( Math.random() * Math.PI ) - Math.PI
			this.I_y = this.I_y + (Math.random() - .5)*this.max_r
		}
		
		this.string = function(){
			//"render" out this point as a part of an svg path string
			//   ... C x y x y x y C x y x y x y C x y x y ...
			//             \-----------/
			return `  ${this.c1_x()} ${this.c1_y()} ${this.I_x} ${this.I_y} C ${this.c2_x()} ${this.c2_y()}`
		}
 	} 


 	//create all the points
 	this.points = []
 	for(i = 1; i<this.iterations; i++){
 		this.points.push(new inflection_point(this.M_x, i, this.d, this.max_r))
 	}
 	
 	this.tweak = function(){
 		//tweak them all- get the next keyframe for the wiggle
 		this.theta = (Math.random() * Math.PI) - Math.PI
 		this.points.map(function(p){
 			p.tweak()
 		})
 	}

 	//render out the whole path string by assembling all the parts.
 	// M x y C x y [x y x y C x y](*n) x y x y 
 	this.string = function(){
 		return `M ${this.M_x} ${this.M_y} C ${this.C1_x()} ${this.C1_y()} ${this.points.map(function(p){return p.string()}).join()} ${this.Cn_x()} ${this.Cn_y()} ${this.L_x} ${this.L_y}`
 	}

 	this.next = function(){
 		this.tweak()
 		return this.string()
 	}

 	//Render the thing!
 	var appear_duration = 10000

 	this.path = this.draw.path(this.string())
 	this.path.fill('none')
	this.path.stroke({ color: "transparent", width: 2, linecap: 'round', linejoin: 'round' })
	
	$(`#${this.path.id()}`).animate({stroke:this.color,opacity:.8}, appear_duration) //use jquery to animate the fade in and fade out
	this.tl = this.path.timeline().persist(true)
	
	//Right now I'm just choosing three random keyframes per wig and osccilating between them all
	this.path.animate(random_choice(durations)).ease("<>").plot(this.next())
			.animate(random_choice(durations)).ease("<>").plot(this.next())
			.animate(random_choice(durations)).ease("<>").plot(this.next())
	this.tl.on("finished", function(){this.reverse().play()})

	//if there's a bead string, render the text path
	if(this.bead != undefined){
		this.textpath = this.path.text(`${random_whitespace(200)} ${this.bead}`)
		this.textpath.leading(".35em").font({"size":20}).fill(this.color).attr({"fill-opacity":0})
		this.textpath.animate(appear_duration).attr({"fill-opacity":.8})
	}

	this.fadeout = function(){
		var clear_duration = 5000
		$(`#${this.path.id()}`).animate({stroke:"rgba(0,0,0,0)"}, clear_duration)
		this.textpath.animate(clear_duration).attr({"fill-opacity":0})
		
	}

}


/// some procedural utilities 

function random_choice(items){
	return items[Math.floor(Math.random()*items.length)] 
}

function random_whitespace(ceiling){
	return " ".repeat(10+Math.floor(Math.random()*ceiling))
}

function random_beads(length_ceiling){
	var beads = ["❂","✾","✻","❇","✶","✵","◎","◉","◈","⬤","❁","✹","✣","✤","✥","✦","❅","❄","⬥","⬦","☉","✶✶","✶✶✶✶","✶❇✶","","","","","","","","","","",""]
	var length_ = Math.floor(Math.random()*length_ceiling)
	return Array.apply(null, {length:length_}).map(function(i){
		choice = random_choice(beads)+" "
		if(choice == ""){
			choice = random_whitespace(10)
		}
		return choice
	}).join("")
}

//// top level manager. 
// final version will need to be able to index the wigglers by an id, and directly edit their attributes. 
function wiggle_manager(colors, durations, iterations){
	this.draw = SVG().addTo('.right-column').size(200, window.innerHeight)
	this.wiggles = []

	//roughly speaking, these define the character of the wigglers.
	this.colors = colors
	this.durations = durations
	this.iterations = iterations

	this.add_wiggle = function(){
		this.wiggles.push(new vertwiggle(random_choice(this.iterations), random_choice(this.colors), this.draw, this.durations))
	}

	this.remove_wiggle = function(){
		wig = this.wiggles.shift()
		wig.fadeout()
		setTimeout(this.cleanup,6000,wig)
	}

	//make sure they don't leave behind too much junk. 
	//the garbage collector will get what this fails to- but the gc won't tidy up the DOM so it's gotta happen manually. 
	this.cleanup = function(wig){
		wig.tl.persist(false)
		wig.tl.stop()
		$(`#${wig.path.id()}`).remove()
		$(`#${wig.textpath.id()}`).parent().remove()
		delete wig 
	}
}


SVG.on(document, 'DOMContentLoaded', function() {
	jQuery.Color.hook( "stroke" ) //So we can animate the svg stroke color via jquery

	//"character" settings
	var colors = ['#00ccffaa','#ff0066aa','#000066aa',"#aa0aa8aa", "#60700faa"]
	var durations = [8000,10000,12000,15000,18000,20000,25000,30000,35000,40000,50000]
	var iterations = [3,4,5,6,7]
	
	//setup the manager
	manager = new wiggle_manager(colors, durations, iterations)
	
	// Add initial wiggles with staggered timing
	setTimeout(function() { manager.add_wiggle() }, 0)
	setTimeout(function() { manager.add_wiggle() }, 5000)
	setTimeout(function() { manager.add_wiggle() }, 10000)
	setTimeout(function() { manager.add_wiggle() }, 15000)
	setInterval(function(){
			manager.remove_wiggle()
			manager.add_wiggle()
	
	},20000)	


	//ui 
	$("#add").click(function(){
		console.log("add")
		manager.add_wiggle()
	})

	$("#remove").click(function(){
		manager.remove_wiggle()
	})

	setInterval(function(){
		$("#num_wigs").text(manager.wiggles.length)
	},100)

	// Handle window resize
	window.addEventListener('resize', function() {
		// Clear existing wiggles
		manager.wiggles.forEach(function(wig) {
			wig.fadeout()
			setTimeout(function() {
				wig.tl.persist(false)
				wig.tl.stop()
				$(`#${wig.path.id()}`).remove()
				if (wig.textpath) {
					$(`#${wig.textpath.id()}`).parent().remove()
				}
			}, 1000)
		})
		
		// Clear the SVG canvas
		manager.draw.clear()
		
		// Recreate SVG canvas with new dimensions
		manager.draw.size(200, window.innerHeight)
		
		// Clear wiggles array
		manager.wiggles = []
		
		// Reinitialize wiggles
		manager.add_wiggle()
		manager.add_wiggle()
		manager.add_wiggle()
		manager.add_wiggle()
	})

})

