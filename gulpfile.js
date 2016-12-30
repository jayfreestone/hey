var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoPrefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');

gulp.task('sass',function(){
  gulp.src(['src/sass/**/*.scss'])
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoPrefixer())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
});
gulp.task('js',function(){
  gulp.src(['src/js/**/*.js'])
    .pipe(plumber({
      handleError: function (err) {
        console.log(err);
        this.emit('end');
      }
    }))
    // .pipe(sourcemaps.init())
    // .pipe(gulp.dest('dist/js'))
    .pipe(babel({
      presets: [['es2015', { modules: 'umd' }]]
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
});
gulp.task('default',function(){
  gulp.watch('src/js/**/*.js',['js']);
  gulp.watch('src/sass/**/*.scss',['sass']);
});
