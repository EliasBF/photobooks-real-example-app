const path = require('path')

const gulp = require('gulp')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const cleanCss = require('gulp-clean-css')
const shell = require('gulp-shell')
const babel = require('babelify')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const del = require('del')

gulp.task('styles', ['assets'], function () {
  return gulp
    .src(path.join(__dirname, 'assets', 'scss', 'index.scss'))
    .pipe(sass())
    .pipe(cleanCss())
    .pipe(rename('app.css'))
    .pipe(gulp.dest(path.join(__dirname, 'public')))
})

gulp.task('clean:assets', function () {
  return del([
    path.join(__dirname, 'public'),
    path.join(__dirname, 'upload')
  ])
})

gulp.task('assets', ['clean:assets'], function () {
  return gulp
    .src([
      path.join(__dirname, 'assets', '**', '*.{woff,woff2,png,xml,json,jpg,jpeg,svg}')
    ])
    .pipe(gulp.dest(path.join(__dirname, 'public')))
})

gulp.task('upload', ['clean:assets'], shell.task(['mkdir upload']))

gulp.task('build', ['assets', 'styles'], function () {
  browserify(path.join(__dirname, 'src', 'index.js'), { debug: true })
    .transform(babel)
    .bundle()
    .on('error', function (err) { console.log(err); this.emit('end') })
    .pipe(source('index.js'))
    .pipe(rename('app.js'))
    .pipe(gulp.dest(path.join(__dirname, 'public')))
})

gulp.task('default', ['build', 'upload'])
