/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (Mozilla, Waypoint) {
    'use strict';

    var supportsMatchMedia = typeof window.matchMedia !== 'undefined';
    var supportsVideo = typeof HTMLMediaElement !== 'undefined';
    var cutsTheMustard = supportsMatchMedia && supportsVideo;
    var $slideShow = $('.feature-carousel');
    var $signUp = $('.button.sign-up');
    var stickyFooterWaypoint;
    var videoCarouselWaypoint;
    var otherFeaturesWaypoint;

    function initNewsletterSignUp() {
        $signUp.attr('role', 'button').on('click', function(e) {
            e.preventDefault();
            Mozilla.Modal.createModal(this, $('.newsletter-modal'));
        });
    }

    function initVideoCarousel() {
        $slideShow.cycle({
            fx: 'scrollHorz',
            log: false,
            slides: '> li',
            speed: 620,
            prev: '.feature-carousel-previous',
            next: '.feature-carousel-next',
        });

        $slideShow.cycle('pause');

        // Triggered just prior to a transition to a new slide.
        $slideShow.on('cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl) {
            var outgoingVideo = $(outgoingSlideEl).find('video')[0];
            var incomingVideo = $(incomingSlideEl).find('video')[0];

            // pause the outgoing video.
            if (outgoingVideo && !outgoingVideo.paused) {
                outgoingVideo.pause();
            }

            // reset the incoming video to the first frame.
            if (incomingVideo && incomingVideo.paused) {
                incomingVideo.currentTime = 0;
            }
        });

        // Triggered after the slideshow has completed transitioning to the next slide.
        $slideShow.on('cycle-after', function(event, optionHash, outgoingSlideEl, incomingSlideEl) {
            var video = $(incomingSlideEl).find('video')[0];

            // play the incoming video
            if (video && video.paused) {
                playVideo(video);
            }
        });
    }

    function destroyVideoCarousel() {
        var activeVideo = $('.cycle-slide-active video')[0];

        if (activeVideo) {
            activeVideo.pause();
        }

        $slideShow.cycle('destroy');
    }

    function initVideoCarouselWaypoints() {

        videoCarouselWaypoint = new Waypoint({
            element: $('.feature-carousel-container'),
            offset: '50%',
            handler: function(direction) {
                var video = $('.cycle-slide-active video')[0];

                if (video) {
                    if (direction === 'down') {
                        playVideo(video);
                    } else {
                        video.pause();
                    }
                }
            }
        });

        otherFeaturesWaypoint = new Waypoint({
            element: $('.other-features'),
            offset: 0,
            handler: function(direction) {
                var video = $('.cycle-slide-active video')[0];

                if (direction === 'down') {
                    playVideo(video);
                } else {
                    video.play();
                }
            }
        });
    }

    function playVideo(video) {
        if (video.readyState && video.readyState > 0) {
            video.play();
        }
    }

    function initMediaQueries() {
        var desktopWidth;

        desktopWidth = matchMedia('(min-width: 1000px)');

        if (desktopWidth.matches) {
            initVideoCarousel();
            initVideoCarouselWaypoints();
            initStickyFooter();
        }

        desktopWidth.addListener(function(mq) {
            if (mq.matches) {
                initVideoCarousel();
                initVideoCarouselWaypoints();
                initStickyFooter();
            } else {
                destroyVideoCarousel();
                destroyWaypoints();
            }
        });
    }

    function initStickyFooter() {
        stickyFooterWaypoint = new Waypoint.Sticky({
            element: $('.sticky-footer'),
            offset: 'bottom-in-view'
        });
    }

    function destroyWaypoints() {
        if (stickyFooterWaypoint) {
            stickyFooterWaypoint.destroy();
        }

        if (videoCarouselWaypoint) {
            videoCarouselWaypoint.destroy();
        }

        if (otherFeaturesWaypoint) {
            otherFeaturesWaypoint.destroy();
        }
    }

    if (cutsTheMustard) {
        initMediaQueries();
    }

    initNewsletterSignUp();

})(window.Mozilla, window.Waypoint);
