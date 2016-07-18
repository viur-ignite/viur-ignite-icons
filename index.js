var gulp = require('gulp');
var rename = require('gulp-rename');

var path = require('path');
var IsThere = require("is-there");
var prompt = require('prompt');
var copy = require('recursive-copy');
var fs = require('fs');


iconDir = "./appengine/icons"
lessDir = "./sources/less"

module.exports = {
	build: function() {
		return writeClasses("")
	},

	init: function() {
		// console.log("IsThere: %s", IsThere(lessDir+"/icon.less"));
		// console.log("IsThere: %s", IsThere(iconDir));
		if(IsThere(lessDir+"/icon.less") || IsThere(iconDir)) { 
			setTimeout(function() {

				prompt.start();

				var property = {
					name: 'yesno',
					message: 'Are you sure to overwrite icon.less in sources/less and icons in appengine/icons?',
					validator: /y[es]*|n[o]?/,
					warning: 'Must respond yes or no',
					default: 'no'
				};

				prompt.get(property, function (err, result) {
					console.log('Your Input: ' + result.yesno);

					if(result.yesno == "yes" || result.yesno == "y") {
						prompt.stop();
						copyPrototype();
						copyIcons();
					} else {
						prompt.stop();
					}
				});

			}, 5);
		} else {
			copyPrototype();
			copyIcons();
		}
	}
};

function dirname(path) {
	return path.replace(/\\/g, '/')
		.replace(/\/[^\/]*\/?$/, '');
}

function copyPrototype() {
	return gulp.src(__dirname+'/prototype/icon.less')
		.pipe(gulp.dest(lessDir));
}	
function copyIcons() {
	return copy(__dirname+'/icons/', iconDir, {overwrite: true}, function(error, results) {
		if (error) {
			console.error('Copy failed: ' + error);
		} else {
			console.info('Copied ' + results.length + ' files');
		}
	});
}

function writeClasses(folder) {
	var files = fs.readdirSync(iconDir+folder);
	for (var item in files) { // for each item in folder
		var name = files[item];

		if (fs.statSync(iconDir+"/"+folder+"/"+name).isDirectory()) { // if dir
			writeClasses(folder+"/"+name);
		} else { // if file
			console.log("Processing %s", folder+"/"+name);

			var	tmpClass = ".i-"+name.replace('.svg','').replace(' ', '-');
			var	tmpLess  =	tmpClass+":before {" +"\n";
				tmpLess +=		"\tbackground-image:url('../icons"+folder+"/"+name+"');" +"\n";
				tmpLess +=	"}"+"\n";

			fs.appendFile(lessDir+"/icon.less", tmpLess, function (err) {
				if(err) {
					return console.log(err);
				}
			});
		}
	}
}