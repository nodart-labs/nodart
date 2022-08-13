/**
 * https://nodejs.org/api/perf_hooks.html#performance-measurement-apis
 */
export = () => {
    return {
        init: () => {
            const obs = new PerformanceObserver((items) => {
                console.log(items.getEntries()[0].duration)
                performance.clearMarks()
            })
            obs.observe({ type: 'measure' })
        },
        mark: (name: string) => performance.mark(name),
        end: (from: string, to: string, name?: string) => performance.measure(name ?? `FROM: ${from} TO ${to}`, from, to),
    }
}
