export = {

    isBool(value) {
        return typeof value === 'boolean'
    },

    isNil(value) {
        return value === null || value === undefined
    },

    isFunc(value) {
        return !this.isNil(value) && value instanceof Function
    },

    isPlainObject(value) {
        return !this.isNil(value)
            && !Array.isArray(value)
            && typeof value !== 'function'
            && value instanceof Object
            && value.constructor === Object
    },

    isObject(value) {
        const type = typeof value
        return !this.isNil(value) && (type === 'object' || type === 'function')
    },

    isArrayOfObjects(value) {
        return !!(Array.isArray(value) && value.some(v => !this.isPlainObject(v)))
    },

    isString(value) {
        return typeof value === 'string'
    },

    isNum(value) {
        return typeof value === 'number' && !isNaN(value)
    },

    isEmpty(value) {
        if (this.isNil(value)) return true
        const type = Array.isArray(value) ? 'array' : this.isPlainObject(value) ? 'object' : typeof value

        switch (type) {
            case 'array': {
                return value.length === 0
            }
            case 'object': {
                return Object.keys(value).length === 0
            }
            case 'string': {
                return value.trim() === ""
            }
            case 'number': {
                return value <= 0
            }
            case 'boolean': {
                return value !== true
            }
        }
        return !value
    },

    toArray(value) {
        return Array.isArray(value) ? value : [value]
    },

    includes(text, arr) {
        return arr?.some(v => text.includes(v))
    },

    capitalize(text) {
        return text ? text.toString().charAt(0).toUpperCase() + text.toString().slice(1) : ''
    },

    toUpper(text) {
        return text?.toUpperCase() ?? ''
    },

    toLower(text) {
        return text?.toLowerCase() ?? ''
    },

    trim(str, characters, flags) {

        const trim = function (str, characters, flags) {

            flags = flags || "g"

            if (!str || !characters || typeof str !== 'string' || typeof characters !== 'string' || typeof flags !== 'string') {
                return str?.toString().trim()
            }

            const escapeRegex = (string) => {
                return string.replace(/[[\](){}?*+^$\\.|-]/g, "\\$&")
            }

            if (!/^[gi]*$/.test(flags)) {
                throw new TypeError("Invalid flags supplied '" + flags.match(new RegExp("[^gi]*")) + "'")
            }

            characters = escapeRegex(characters)

            return str.replace(new RegExp("^[" + characters + "]+|[" + characters + "]+$", flags), '')
        }

        let output = str ?? ''

        Array.isArray(characters)
            ? characters.forEach(char => output = trim(output, char, flags))
            : output = trim(output, characters, flags)

        return output
    },

    trimPath(pathString) {
        return this.trim(pathString?.trim() ?? '', ['/', '\\'])
    },

    prettyNumber(x) {
        return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || 0
    },

    sum(arrayOfNumbers, iteratee) {
        this.isFunc(iteratee) || (iteratee = (v) => v)
        const sum = () => {
            let result,
                index = -1

            while (++index < arrayOfNumbers.length) {
                let current = iteratee(arrayOfNumbers[index])
                if (current !== undefined) {
                    result = result === undefined ? current : (result + current)
                }
            }
            return result
        }
        return arrayOfNumbers.length ? sum() : 0
    },

    promise(cond, {maxCount: maxCount = 30, interval: interval = 1000, delay: delay = 0}) {
        if (typeof cond !== 'function')
            return false
        let count = 0, i
        return new Promise((resolve, reject) => {
            const handle = () => {
                count += 1
                const check = cond(count)
                if (check || count >= maxCount) {
                    check ? resolve(check) : reject()
                    clearInterval(i)
                }
            }
            setTimeout(() => {
                handle()
                i = setInterval(() => handle(), interval)
            }, delay)
        })
    },

    strep(str, replacements, useBraces = false) {
        for (let r in replacements) {
            if (Object.prototype.hasOwnProperty.call(replacements, r)) {
                const rp = useBraces ? `{${r}}` : r
                str = str.replace(new RegExp(rp, 'g'), replacements[r])
            }
        }
        return str
    },

    log(data) {
        console.log(data)
    },

    hyphen2Camel(str: string, delimiters?: string) {
        if (!str) return ''
        const pattern = /[-_]+(.)?/g
        function toUpper(match, group1) {
            return group1 ? group1.toUpperCase() : ''
        }

        return str.replace(delimiters ? new RegExp('[' + delimiters + ']+(.)?', 'g') : pattern, toUpper)
    },

    camel2Snake(str: string) {
        if (!str) return ''
        return str.replace(/\.?([A-Z]+)/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "")
    },

    get date() {
        return {
            currentDateTime() {
                const today = new Date()
                const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
                const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
                return date + ' ' + time
            }
        }
    },

    get random() {
        return {
            hex(num:number = 20) {
                return require('crypto').randomBytes(num).toString('hex')
            }
        }
    }

}
