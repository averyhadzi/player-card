var gulp = require('gulp'),
  $ = require('gulp-load-plugins')({
    rename: {
      'gulp-css-url-adjuster': 'cssurls'
    }
  });

gulp.task('styles', function () {
  return gulp.src([
      'app/styles/less/main.less'
    ])
    .pipe($.less())
    .pipe(gulp.dest('app/styles/css'));
});

gulp.task('images', ['clean'], function () {
  return gulp.src('app/images/**/*')
  .pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true
  })))
  .pipe(gulp.dest('dist/images'));
});

gulp.task('lint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('copy', ['clean'], function () {
  return gulp.src([
      'app/fonts/**/*',
      'app/styles/css/*',
      'app/bower_components/jquery/dist/**/*',
      'app/*.{png,ico,xml}',
      'app/php/**/*',
      'app/js/**/*',
      'app/vendor/**/*'
    ])
    .pipe($.copy('dist', {
      prefix : 1
    }));
});

gulp.task('preprocess', function (done) {
  gulp.src('app/layouts/**/*.html')
    .pipe($.preprocess())
    .pipe($.livereload())
    .pipe(gulp.dest('app'));

  done();
});

gulp.task('html', ['styles', 'vendorpaths'], function () {
  var assets = $.useref.assets({ searchPath: 'app' });

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('connect', ['styles'], function () {
  var serveStatic = require('serve-static'),
    serveIndex = require('serve-index');

  var app = require('connect')()
    .use(require('connect-livereload')({ port: 35729}))
    .use(serveStatic('app'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(1337)
    .on('listening', function () {
      console.log('Started connect server on http://localhost:1337');
    });
});

gulp.task('serve', ['preprocess', 'connect', 'watch'], function () {
  require('opn')('http://localhost:1337');
});

gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src([
    'app/includes/page-head.html',
    'app/includes/page-foot.html'
  ])
  .pipe(wiredep({
    ignorePath: '../',
    exclude: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/bootstrap/dist/js/bootstrap.js'
    ],
  }))
  .pipe(gulp.dest('app/includes'));
});

gulp.task('distpaths', ['styles', 'copy', 'html'], function () {
  return gulp.src([
      'dist/css/main.css',
      'dist/css/ie.css'
    ])
    .pipe($.cssurls({
      replace:  ['../../', '../'],
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('vendorpaths', function () {
  return gulp.src('app/includes/page-head.html')
    .pipe($.replace('bootstrap.css', 'bootstrap.min.css'))
    .pipe(gulp.dest('app/includes'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  gulp.watch([
    'app/styles/css/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*.{jpg, gif, png, svg}'
    ]).on('change', $.livereload.changed);

  gulp.watch('app/scripts/**/*.js', ['lint']);
  gulp.watch('app/styles/**/*.less', ['styles']);
  gulp.watch([
    'app/layouts/**/*.html',
    'app/includes/**/*.html'
  ], ['preprocess']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['preprocess', 'styles', 'html', 'images', 'copy', 'distpaths'], function () {
  return gulp.src('dist/**/*')
    .pipe($.size({
      title: 'build',
      gzip: true
    }));
});

gulp.task('default', function () {
  gulp.start('watch');
});

gulp.task('clean', function (done) {
  require('del')(['dist'], done);
});

gulp.task('clear', function (done) {
  return $.cache.clearAll(done);
});
