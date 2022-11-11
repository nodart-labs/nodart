const { PerformanceObserver, performance } = require('node:perf_hooks')

const init = () => {
    const obs = new PerformanceObserver((items) => {

        const entries = {}

        items.getEntries().forEach(item => {
            entries[item.name] = item.duration
        })

        console.log(entries)

        performance.clearMarks()
    })
    obs.observe({ type: 'measure' })
}

const measure = {
    start: (from: string) => {
        init()
        performance.mark(from)
    },
    end: (from: string, to: string) => {
        performance.mark(to)
        performance.measure(`FROM: ${from} TO ${to}`, from, to)
    },
    test: (callback: Function) => {
        measure.start('A')
        callback()
        measure.end('A', 'B')
    }
}

/**
 * https://nodejs.org/api/perf_hooks.html#performance-measurement-apis
 */
export = measure
