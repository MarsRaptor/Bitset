type BitSetData = {
    data: number[], // Holds the actual bits in form of a 32bit integer array.
    _: number // Holds the MSB flag information to make indefinitely large bitsets inversion-proof
};

const P: BitSetData = {
    data: new Array<number>(), // Holds the actual bits in form of a 32bit integer array.
    _: 0 // Holds the MSB flag information to make indefinitely large bitsets inversion-proof
};

/**
 * Clone of infusion's BitSet.js
 * @see https://github.com/infusion/BitSet.js Typings are bugged for official
 */
class BitSet implements BitSetData {

    /**
     * The number of bits of a word
     * @const
     * @type number
     */
    static readonly WORD_LENGTH: number = 32;

    /**
     * The log base 2 of WORD_LENGTH
     * @const
     * @type number
     */
    static readonly WORD_LOG: number = 5;

    /**
     * Calculates the number of set bits
     *
     * @param {number} v
     * @returns {number}
     */
    static popCount(v: number): number {
        // Warren, H. (2009). Hacker`s Delight. New York, NY: Addison-Wesley
        v -= ((v >>> 1) & 0x55555555);
        v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
        return (((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24);
    }

    /**
   * Divide a number in base two by B
   *
   * @param {Array} arr
   * @param {number} B
   * @returns {number}
   */
    static divide(arr: Array<any>, B: number): number {

        var r = 0;

        for (var i = 0; i < arr.length; i++) {
            r *= 2;
            var d = (arr[i] + r) / B | 0;
            r = (arr[i] + r) % B;
            arr[i] = d;
        }
        return r;
    }

    /**
    * Divide a number in base two by B
    *
    * @param {BitSetData} dst
    * @param {number} ndx
    */
    static scale(dst: BitSetData, ndx: number) {

        var l = ndx >>> BitSet.WORD_LOG;
        var d = dst.data;
        var v = dst._;

        for (var i = d.length; l >= i; l--) {
            d.push(v);
        }
    }

    /**
     * Parses the parameters and set variable P
     *
     * @param {BitSetData} P
     * @param {string|BitSet|Array|Uint8Array|number} val
     */
    static parse(P: BitSetData, val?: (string | BitSet | Array<any> | Uint8Array | number)) {

        if (val == null) {
            P.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            P._ = 0;
            return;
        }

        if (val instanceof BitSet) {
            P.data = val.data;
            P._ = val._;
            return;
        }

        switch (typeof val) {

            case 'number':
                P.data = [val | 0];
                P._ = 0;
                break;

            case 'string':

                var base = 2;
                var len = BitSet.WORD_LENGTH;

                if (val.indexOf('0b') === 0) {
                    val = val.substr(2);
                } else if (val.indexOf('0x') === 0) {
                    val = val.substr(2);
                    base = 16;
                    len = 8;
                }

                P.data = [];
                P._ = 0;

                var a = val.length - len;
                var b = val.length;

                do {

                    var num = parseInt(val.slice(a > 0 ? a : 0, b), base);

                    if (isNaN(num)) {
                        throw SyntaxError('Invalid param');
                    }

                    P.data.push(num | 0);

                    if (a <= 0)
                        break;

                    a -= len;
                    b -= len;
                } while (1);

                break;

            default:

                P.data = [0];
                var data = P.data;
                P._ = 0;

                if (val instanceof Array) {

                    for (var i = val.length - 1; i >= 0; i--) {

                        var ndx = val[i];

                        if (ndx === Infinity) {
                            P._ = -1;
                        } else {
                            BitSet.scale(P, ndx);
                            data[ndx >>> BitSet.WORD_LOG] |= 1 << ndx;
                        }
                    }
                    break;
                }

                if (Uint8Array && val instanceof Uint8Array) {

                    var bits = 8;

                    BitSet.scale(P, val.length * bits);

                    for (var i = 0; i < val.length; i++) {

                        var n = val[i];

                        for (var j = 0; j < bits; j++) {

                            var k = i * bits + j;

                            data[k >>> BitSet.WORD_LOG] |= (n >> j & 1) << k;
                        }
                    }
                    break;
                }
                throw SyntaxError('Invalid param');
        }
    }

    /**
     * 
     * @param {string} str 
     * @returns {BitSet} newBitSet
     */
    static fromBinaryString(str: string): BitSet {

        return new BitSet('0b' + str);
    };

    /**
     * 
     * @param {string} str 
     * @returns {BitSet} newBitSet
     */
    static fromHexString(str: string): BitSet {

        return new BitSet('0x' + str);
    };

    static Random(n?: number): BitSet {

        if (n === undefined || n < 0) {
            n = BitSet.WORD_LENGTH;
        }

        var m = n % BitSet.WORD_LENGTH;

        // Create an array, large enough to hold the random bits
        var t = [];
        var len = Math.ceil(n / BitSet.WORD_LENGTH);

        // Create an bitset instance
        var s = new BitSet();

        // Fill the vector with random data, uniformally distributed
        for (var i = 0; i < len; i++) {
            t.push(Math.random() * 4294967296 | 0);
        }

        // Mask out unwanted bits
        if (m > 0) {
            t[len - 1] &= (1 << m) - 1;
        }

        s.data = t;
        s._ = 0;
        return s;
    };

    data: number[];
    _!: number;

    /**
     * @constructor
     * @param {string|BitSet|number=} param
     */
    constructor(param?: (string | BitSet | number)) {
        BitSet.parse(this, param);
        this.data = this!.data.slice();
    }

    /**
    * Set a single bit flag
    *
    * Ex:
    * bs1 = new BitSet(10);
    *
    * bs1.set(3, 1);
    *
    * @param {number} ndx The index of the bit to be set
    * @param {number=} value Optional value that should be set on the index (0 or 1)
    * @returns {BitSet} this
    */
    public set(ndx: number, value?: number): BitSet {

        ndx |= 0;

        BitSet.scale(this, ndx);

        if (value === undefined || value) {
            this.data[ndx >>> BitSet.WORD_LOG] |= (1 << ndx);
        } else {
            this.data[ndx >>> BitSet.WORD_LOG] &= ~(1 << ndx);
        }
        return this;
    }

    /**
     * Get a single bit flag of a certain bit position
     *
     * Ex:
     * bs1 = new BitSet();
     * var isValid = bs1.get(12);
     *
     * @param {number} ndx the index to be fetched
     * @returns {number} The binary flag
     */
    public get(ndx: number): number {

        ndx |= 0;

        var d = this.data;
        var n = ndx >>> BitSet.WORD_LOG;

        if (n >= d.length) {
            return this._ & 1;
        }
        return (d[n] >>> ndx) & 1;
    }

    /**
     * Creates the bitwise NOT of a set.
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * res = bs1.not();
     *
     * @returns {BitSet} A new BitSet object, containing the bitwise NOT of this
     */
    public not(): BitSet { // invert()

        var t = this.clone();
        var d = t.data;
        for (var i = 0; i < d.length; i++) {
            d[i] = ~d[i];
        }

        t._ = ~t._;

        return t;
    }

    /**
     * Creates the bitwise AND of two sets.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * res = bs1.and(bs2);
     *
     * @param {BitSet} value A bitset object
     * @returns {BitSet} A new BitSet object, containing the bitwise AND of this and value
     */
    public and(value: BitSet): BitSet {// intersection

        BitSet.parse(P, value);

        var T = this.clone();
        var t = T.data;
        var p = P.data;

        var pl = p.length;
        var p_ = P._;
        var t_ = T._;

        // If this is infinite, we need all bits from P
        if (t_ !== 0) {
            BitSet.scale(T, pl * BitSet.WORD_LENGTH - 1);
        }

        var tl = t.length;
        var l = Math.min(pl, tl);
        var i = 0;

        for (; i < l; i++) {
            t[i] &= p[i];
        }

        for (; i < tl; i++) {
            t[i] &= p_;
        }

        T._ &= p_;

        return T;
    }

    /**
     * Creates the bitwise OR of two sets.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * res = bs1.or(bs2);
     *
     * @param {BitSet} val A bitset object
     * @returns {BitSet} A new BitSet object, containing the bitwise OR of this and val
     */
    public or(val: BitSet): BitSet { // union

        BitSet.parse(P, val);

        var t = this.clone();
        var d = t.data;
        var p = P.data;

        var pl = p.length - 1;
        var tl = d.length - 1;

        var minLength = Math.min(tl, pl);

        // Append backwards, extend array only once
        for (var i = pl; i > minLength; i--) {
            d[i] = p[i];
        }

        for (; i >= 0; i--) {
            d[i] |= p[i];
        }

        t._ |= P._;

        return t;
    }

    /**
       * Creates the bitwise XOR of two sets.
       *
       * Ex:
       * bs1 = new BitSet(10);
       * bs2 = new BitSet(10);
       *
       * res = bs1.xor(bs2);
       *
       * @param {BitSet} val A bitset object
       * @returns {BitSet} A new BitSet object, containing the bitwise XOR of this and val
       */
    public xor(val: BitSet): BitSet { // symmetric difference

        BitSet.parse(P, val);

        var t = this.clone();
        var d = t.data;
        var p = P.data;

        var t_ = t._;
        var p_ = P._;

        var i = 0;

        var tl = d.length - 1;
        var pl = p.length - 1;

        // Cut if tl > pl
        for (i = tl; i > pl; i--) {
            d[i] ^= p_;
        }

        // Cut if pl > tl
        for (i = pl; i > tl; i--) {
            d[i] = t_ ^ p[i];
        }

        // XOR the rest
        for (; i >= 0; i--) {
            d[i] ^= p[i];
        }

        // XOR infinity
        t._ ^= p_;

        return t;
    }

    /**
    * Creates the bitwise AND NOT (not confuse with NAND!) of two sets.
    *
    * Ex:
    * bs1 = new BitSet(10);
    * bs2 = new BitSet(10);
    *
    * res = bs1.notAnd(bs2);
    *
    * @param {BitSet} val A bitset object
    * @returns {BitSet} A new BitSet object, containing the bitwise AND NOT of this and other
    */
    public andNot(val: BitSet): BitSet { // difference

        return this.and(new BitSet(val).flip());
    }

    /**
       * Flip/Invert a range of bits by setting
       *
       * Ex:
       * bs1 = new BitSet();
       * bs1.flip(); // Flip entire set
       * bs1.flip(5); // Flip single bit
       * bs1.flip(3,10); // Flip a bit range
       *
       * @param {number} from The start index of the range to be flipped
       * @param {number} to The end index of the range to be flipped
       * @returns {BitSet} this
       */
    public flip(from?: number, to?: number): BitSet {

        if (from === undefined) {

            var d = this.data;
            for (var i = 0; i < d.length; i++) {
                d[i] = ~d[i];
            }

            this._ = ~this._;

        } else if (to === undefined) {

            BitSet.scale(this, from);

            this.data[from >>> BitSet.WORD_LOG] ^= (1 << from);

        } else if (0 <= from && from <= to) {

            BitSet.scale(this, to);

            for (var i = from; i <= to; i++) {
                this.data[i >>> BitSet.WORD_LOG] ^= (1 << i);
            }
        }
        return this;
    }

    /**
       * Clear a range of bits by setting it to 0
       *
       * Ex:
       * bs1 = new BitSet();
       * bs1.clear(); // Clear entire set
       * bs1.clear(5); // Clear single bit
       * bs1.clear(3,10); // Clear a bit range
       *
       * @param {number?} from The start index of the range to be cleared
       * @param {number?} to The end index of the range to be cleared
       * @returns {BitSet} this
       */
    public clear(from?: number, to?: number): BitSet {

        var data = this.data;

        if (from === undefined) {

            for (var i = data.length - 1; i >= 0; i--) {
                data[i] = 0;
            }
            this._ = 0;

        } else if (to === undefined) {

            from |= 0;

            BitSet.scale(this, from);

            data[from >>> BitSet.WORD_LOG] &= ~(1 << from);

        } else if (from <= to) {

            BitSet.scale(this, to);

            for (var i = from; i <= to; i++) {
                data[i >>> BitSet.WORD_LOG] &= ~(1 << i);
            }
        }
        return this;
    }

    /**
     * Gets an entire range as a new bitset object
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.slice(4, 8);
     *
     * @param {number?} from The start index of the range to be get
     * @param {number?} to The end index of the range to be get
     * @returns {BitSet} A new smaller bitset object, containing the extracted range
     */
    public slice(from?: number, to?: number): BitSet | undefined {

        if (from === undefined) {
            return this.clone();
        } else if (to === undefined) {

            to = this.data.length * BitSet.WORD_LENGTH;

            var im = new BitSet();

            im._ = this._;
            im.data = [0];

            for (var i = from; i <= to; i++) {
                im.set(i - from, this.get(i));
            }
            return im;

        } else if (from <= to && 0 <= from) {

            var im = new BitSet();
            im.data = [0];

            for (var i = from; i <= to; i++) {
                im.set(i - from, this.get(i));
            }
            return im;
        }
        return;
    }

    /**
     * Set a range of bits
     *
     * Ex:
     * bs1 = new BitSet();
     *
     * bs1.setRange(10, 15, 1);
     *
     * @param {number} from The start index of the range to be set
     * @param {number} to The end index of the range to be set
     * @param {number} value Optional value that should be set on the index (0 or 1)
     * @returns {BitSet} this
     */
    public setRange(from: number, to: number, value: number): BitSet {

        for (var i = from; i <= to; i++) {
            this.set(i, value);
        }
        return this;
    }

    /**
       * Clones the actual object
       *
       * Ex:
       * bs1 = new BitSet(10);
       * bs2 = bs1.clone();
       *
       * @returns {BitSet} A new BitSet object, containing a copy of the actual object
       */
    public clone(): BitSet {

        var im = new BitSet();
        im.data = this.data.slice();
        im._ = this._;
        return im;
    }

    /**
       * Gets a list of set bits
       *
       * @returns {Array}
       */
    public toArray(): Array<number> {

        var ret = [];
        var data = this.data;

        for (var i = data.length - 1; i >= 0; i--) {

            var num = data[i];

            while (num !== 0) {
                var t = 31 - Math['clz32'](num);
                num ^= 1 << t;
                ret.unshift((i * BitSet.WORD_LENGTH) + t);
            }
        }

        if (this._ !== 0)
            ret.push(Infinity);

        return ret;
    }

    /**
     * Overrides the toString method to get a binary representation of the BitSet
     *
     * @param {number=} base
     * @returns string A binary string
     */
    toString(base: number | undefined) {

        var data = this.data;

        if (!base)
            base = 2;
        // If base is power of two
        if ((base & (base - 1)) === 0 && base < 36) {

            let ret: string = '';
            var len = 2 + Math.log(4294967295/*Math.pow(2, WORD_LENGTH)-1*/) / Math.log(base) | 0;

            for (var i = data.length - 1; i >= 0; i--) {

                var cur = data[i];

                // Make the number unsigned
                if (cur < 0)
                    cur += 4294967296 /*Math.pow(2, WORD_LENGTH)*/;

                var tmp = cur.toString(base);

                if (ret !== '') {
                    // Fill small positive numbers with leading zeros. The +1 for array creation is added outside already
                    ret += '0'.repeat(len - tmp.length - 1);
                }
                ret += tmp;
            }

            if (this._ === 0) {

                ret = ret.replace(/^0+/, '');

                if (ret === '')
                    ret = '0';
                return ret;

            } else {
                // Pad the string with ones
                ret = '1111' + ret;
                return ret.replace(/^1+/, '...1111');
            }

        } else {

            if ((2 > base || base > 36))
                throw SyntaxError('Invalid base');

            let ret = [];
            var arr = [];

            // Copy every single bit to a new array
            for (var i = data.length; i--;) {

                for (var j = BitSet.WORD_LENGTH; j--;) {

                    arr.push(data[i] >>> j & 1);
                }
            }

            do {
                ret.unshift(BitSet.divide(arr, base).toString(base));
            } while (!arr.every(function (x) {
                return x === 0;
            }));

            return ret.join('');
        }
    }

    /**
     * Check if the BitSet is empty, means all bits are unset
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.isEmpty() ? 'yes' : 'no'
     *
     * @returns {boolean} Whether the bitset is empty
     */
    public isEmpty(): boolean {

        if (this._ !== 0)
            return false;

        var d = this.data;

        for (var i = d.length - 1; i >= 0; i--) {
            if (d[i] !== 0)
                return false;
        }
        return true;
    }

    /**
       * Calculates the number of bits set
       *
       * Ex:
       * bs1 = new BitSet(10);
       *
       * var num = bs1.cardinality();
       *
       * @returns {number} The number of bits set
       */
    public cardinality(): number {

        if (this._ !== 0) {
            return Infinity;
        }

        var s = 0;
        var d = this.data;
        for (var i = 0; i < d.length; i++) {
            var n = d[i];
            if (n !== 0)
                s += BitSet.popCount(n);
        }
        return s;
    }

    /**
       * Calculates the Most Significant Bit / log base two
       *
       * Ex:
       * bs1 = new BitSet(10);
       *
       * var logbase2 = bs1.msb();
       *
       * var truncatedTwo = Math.pow(2, logbase2); // May overflow!
       *
       * @returns {number} The index of the highest bit set
       */
    public msb(): number {
        if (this._ !== 0) {
            return Infinity;
        }

        var data = this.data;

        for (var i = data.length; i-- > 0;) {

            var c = Math['clz32'](data[i]);

            if (c !== BitSet.WORD_LENGTH) {
                return (i * BitSet.WORD_LENGTH) + BitSet.WORD_LENGTH - 1 - c;
            }
        }
        return Infinity;
    }

    /**
        * Calculates the number of trailing zeros
        *
        * Ex:
        * bs1 = new BitSet(10);
        *
        * var ntz = bs1.ntz();
        *
        * @returns {number} The index of the lowest bit set
        */
    public ntz(): number {

        var data = this.data;

        for (var j = 0; j < data.length; j++) {
            var v = data[j];

            if (v !== 0) {

                v = (v ^ (v - 1)) >>> 1; // Set v's trailing 0s to 1s and zero rest

                return (j * BitSet.WORD_LENGTH) + BitSet.popCount(v);
            }
        }
        return Infinity;
    }

    /**
       * Calculates the Least Significant Bit
       *
       * Ex:
       * bs1 = new BitSet(10);
       *
       * var lsb = bs1.lsb();
       *
       * @returns {number} The index of the lowest bit set
       */
    public lsb(): number {

        var data = this.data;

        for (var i = 0; i < data.length; i++) {

            var v = data[i];
            var c = 0;

            if (v) {

                var bit = (v & -v);

                for (; (bit >>>= 1); c++) {

                }
                return BitSet.WORD_LENGTH * i + c;
            }
        }
        return Infinity;
    }

    /**
       * Compares two BitSet objects
       *
       * Ex:
       * bs1 = new BitSet(10);
       * bs2 = new BitSet(10);
       *
       * bs1.equals(bs2) ? 'yes' : 'no'
       *
       * @param {BitSet} val A bitset object
       * @returns {boolean} Whether the two BitSets have the same bits set (valid for indefinite sets as well)
       */
    public equals(val: BitSet): boolean {

        BitSet.parse(P, val);

        var t = this.data;
        var p = P.data;

        var t_ = this._;
        var p_ = P._;

        var tl = t.length - 1;
        var pl = p.length - 1;

        if (p_ !== t_) {
            return false;
        }

        var minLength = tl < pl ? tl : pl;
        var i = 0;

        for (; i <= minLength; i++) {
            if (t[i] !== p[i])
                return false;
        }

        for (i = tl; i > pl; i--) {
            if (t[i] !== p_)
                return false;
        }

        for (i = pl; i > tl; i--) {
            if (p[i] !== t_)
                return false;
        }
        return true;
    }

}

export default BitSet