// Dean Attali / Beautiful Jekyll 2016

(() => {
const p = document.querySelector('#qapla');
p.style.position = 'fixed';
p.style.top = '50px';
p.style.left = '20px';
p.style.width = '100px';
p.style.height = '100px';

const cols = ['ffab03', 'fc7f03', 'fc3903', 'd1024e', 'a6026c'];
const x2col = per => cols[Math.floor(per / 20)];
const random = {};
random.int = (min, max) => Math.floor(Math.random() * (max - min) + min + 1);
random.size = () => random.int(10, 20);
random.count = () => random.int(3, 6);
const offset = x => (Math.floor(x / 2) + 25);
random.ys = (off, size, count) => {
  const bucket = [];
  for (let i = 0; i < count; i++)
    bucket.push(random.int(off, off + size));
  return bucket;
};
random.pic = () => {
  const points = [];
  for (let i = 0, l = 33; i < l; i++) {
    const x = i * 3 + 1.5;
    const size = random.size();
    const count = random.count();
    const off = offset(x);
    const color = x2col(x);
    const ys = random.ys(off, size, count);
    ys.forEach(y => points.push([x, y]));
  }
  return points;
};
const cssify = o => Object.entries(o).map(kv => `${kv[0]}:${kv[1]}`).join(';');
const fisk = (w, h) => (x, y, col) => {
  const el = document.createElement('canvas');
  el.setAttribute('width', w);
  el.setAttribute('height', h);
  el.style.cssText = cssify({
    position: 'absolute',
    top: `${x - w / 2}px`,
    left: `${y - h / 2}px`,
    opacity: 0
  });
  p.appendChild(el);
  const ctx = el.getContext('2d');
  ctx.fillStyle = `#${col}`;
  ctx.fillRect(0, 0, w, h);
  return el;
};

const reqIds = [];
const anime = (el, i, val, dur) => {
  if (reqIds[i]) {
    window.cancelAnimationFrame(reqIds[i]);
    reqIds[i] = undefined;
  }
  const curVal = el.style.opacity;
  const valDist = val - curVal;
  window.requestAnimationFrame(start => {
    const end = start + dur;
    const fn = ts => {
      if (ts > end) {
        el.style.opacity = val;
      } else {
        const per = (ts - start) / dur;
        const dist = valDist * per;
        el.style.opacity = curVal + dist;
        reqIds[i] = window.requestAnimationFrame(fn);
      }
    };
    reqIds[i] = window.requestAnimationFrame(fn);
  });
};

const points = random.pic();
const fn = fisk(2, 2);
const els = points.map(xy => fn(xy[0], xy[1], x2col(xy[0])));

const every = now => {
  const nowY = window.pageYOffset;
  const maxY = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight);
  const yPer = nowY / maxY;
  const i = Math.floor(els.length * yPer);
  const ups = els.slice(0, i);
  const downs = els.slice(i);
  ups.forEach((el, x) => anime(el, x, 1, 100));
  downs.forEach((el, x) => anime(el, x + i, 0, 100));
  window.requestAnimationFrame(every);
};
window.requestAnimationFrame(every);
})();

var main = {

  bigImgEl : null,
  numImgs : null,

  init : function() {
    // Shorten the navbar after scrolling a little bit down
    $(window).scroll(function() {
        if ($(".navbar").offset().top > 50) {
            $(".navbar").addClass("top-nav-short");
            $(".navbar-custom .avatar-container").fadeOut(500);
        } else {
            $(".navbar").removeClass("top-nav-short");
            $(".navbar-custom .avatar-container").fadeIn(500);
        }
    });

    // On mobile, hide the avatar when expanding the navbar menu
    $('#main-navbar').on('show.bs.collapse', function () {
      $(".navbar").addClass("top-nav-expanded");
    });
    $('#main-navbar').on('hidden.bs.collapse', function () {
      $(".navbar").removeClass("top-nav-expanded");
    });

    // On mobile, when clicking on a multi-level navbar menu, show the child links
    $('#main-navbar').on("click", ".navlinks-parent", function(e) {
      var target = e.target;
      $.each($(".navlinks-parent"), function(key, value) {
        if (value == target) {
          $(value).parent().toggleClass("show-children");
        } else {
          $(value).parent().removeClass("show-children");
        }
      });
    });

    // Ensure nested navbar menus are not longer than the menu header
    var menus = $(".navlinks-container");
    if (menus.length > 0) {
      var navbar = $("#main-navbar ul");
      var fakeMenuHtml = "<li class='fake-menu' style='display:none;'><a></a></li>";
      navbar.append(fakeMenuHtml);
      var fakeMenu = $(".fake-menu");

      $.each(menus, function(i) {
        var parent = $(menus[i]).find(".navlinks-parent");
        var children = $(menus[i]).find(".navlinks-children a");
        var words = [];
        $.each(children, function(idx, el) { words = words.concat($(el).text().trim().split(/\s+/)); });
        var maxwidth = 0;
        $.each(words, function(id, word) {
          fakeMenu.html("<a>" + word + "</a>");
          var width =  fakeMenu.width();
          if (width > maxwidth) {
            maxwidth = width;
          }
        });
        $(menus[i]).css('min-width', maxwidth + 'px')
      });

      fakeMenu.remove();
    }

    // show the big header image
    main.initImgs();
  },

  initImgs : function() {
    // If the page was large images to randomly select from, choose an image
    if ($("#header-big-imgs").length > 0) {
      main.bigImgEl = $("#header-big-imgs");
      main.numImgs = main.bigImgEl.attr("data-num-img");

          // 2fc73a3a967e97599c9763d05e564189
	  // set an initial image
	  var imgInfo = main.getImgInfo();
	  var src = imgInfo.src;
	  var desc = imgInfo.desc;
  	  main.setImg(src, desc);

	  // For better UX, prefetch the next image so that it will already be loaded when we want to show it
  	  var getNextImg = function() {
	    var imgInfo = main.getImgInfo();
	    var src = imgInfo.src;
	    var desc = imgInfo.desc;

		var prefetchImg = new Image();
  		prefetchImg.src = src;
		// if I want to do something once the image is ready: `prefetchImg.onload = function(){}`

  		setTimeout(function(){
                  var img = $("<div></div>").addClass("big-img-transition").css("background-image", 'url(' + src + ')');
  		  $(".intro-header.big-img").prepend(img);
  		  setTimeout(function(){ img.css("opacity", "1"); }, 50);

		  // after the animation of fading in the new image is done, prefetch the next one
  		  //img.one("transitioned webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
		  setTimeout(function() {
		    main.setImg(src, desc);
			img.remove();
  			getNextImg();
		  }, 1000);
  		  //});
  		}, 6000);
  	  };

	  // If there are multiple images, cycle through them
	  if (main.numImgs > 1) {
  	    getNextImg();
	  }
    }
  },

  getImgInfo : function() {
  	var randNum = Math.floor((Math.random() * main.numImgs) + 1);
    var src = main.bigImgEl.attr("data-img-src-" + randNum);
	var desc = main.bigImgEl.attr("data-img-desc-" + randNum);

	return {
	  src : src,
	  desc : desc
	}
  },

  setImg : function(src, desc) {
	$(".intro-header.big-img").css("background-image", 'url(' + src + ')');
	if (typeof desc !== typeof undefined && desc !== false) {
	  $(".img-desc").text(desc).show();
	} else {
	  $(".img-desc").hide();
	}
  }
};

// 2fc73a3a967e97599c9763d05e564189

document.addEventListener('DOMContentLoaded', main.init);
