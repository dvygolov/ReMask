import {loadAllStatistics} from './statistics.js';

window.addEventListener('DOMContentLoaded', () => {
    const loadingIcon = document.getElementById('loadingIcon');
    const loadButton = document.getElementById("loadstats");
    loadButton.addEventListener('click', async (event) => {
        loadingIcon.style.display = 'inline-block';
        await loadAllStatistics();
        setPopups();
        loadingIcon.style.display = 'none';
    });
});

function setPopups() {
    var posters = document.querySelectorAll('.poster');

    posters.forEach(function (poster) {
        poster.addEventListener('mouseenter', function () {
            var descr = this.querySelector('.descr');

            // Check if hovered row is one of the last two rows
            if (Array.from(posters).slice(-2).includes(this)) {
                // Show .descr block above the row
                descr.style.top = 'auto';
                descr.style.bottom = '100%';
                descr.style.display = 'block';
                descr.style.position = 'absolute';
                descr.style.zIndex = '9999';
            } else {
                // Show .descr block below the row
                descr.style.display = 'block';
                descr.style.position = 'absolute';
                descr.style.zIndex = '9999';
            }
        });

        poster.addEventListener('mouseleave', function () {
            // Hide .descr block when not hovered
            this.querySelector('.descr').style.display = 'none';
        });
    });
};
