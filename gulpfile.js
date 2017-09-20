const gulp = require('gulp');
const myth = require('gulp-myth');
const useref = require('gulp-useref');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const ngAnnotate = require('gulp-ng-annotate');

const gulpIf = require('gulp-if');

const browserSync = require('browser-sync').create();

function isJs(file) {
  return /\.js$/.test(file.path);
}

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

gulp.task('distribute', ['css', 'prepare-index'], function () {
  return gulp.src([
      'src/favicon.png',
      'src/templates/**/*',
      'src/resources/**/*',
      // 'src/bower_components/material-design-icons/**/*',
      // 'src/bower_components/open-sans-fontface/**/*',
    ], { base: 'src' })
    .pipe(gulp.dest('dist'));
});

// not-working-yet
gulp.task('prepare-index', ['css'], function () {
  return gulp.src('src/index.html')
    .pipe(replace('http://localhost:4000', 'https://glacial-journey-19231.herokuapp.com'))
    .pipe(replace('dev-local', 'production'))
    .pipe(useref())
    .pipe(gulpIf('scripts-app.js', ngAnnotate()))
    .pipe(gulpIf('scripts-app.js', babel({
      presets: ['env']
    })))
    .pipe(gulpIf(isJs, uglify()))
    .pipe(gulp.dest('dist'));
});

gulp.task('serve:dist', function () {
  browserSync.init({
    server: './dist'
  });
});
