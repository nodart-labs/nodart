/**
 * https://nodejs.org/api/perf_hooks.html#performance-measurement-apis
 */

const { PerformanceObserver, performance } = require('node:perf_hooks')

let logged = false

const init = () => {
    const obs = new PerformanceObserver((items) => {

        const entries = {}

        logged || items.getEntries().forEach((item, i) => {
            (entries[item.name] = item.duration)
        })
        logged = true

        for (const [key, data] of Object.entries(entries)) {
            key && console.log(key, data)
        }

        performance.clearMarks()
    })
    obs.observe({ type: 'measure' })
}

const measure = {
    start: (from: string) => {
        logged = false
        init()
        performance.mark(from)
    },
    end: (from: string, to: string) => {
        performance.mark(to)
        performance.measure(`FROM: ${from} TO ${to}`, from, to)
    },
    test: (callback: Function, from = 'A', to = 'B') => {
        measure.start(from)
        callback()
        measure.end(from, to)
    },
    point(callback: Function, name?: string) {
        const start = performance.now()
        callback()
        const end = performance.now()
        console.log(name ? name + ':' : '', `${end - start} ms`)
    }
}

export = measure
