/* =========================================
   ELEMENTS
========================================= */

const video =
    document.getElementById("backgroundVideo");

const progressBar =
    document.getElementById("progressBar");

const sections =
    document.querySelectorAll(".story-section");


/* =========================================
   VIDEO PLAYBACK
========================================= */

video.addEventListener(
    "loadedmetadata",
    () => {

        video.play().catch(
            (err) => {

                console.log(
                    "Video autoplay blocked:",
                    err
                );

            }
        );

    }
);


/* =========================================
   SCROLL PROGRESS
========================================= */

function getScrollProgress() {

    const scrollTop =
        window.scrollY;

    const pageHeight =
        document.documentElement.scrollHeight;

    const viewportHeight =
        window.innerHeight;

    const scrollHeight =
        pageHeight - viewportHeight;


    if (scrollHeight <= 0) {
        return 0;
    }


    return Math.min(
        Math.max(
            scrollTop / scrollHeight,
            0
        ),
        1
    );

}


/* =========================================
   PROGRESS BAR UPDATE
========================================= */

function updateProgressBar() {

    const progress =
        getScrollProgress();

    progressBar.style.height =
        `${progress * 100}%`;

}


/* =========================================
   ANIMATION LOOP
========================================= */

function animationLoop() {

    updateProgressBar();

    requestAnimationFrame(
        animationLoop
    );

}

animationLoop();


/* =========================================
   CONTENT REVEAL
========================================= */

const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    const content =
                        entry.target.querySelector(
                            ".content"
                        );


                    if (!content) {
                        return;
                    }


                    if (
                        entry.isIntersecting
                    ) {

                        content.classList.add(
                            "active"
                        );

                    } else {

                        content.classList.remove(
                            "active"
                        );

                    }

                }
            );

        },
        {
            threshold: 0.30
        }
    );


sections.forEach(
    (section) => {

        observer.observe(
            section
        );

    }
);


/* =========================================
   HERO
========================================= */

const heroContent =
    document.querySelector(
        ".hero-content"
    );

if (heroContent) {

    heroContent.classList.add(
        "active"
    );

}


/* =========================================
   MOBILE VIDEO
========================================= */

function configureVideo() {

    if (window.innerWidth <= 600) {

        video.preload = "metadata";

    } else {

        video.preload = "auto";

    }

}


configureVideo();


window.addEventListener(
    "resize",
    configureVideo
);


/* =========================================
   REDUCED MOTION
========================================= */

const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


if (reducedMotion.matches) {

    document.documentElement.style
        .scrollBehavior = "auto";

}