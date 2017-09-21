/*Theme    : Narani
 * Author  : Design_mylife
 * Version : V1.1
 * 
 */

var loadFlag = true;
sessionStorage.setItem("now_pages", "index");

//ES6 Promise api
var callApi = function (url, method, data, bAuth) {
    data = data || "";
    url = "https://api.github.com" + url;
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.setRequestHeader("Accept", "application/vnd.github.mercy-preview+json");
        var token = sessionStorage.getItem('token')
        if (token && token != '') {
            xhr.setRequestHeader("Authorization", "token " + token);
        }
        var checkAuth = bAuth ? bAuth : sessionStorage.getItem('cryp')
        if (checkAuth) {
            xhr.setRequestHeader("Authorization", "Basic " + checkAuth);
        }
        xhr.send(JSON.stringify(data))
        //Call a function when the state changes.
        xhr.onload = function () {
            if (xhr.readyState == XMLHttpRequest.DONE && (xhr.status == 200 || xhr.status == 201 || xhr.status == 202)) {
                // console.log(xhr.response)
                resolve(JSON.parse(xhr.response))
            } else if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 403) {
                if (token && token != '') {
                    $.notify('查詢次數過多，請稍後再試', {
                        position: 'top center'
                    })
                } else {
                    $("#login_md").modal('show')
                    $.notify('請登入以獲得完整功能', {
                        position: 'top center'
                    })
                }
                reject(JSON.parse(xhr.response));
            } else if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 422) {
                $("#login_md").modal('show')
                $.notify('請登入以獲得完整功能', {
                    position: 'top center'
                })
                reject(JSON.parse(xhr.response));
            } else {
                reject(JSON.parse(xhr.response));
            }
        }
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
    });
}


// transparent header on scroll 
$(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
        $('.trans-before').addClass('trans-after');
    } else {
        $('.trans-before').removeClass('trans-after');
    }
});




//auto close collapse on click
function close_toggle() {
    if ($(window).width() <= 768) {
        $('.navbar-collapse a').on('click', function () {
            $('.navbar-collapse').collapse('hide');
        });
    } else {
        $('.navbar .navbar-default a').off('click');
    }
}
close_toggle();

$(window).resize(close_toggle);



/* ==============================================
Smooth Scroll To Anchor
=============================================== */

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('.navbar a:not(".dropdown-toggle"), .navbar.btn:not("#loginBtn")').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 50
        }, 1500, 'easeInOutExpo');

        event.preventDefault();
    });
});

//parallax
$(window).stellar({
    horizontalScrolling: false,
    responsive: true
    /*,
         scrollProperty: 'scroll',
         parallaxElements: false,
         horizontalScrolling: false,
         horizontalOffset: 0,
         verticalOffset: 0*/
});

//owl carousel for work
$(document).ready(function () {

    $("#work-carousel").owlCarousel({
        // Most important owl features
        items: 4,
        itemsCustom: false,
        itemsDesktop: [1199, 4],
        itemsDesktopSmall: [980, 3],
        itemsTablet: [768, 3],
        itemsTabletSmall: false,
        itemsMobile: [479, 1],
        singleItem: false,
        startDragging: true
    });

});


//owl carousel for testimonials
$(document).ready(function () {

    $("#testi-carousel").owlCarousel({
        // Most important owl features
        items: 1,
        itemsCustom: false,
        itemsDesktop: [1199, 1],
        itemsDesktopSmall: [980, 1],
        itemsTablet: [768, 1],
        itemsTabletSmall: false,
        itemsMobile: [479, 1],
        singleItem: false,
        startDragging: true
    });

});

/* ==============================================
 Counter Up
 =============================================== */
jQuery(document).ready(function ($) {
    $('.counter').counterUp({
        delay: 100,
        time: 800
    });
});


/* ==============================================
 WOW plugin triggers animate.css on scroll
 =============================================== */

var wow = new WOW({
    boxClass: 'wow', // animated element css class (default is wow)
    animateClass: 'animated', // animation css class (default is animated)
    offset: 150, // distance to the element when triggering the animation (default is 0)
    mobile: false // trigger animations on mobile devices (true is default)
});
wow.init();

/*========tooltip and popovers====*/
/*==========================*/
$("[data-toggle=popover]").popover();

$("[data-toggle=tooltip]").tooltip();
