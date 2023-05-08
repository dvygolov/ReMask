import {loadAllStatistics} from './statistics.js';

window.addEventListener('DOMContentLoaded', () => {
    const loadingIcon = document.getElementById('loadingIcon');
    const loadButton = document.getElementById("loadstats");
    loadButton.addEventListener('click', async (event) => {
        loadingIcon.style.display = 'inline-block';
        await loadAllStatistics();
        loadingIcon.style.display = 'none';
    });
});
