"use strict";
module.exports = {
    init: () => {
        const obs = new PerformanceObserver((items) => {
            console.log(items.getEntries()[0].duration);
            performance.clearMarks();
        });
        obs.observe({ type: 'measure' });
    },
    mark: (name) => performance.mark(name),
    end: (from, to, name) => performance.measure(name !== null && name !== void 0 ? name : `FROM: ${from} TO ${to}`, from, to),
};
//# sourceMappingURL=measure.js.map