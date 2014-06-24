/**
 * Dependencies
 */
var gulp       = require('gulp'),
    streamify  = require('gulp-streamify'),
    karma      = require('gulp-karma'),
    compass    = require('gulp-compass'),
    imagemin   = require('gulp-imagemin'),
    jshint     = require('gulp-jshint'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify     = require('gulp-uglify'),
    browserify = require('browserify'),
    source     = require('vinyl-source-stream');

/**
 * Setup
 */
var paths = {
    images: './app/img/*',
    compass: './app/scss/*.scss',
    compassWatch: './app/scss/**/*.scss',
    scripts: './app/scripts/**/*.js',
    browserify: './app/scripts/main.js',
    tests: [
        './public/assets/js/**/*.js',
        './app/scripts/vendor/*.js',
        './app/test/**/*.js'
    ]
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

gulp.task('images', function () {
    return gulp.src(paths.images)
        .pipe(imagemin())
        .pipe(gulp.dest('./public/assets/img'));
});

gulp.task('browserify', function() {
    return browserify(paths.browserify)
        .bundle()
        .pipe(source('afr.js'))
        .pipe(streamify(ngAnnotate()))
        .pipe(streamify(uglify()))
        .pipe(gulp.dest('./public/assets/js'));
});

gulp.task('test', function () {
    return gulp.src(paths.tests)
        .pipe(karma({
            configFile: './config/karma.conf.js',
            action: 'run'
        }))
        .on('error', function (err) {
            throw err;
        });
});

gulp.task('watch', ['build'], function () {
    gulp.watch(paths.scripts, ['lint', 'browserify']);
    gulp.watch(paths.compassWatch, ['compass']);
    gulp.watch(paths.images, ['images']);

    // Due to the way Karma works, using gulp.watch to watch files results in contrived usage that doesn't work as
    // expected in some cases. As a result, Karma's watch mechanism is employed to make usage of this plugin as straight
    // forward as possible.
    gulp.src(paths.tests)
        .pipe(karma({
            configFile: './config/karma.conf.js',
            action: 'watch'
        }));
});

gulp.task('build', ['lint', 'browserify', 'compass', 'images']);
gulp.task('default', ['watch']);
