export = {

    isNil(value: any) {
        return value === null || value === undefined
    },

    isPlainObject(value: any) {
        return !this.isNil(value)
            && !Array.isArray(value)
            && typeof value !== 'function'
            && value instanceof Object
            && value.constructor === Object
    },

    isObject(value: any) {
        const type = typeof value
        return !this.isNil(value) && (type === 'object' || type === 'function')
    },

    isArrayOfObjects(value: any) {
        return Array.isArray(value) && !value.some(v => !this.isPlainObject(v))
    },

    isEmpty(value: any) {
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
                return value === 0
            }
            case 'boolean': {
                return value === false
            }
        }
        return !value
    },

    capitalize(text: string) {
        return text?.toString().charAt(0).toUpperCase() + text.toString().slice(1) || ''
    },

    trim(str: string, characters: string | string[], flags: string = 'g') {

        str &&= str.toString()

        if (!str) return ''

        if (flags !== 'g' && !/^[gi]*$/.test(flags))

            throw new TypeError("Invalid flags supplied '" + flags.match(new RegExp("[^gi]*")) + "'")

        const escapeRegex = (char) => char.replace(/[[\](){}?*+^$\\.|-]/g, "\\$&")

        const trim = function (str, char, flags) {

            char = escapeRegex(char)

            return str.replace(new RegExp("^[" + char + "]+|[" + char + "]+$", flags), '')
        }

        Array.isArray(characters)
            ? characters.forEach(char => str = trim(str, char, flags))
            : str = trim(str, characters, flags)

        return str
    },

    trimPath(pathLike: string) {

        return pathLike?.trim().replace(/^[\\|\/]*/g, '').replace(/[\\|\/]*$/g, '') || ''
    },

    prettyNumber(x: string | number): string | number {
        return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || 0
    },

    sum(arrayOfNumbers: number[], iteratee?: Function) {
        iteratee ||= (v) => v

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
        return str.replace(/\.?([A-Z]+)/g, function (x, y) {
            return "_" + y.toLowerCase()
        }).replace(/^_/, "")
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
            hex(num: number = 20) {
                return require('crypto').randomBytes(num).toString('hex')
            }
        }
    }

}
