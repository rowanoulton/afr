/**
 * Dependencies
 */
var gulp       = require('gulp'),
    compass    = require('gulp-compass'),
    jshint     = require('gulp-jshint'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream');

/**
 * Setup
 */
var paths = {
    compass: './app/scss/*.scss',
    compassWatch: './app/scss/**/*.scss',
    scripts: './app/scripts/**/*.js',
    browserify: './app/scripts/main.js'
};

gulp.task('lint', function () {
    return gulp.src(paths.scripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('compass', function () {
    return gulp.src(paths.compass)
        .pipe(compass({
            config_file: './config/compass.rb',
            css: 'assets/css',
            sass: 'app/scss'
        }))
        .pipe(gulp.dest('./public/assets/css'));
});

gulp.task('browserify', function() {
    return browserify(paths.browserify)
        .bundle()
        .pipe(source('afr.js'))
        .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['lint', 'browserify']);
    gulp.watch(paths.compassWatch, ['compass']);
});

gulp.task('build', ['lint', 'browserify', 'compass']);
gulp.task('default', ['build', 'watch']);
