"use strict";

const PLUGIN_NAME = 'viur-ignite-icons';

var	gulp = require('gulp');
	gutil = require('gulp-util'),
	rename = require('gulp-rename'),
	gcallback = require('gulp-callback');

var	path = require('path'),
	isThere = require("is-there"),
	copy = require('recursive-copy'),
	fs = require('fs');

var options; // use options global


module.exports = {
	build: function(options) {

		// Set Default Options
		var defaultOptions = {
			iconDir: './sources/icons/',
			lessDir: './sources/less/'
		};

		if (typeof(options)==='undefined') options = {};
		for (var key in defaultOptions) {
			if (typeof(options[key])==='undefined') options[key] = defaultOptions[key];
		}


		copyPrototype(function() {
			writeClasses("");
		});
	},

	init: function(options) {

		// Set Default Options
		var defaultOptions = {
			iconDir: './sources/icons/',
			lessDir: './sources/less/'
			overwrite: false
		};

		if (typeof(options)==='undefined') options = {};
		for (var key in defaultOptions) {
			if (typeof(options[key])==='undefined') options[key] = defaultOptions[key]
		}


		if((isThere(options.lessDir+'/icon.less') || isThere(options.iconDir)) && (options.overwrite === false || options.overwrite === "false")) {
			throw new gutil.PluginError(PLUGIN_NAME, "'" + options.dest + "' already exists\n\tcall function with option overwrite: true");
		} else {
			copyPrototype();
			copyIcons();

			return true
		}
	}
};

function copyPrototype(callback) {
	return result = gulp.src(__dirname+'/prototype/icon.less')
		.pipe(gulp.dest(options.lessDir))
		.pipe(gcallback(function() {
			if(typeof callback === "function")
				callback();
		}));
}	
function copyIcons() {
	return copy(__dirname+'/icons/', options.iconDir, {overwrite: true}, function(error, results) {
		if (error) return console.error('Copy failed: ' + error);

		console.info('Copied ' + results.length + ' icons');
	});
}

function writeClasses(folder) {
	// get list of files in icon dir
	var files = fs.readdirSync(options.iconDir+folder);
	
	// for each item in folder
	for (var item in files) {
		var name = files[item];

		if (fs.statSync(options.iconDir+"/"+folder+"/"+name).isDirectory()) { // if dir
			writeClasses(folder+"/"+name);
		} else { // if file
			console.log("Processing %s", folder+"/"+name);

			var	tmpClass = ".i-"+name.replace('.svg','').replace('.jpg','').replace('.png','').replace('.gif','').replace(' ', '-');
			var	tmpLess  =	tmpClass+":before {" +"\n";
				tmpLess +=		"\tbackground-image:url('../icons"+folder+"/"+name+"');" +"\n";
				tmpLess +=	"}"+"\n";
			fs.appendFile(options.lessDir+"/icon.less", tmpLess, function (err) {
				if(err) return console.error(err);
			});
		}
	}
}