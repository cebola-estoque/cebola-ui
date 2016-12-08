const gulp = require('gulp');
const myth = require('gulp-myth');
const useref = require('gulp-useref');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');

const browserSync = require('browser-sync').create();

gulp.task('css', function () {
  return gulp.src('src/styles.css')
    .pipe(myth())
    .pipe(rename({
      suffix: '-built'
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('src'))
    .pipe(browserSync.stream());
});

// Static Server + watching css/html files
gulp.task('develop', function() {

  browserSync.init({
    server: './src'
  });

  gulp.watch([
    'src/**/*.css',
    '!src/bower_components'
  ], function () {
    gulp.src('src/**/*.css').pipe(browserSync.stream());
  });
  gulp.watch([
    'src/**/*.html',
    'src/**/*.js',
    '!src/bower_components',
  ]).on('change', browserSync.reload);
});

gulp.task('distribute', ['css'], function () {
  return gulp.src('src/**/*')
    .pipe(gulp.dest('dist'));
});

// not-working-yet
gulp.task('useref', ['css'], function () {
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

