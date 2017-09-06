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
    '!src/styles-built.css',
    '!src/bower_components/**/*',
  ], ['css']);

  gulp.watch([
    'src/styles-built.css',
    'src/**/*.html',
    'src/**/*.js',
    '!src/bower_components/**/*',
  ]).on('change', browserSync.reload);
});

gulp.task('distribute', ['css', 'useref'], function () {
  return gulp.src([
      'src/templates/**/*',
      'src/resources/**/*',
      // 'src/bower_components/material-design-icons/**/*',
      // 'src/bower_components/open-sans-fontface/**/*',
    ], { base: 'src' })
    .pipe(gulp.dest('dist'));
});

// not-working-yet
gulp.task('useref', ['css'], function () {
  return gulp.src('src/index.html')
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('serve:dist', function () {
  browserSync.init({
    server: './dist'
  });
});
