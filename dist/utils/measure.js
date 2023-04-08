"use strict";
/**
 * https://nodejs.org/api/perf_hooks.html#performance-measurement-apis
 */
const { PerformanceObserver, performance } = require("node:perf_hooks");
let logged = false;
const init = () => {
    const obs = new PerformanceObserver((items) => {
        const entries = {};
        logged ||
            items.getEntries().forEach((item) => {
                entries[item.name] = item.duration;
            });
        logged = true;
        for (const [key, data] of Object.entries(entries)) {
            key && console.log(key, data);
        }
        performance.clearMarks();
    });
    obs.observe({ type: "measure" });
};
const measure = {
    start: (from) => {
        logged = false;
        init();
        performance.mark(from);
    },
    end: (from, to) => {
        performance.mark(to);
        performance.measure(`FROM: ${from} TO ${to}`, from, to);
    },
    test: (callback, from = "A", to = "B") => {
        measure.start(from);
        callback();
        measure.end(from, to);
    },
    point(callback, name) {
        const start = performance.now();
        callback();
        const end = performance.now();
        console.log(name ? name + ":" : "", `${end - start} ms`);
    },
};
module.exports = measure;
//# sourceMappingURL=measure.js.map