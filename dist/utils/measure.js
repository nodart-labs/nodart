"use strict";
const { PerformanceObserver, performance } = require('node:perf_hooks');
const init = () => {
    const obs = new PerformanceObserver((items) => {
        const entries = {};
        items.getEntries().forEach(item => {
            entries[item.name] = item.duration;
        });
        console.log(entries);
        performance.clearMarks();
    });
    obs.observe({ type: 'measure' });
};
const measure = {
    start: (from) => {
        init();
        performance.mark(from);
    },
    end: (from, to) => {
        performance.mark(to);
        performance.measure(`FROM: ${from} TO ${to}`, from, to);
    },
    test: (callback) => {
        measure.start('A');
        callback();
        measure.end('A', 'B');
    }
};
module.exports = measure;
//# sourceMappingURL=measure.js.map