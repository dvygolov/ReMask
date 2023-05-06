import {loadAllStatistics} from './statistics.js';

window.addEventListener('DOMContentLoaded', () => {
    const buttonElement = document.getElementById('loadstats');
    buttonElement.addEventListener('click', loadAllStatistics);
});
