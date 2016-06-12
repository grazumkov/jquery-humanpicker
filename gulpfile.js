"use strict";

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    rimraf = require('gulp-rimraf'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    cleanCSS = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    runSequence = require('run-sequence'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    packageJSON  = require('./package');

var path = {
        js: 'src/**/*.js',
        css: 'css/**/*.css',
        dist: 'dist/'
    };

gulp.task('css', function(){
   return gulp.src(path.css)
        .pipe(autoprefixer())
        .pipe(gulp.dest(path.dist))
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(path.dist));
});

gulp.task('jslint', function(){
   return gulp.src(path.js)
            .pipe(jshint(packageJSON.jshintConfig))
            .pipe(jshint.reporter('jshint-stylish'))
            //.pipe(jshint.reporter('fail'))
});

var jsMainPath = "src/jquery.humanpicker.js",
    jsDestName = "jquery.humanpicker.js";
var brOpts = {
  entries: [jsMainPath],
  debug: true
};
var b = browserify(brOpts);

gulp.task('js', ['jslint'], function(){
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(jsDestName))
    .pipe(gulp.dest(path.dist))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
        }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.dist));
});

gulp.task('watch', function(){
  gulp.watch(path.css, ['css']);
  gulp.watch(path.js, ['js']);
});

gulp.task('clean', function(){
   return gulp.src(path.dist+'**/*.*', { read: false })
            .pipe(rimraf());
});

gulp.task('build', function(cb) {
    runSequence('clean', ['css', 'js'], function(){
        gutil.log(gutil.colors.green('Successfull build'));
        cb();
    });
});

gulp.task('default', ["build"]);