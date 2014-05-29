/**
 * Dependencies
 */
var gulp       = require('gulp'),
    jshint     = require('jshint'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream');

gulp.task('lint', function () {
    gulp.src('./app/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('browserify', function() {
    return browserify('./app/scripts/main.js')
        .bundle()
        .pipe(source('afr.js'))
        .pipe(gulp.dest('./public/assets/js'));
});
