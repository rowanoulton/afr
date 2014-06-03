/**
 * Dependencies
 */
var gulp       = require('gulp'),
    jshint     = require('gulp-jshint'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream');

/**
 * Setup
 */
var paths = {
    scripts: './app/scripts/**/*.js',
    browserify: './app/scripts/main.js'
};

gulp.task('lint', function () {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('browserify', function() {
    return browserify(paths.browserify)
        .bundle()
        .pipe(source('afr.js'))
        .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['lint', 'browserify']);
});

gulp.task('default', ['watch']);
