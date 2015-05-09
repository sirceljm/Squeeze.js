/*!
 * Squeeze.js v0.1
 * http://squeeze.s-media.si/
 *
 * Copyright 2015, Matej Šircelj
 * Released under the MIT license
 *
 * Date: 2015-05-09
 */
 
function Squeeze(font_sizes, box_height, box_width, words){
	this.font_sizes = font_sizes;
	this.highest_too_small_height = 0;
	this.lowest_too_big_height = undefined;
	this.current_font_index = undefined;
	this.font_indexes = Object.keys(font_sizes);

	this.last_response = undefined;
	this.box_height = box_height;
	this.box_width = box_width;
	this.words = words;

	this.steps = 0;

	this.computeWordsLengths = function(str, font_index){
		current_word = 0;
		word_lengths = {
			0: 0
		};

		if(!this.font_sizes[font_index]){
			return false;
		}

		for (var i = 0, len = str.length; i < len; i++) {
			if(str[i] == ' '){
				current_word++;
				word_lengths[current_word] = 0;
			}else{
				if(typeof this.font_sizes[font_index][str[i].charCodeAt(0)] == "undefined"){
					word_lengths[current_word] += this.font_sizes[font_index]["max"];
				}else{
					word_lengths[current_word] += this.font_sizes[font_index][str[i].charCodeAt(0)];
				}
				
			}
			
		}
		return word_lengths;
	}

	/*
	 * Returns {
	 *		info: ...
	 *		fit: -1 - too small
	 *			  0 - fits
	 *			  1 - too big
	 * 		}
	 */
	this.wordsFitInTheBox = function(){
		var font_height = parseInt(this.current_font_index.substring(0, this.current_font_index.length-3));
		var font_size = parseInt(this.current_font_index.substring(this.current_font_index.length-3, this.current_font_index.length));

		var word_lengths = this.computeWordsLengths(this.words, this.current_font_index)
		//console.log("-------------------------------------------");

		var max_lines = Math.floor(this.box_height / font_height);
		var max_line_height = Math.floor(this.box_height / max_lines);

		// find whitespace length
		//console.log("WS: "+this.font_sizes[this.current_font_index][160]);
		if(typeof this.font_sizes[this.current_font_index][160] == "undefined"){
			var whitespace_length = this.font_sizes[this.current_font_index]["max"];
		}else{
			var whitespace_length = this.font_sizes[this.current_font_index][160];
		}

		words_in_one_line_length = 0;
		occupied_lines = 0;

		total_words = 0;

		//console.log(word_lengths);
		var current_line = -1;
		var lines = [];
		var lines_lengths = [];

		for(var word in word_lengths){ // put words in lines
			if(word_lengths[word] > this.box_width){ // cut if single word cannot fit
				return {
					info: 'single word is wider than the whole line - change font height',
					fit: 1,
					font_index: this.current_font_index,
					steps: this.steps,
					ltbs: this.lowest_too_big_height,
					htss: this.highest_too_small_height
				}
			}

			if(words_in_one_line_length !== 0 && (words_in_one_line_length + word_lengths[word] + whitespace_length) <= this.box_width){ // add to current line
				lines[current_line].push(word_lengths[word]);
				lines_lengths[current_line] += word_lengths[word];

				words_in_one_line_length += word_lengths[word] + whitespace_length;
			}else{ // new line
				//console.log("NEW LINE!!!");
				current_line++;
				lines[current_line] = [];
				lines[current_line].push(word_lengths[word]);
				lines_lengths[current_line] = word_lengths[word];

				words_in_one_line_length = word_lengths[word];
				occupied_lines++;
			}

			total_words++;
		}

		/*
		console.log(lines);
		console.log(lines_lengths);
		console.log("Occupied lines: "+occupied_lines);
		console.log("Font height: "+font_height);
		console.log("Max lines: "+max_lines);
		console.log("Max line height: "+max_line_height);
		*/

		if(occupied_lines * font_height > max_lines * max_line_height){ // check if lines fit
			return {
				info: 'try lower font height',
				fit: 1,
				font_index: this.current_font_index,
				steps: this.steps,
				ltbs: this.lowest_too_big_height,
				htss: this.highest_too_small_height
			}
		}

		return {
			info: 'try higher font height',
			fit: -1,
			font_index: this.current_font_index,
			steps: this.steps,
			ltbs: this.lowest_too_big_height,
			htss: this.highest_too_small_height
		}
	}

	this.pad = function(num){ 
		return ('000' + num).substr(-3);
	}

	// direction: lower or higher
	this.getClosest = function(target) {
		var lo = -1, hi = this.font_indexes.length;
	    while (hi - lo > 1) {
	        var mid = Math.round((lo + hi)/2);

	        if (parseInt(this.font_indexes[mid]) <= parseInt(target)) {
	            lo = mid;
	        } else {
	            hi = mid;
	        }
	    }
	    if (this.font_indexes[lo] == target) hi = lo;
	    
	    //console.log([this.font_indexes[lo], this.font_indexes[hi]]);
	    return [this.font_indexes[lo], this.font_indexes[hi]];
	}

	/*
		min: 		minimum_height (required)
		max: 		maximum_height (required)
		min_width: 	minimum_width (optional) 
		max_width:  maximum_width (optional) 
		direction:  lower or higher
	*/
	this.getFontBetween = function(min, max, direction){ 
		var candidate_height = Math.round((parseInt(min) + parseInt(max)) / 2);

		if(!direction){
			direction = "lower";
		}

		var index = this.getClosest(candidate_height, direction);

		var closest_height = parseInt(index[1].substring(0, index[1].length-3));
		var closest_size = parseInt(index[1].substring(index[1].length-3, index[1].length));

		return (direction == "lower" ? index[0] : index[1]);
	}

	this.tryNextFontSize = function(){
		//console.log(this.font_indexes);
		//console.log(this.font_indexes.indexOf(this.lowest_too_big_height));
		//console.log(this.font_indexes.indexOf(this.highest_too_small_height));

		if((this.font_indexes.indexOf(this.lowest_too_big_height) != -1 && this.font_indexes.indexOf(this.highest_too_small_height) != -1) &&
			this.font_indexes.indexOf(this.lowest_too_big_height) - this.font_indexes.indexOf(this.highest_too_small_height) <= 1){
			return {
				fit: 0,
				font_index: this.highest_too_small_height,
				steps: this.steps,
				ltbs: this.lowest_too_big_height,
				htss: this.highest_too_small_height
			}
		}

		this.steps++;

		if(this.last_response){ // not first iteration
			if(this.last_response.fit < 0){ // too small
				if(this.highest_too_small_height < this.last_response.font_index){
					this.highest_too_small_height = this.last_response.font_index;
				}else if(this.highest_too_small_height = this.last_response.font_index){
					this.highest_too_small_height = ""+this.highest_too_small_height++;
				}
				
				this.current_font_index = this.getFontBetween(
					this.last_response.font_index, 
					this.lowest_too_big_height,
					"higher"
				);
			}else if(this.last_response.fit > 0){ // too big
				if(this.lowest_too_big_height > this.last_response.font_index){
					this.lowest_too_big_height = this.last_response.font_index;
				}else if(this.lowest_too_big_height = this.last_response.font_index){
					this.lowest_too_big_height = ""+this.lowest_too_big_height--;
				}

				this.current_font_index = this.getFontBetween(
					this.highest_too_small_height, 
					this.lowest_too_big_height,
					"lower"
				);
			}
		}else{ // first iteration
			var max_font_index = this.getClosest(this.box_height+this.pad(this.box_height));
			//console.log(max_font_index);

			this.lowest_too_big_height = (max_font_index[1] ? max_font_index[1] : max_font_index[0]);
			this.current_font_index = this.getFontBetween(0, this.lowest_too_big_height);
		}

		/*console.log(this.font_indexes.indexOf(this.highest_too_small_height));
		console.log(this.font_indexes.indexOf(this.lowest_too_big_height));
		console.log(this.highest_too_small_height, this.lowest_too_big_height);*/
		this.last_response = this.wordsFitInTheBox();

		return this.last_response;
	}


	this.getBestFontSize = function(){		
		var i = 0;
		do{
			i++;
			this.last_response = this.tryNextFontSize();
		}while(this.last_response.fit !== 0 && i < 40)


		this.last_response.font_size = this.last_response.font_index.substring(this.last_response.font_index.length-3, this.last_response.font_index.length);
		this.last_response.line_height = this.last_response.font_index.substring(0, this.last_response.font_index.length-3);

		return this.last_response;
	}
}