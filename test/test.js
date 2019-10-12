'use strict';
let assert = require('assert');
const chai = require("chai");

let BitSet = require("../.dist/index.js").default

describe('BitSet', function () {

    it('should Construct', function () {
        let bs = new BitSet(19219);
        assert.equal(bs.toString(10), '19219');

        bs = new BitSet;
        assert.equal(bs.toString(32), '0');

        bs = new BitSet(-1);
        assert.equal(bs.toString(2), '11111111111111111111111111111111');
    });

    it('should set an individual bit', function () {
        let bs = new BitSet();
        bs.set(31);
        assert.equal(bs.get(31), 1);
    });

    it('should find first set', function () {
        let bs = new BitSet();
        bs.set(31);
        assert.equal(bs.msb(), 31);
    });

    it('should not be able to find first set in an empty bitset', function () {
        let bs = new BitSet();
        assert.equal(bs.msb(), Infinity);
    });

    it('should unset a bit', function () {
        let bs = new BitSet();
        bs.set(31);
        bs.clear(31);
        assert.equal(bs.get(31), 0);
    });

    it('should Hex in - Hex out', function () {

        let bs = new BitSet("0xD00000005");
        assert.equal(bs.toString(16), 'd00000005');

        bs = new BitSet("0xff900018283821283");
        assert.equal(bs.toString(16), 'ff900018283821283');

        bs = new BitSet("0x28123719b3bacf929cd9291929293818382939292");
        assert.equal(bs.toString(16), '28123719b3bacf929cd9291929293818382939292');

        bs = new BitSet("0xd1b1bd81dbabd8ab8adbabcb8cb8c1b8c18bcb81b81b81b8caaaaaaaaafffffabababababa28328832838282838282828382834868682828");
        assert.equal(bs.toString(16), 'd1b1bd81dbabd8ab8adbabcb8cb8c1b8c18bcb81b81b81b8caaaaaaaaafffffabababababa28328832838282838282828382834868682828');
    });

    it('should Get range', function () {

        let bs = new BitSet("0xff900018283821283");
        assert.equal(bs.slice(16, 32).toString(16), '8382');

        bs = new BitSet("0xff900018283821283");
        assert.equal(bs.slice(16, 40).toString(2), '1100000101000001110000010');

        bs = new BitSet("0xff900018283821283");
        assert.equal(bs.slice(130, 160).toString(8), '0');
    });

    it('should check empty', function () {

        let bs = new BitSet();

        assert.equal(bs.isEmpty(), true);

        bs = bs.set(0);

        assert.equal(bs.isEmpty(), false);

    });

    it('should flip/clear 2', function () {

        let bs = new BitSet;

        bs = bs.set(60);

        bs = bs.flip();

        bs = bs.flip(29, 35);
        assert.equal(bs.toString(), "...11110111111111111111111111111000000011111111111111111111111111111");
    });

    it('should flip/clear 3', function () {

        let bs = new BitSet();

        bs = bs.set(60, 0); // Set size

        bs = bs.flip(29, 35);

        bs = bs.flip();

        bs = bs.clear(50, 55);
        assert.equal(bs.toString(), "...111100000011111111111111000000011111111111111111111111111111");
    });

    it('should flip/clear 4', function () {

        let bs = new BitSet();
        bs
            .flip(0, 62)
            .flip(29, 35);

        assert.equal(bs.toString(), "111111111111111111111111111000000011111111111111111111111111111");

    });

    it('should eat own dogfood', function () {

        let bs = new BitSet(4);
        chai.expect(bs.toArray().toString()).to.equal(bs.toArray().toString(),"Arrays should be equal");

        bs.not();

        chai.expect(new BitSet(bs.toArray()).toString()).to.equal(bs.toString());
    });

    it('should flip range check', function () {

        let bs = new BitSet;

        assert.equal(bs.flip(-1, 0).toString(), '0');
        assert.equal(bs.flip(1, 0).toString(), '0');
    });

    it('should And', function () {

        let bs = new BitSet("0xff05");
        assert.equal(bs.and("0xfe00").toString(16), 'fe00');

    });

    it('should Or', function () {

        let bs = new BitSet(256);
        assert.equal(bs.or(512).toString(16), '300');
    });

    it('should Xor', function () {

        let bs = new BitSet("1010");
        assert.equal(bs.xor("0011").toString(2), '1001');
    });

    it('should Equals', function () {

        let bs = new BitSet('100000000000111010101');
        assert.equal(bs.equals("100000000000111010101"), true);

        bs = new BitSet('111010101');
        assert.equal(bs.equals("101010101"), false);
    });

    it('should Cardinality', function () {

        let bs = new BitSet('1000000000000000000001101');
        assert.equal(bs.cardinality(), 4);
    });

    it('should msbit', function () {

        let bs = new BitSet('1000000000000000000001101');
        assert.equal(bs.msb(), '1000000000000000000001101'.length - 1);
    });

    it('should msbit set', function () {

        let bs = new BitSet;

        bs = bs
            .set(100)
            .set(333);

        assert.equal(bs.msb(), 333);
    });

    it('should slice negated', function () {

        let bs = new BitSet(4);

        bs = bs.not();

        chai.expect(bs.toString()).to.equal("...1111011", "Slice not negated");
        chai.expect(bs.slice(1).toString()).to.equal("...111101", "Slice not negated");
        chai.expect(bs.slice(1, 3).toString()).to.equal("101", "Slice not negated");

    });

    it('should setRange 2', function () {

        let bs = new BitSet;

        bs = bs.setRange(0, 70);
        bs = bs.setRange(30, 45, 0);

        assert.equal(bs.toString(), "11111111111111111111111110000000000000000111111111111111111111111111111");
    });

    it('should setRange 3', function () {

        let bs = new BitSet;

        bs = bs.setRange(2, 12, "1111001111");

        assert.equal(bs.toString(), "1111111111100");
    });

    it('should setRange 1', function () {

        let bs = new BitSet;

        bs = bs.setRange(3, 10);

        assert.equal(bs.toString(), "11111111000");
    });

    it('should msbit should work negative numbers', function () {
        let flipped = new BitSet().not();

        assert.equal(flipped.msb(), Infinity);
    });

    it('should ntzit', function () {

        assert.equal(new BitSet('10000000000110001000000000').ntz(), 9);

        assert.equal(new BitSet('00000000000000000000000000').ntz(), Infinity);

        assert.equal(new BitSet('10000000000000000000000000').ntz(), 25);

        assert.equal(new BitSet('10000000100000000000000000000000000000000000').ntz(), 35);
    });

    it('should set', function () {

        let bs = new BitSet;

        bs
            .set(4, 1) // Set bit on 4th pos
            .set(0) // Set bit on 0th pos
            .set(22, 1)
            .set(33, 1); // Set

        assert.equal(bs.toString(), '1000000000010000000000000000010001');

        bs = bs.set(33, 0); // And reset
        assert.equal(bs.toString(), '10000000000000000010001');

        assert.equal(bs.msb(), 22);

        bs = bs.set(330, 1);

        assert.equal(bs.msb(), 330); // Thus, msb is on 330
    });

    it('should lsbit', function () {

        assert.equal(
            new BitSet('10000000000110001000000000').lsb(),
            9
        );

        assert.equal(
            new BitSet('00000000000000000000000000').lsb(),
            Infinity
        );

        assert.equal(
            new BitSet('10000000000000000000000000').lsb(),
            25
        );

        assert.equal(
            new BitSet('10000000100000000000000000000000000000000000').lsb(),
            35
        );
    });

    it('should string and', function () {

        let bsa = new BitSet();
        bsa.set(0);

        let bsb = new BitSet();
        bsb.set(32);

        bsa = bsa.and(bsb);

        chai.expect(bsa.cardinality()).to.equal(0, "Incorrect cardinality");
        chai.expect(bsb.cardinality()).to.equal(1, "Incorrect cardinality");


        for (let i = 0; i < 64; i++) {

            chai.expect(bsa.get(i)).to.equal(0, "Incorrect cardinality");
            if (i === 32) {
                chai.assert(bsb.get(i) === 1, "???")

            } else {
                chai.assert(bsb.get(i) === 0, "???")

            }
        }

        chai.expect(bsa.toString()).to.equal('0', "Incorrect cardinality");
        chai.expect(bsb.toString()).to.equal('100000000000000000000000000000000', "Incorrect cardinality");

    });

    it('should string or', function () {

        let bsa = new BitSet();
        let bsb = new BitSet();

        bsa.set(0);
        bsb.set(32);

        bsa = bsa.or(bsb);

        chai.expect(bsa.cardinality()).to.equal(2, "Incorrect cardinality");
        chai.expect(bsb.cardinality()).to.equal(1, "Incorrect cardinality");

        chai.expect(bsa.get(0)).to.equal(1, "Incorrect cardinality");
        chai.expect(bsb.get(0)).to.equal(0, "Incorrect cardinality");

        chai.expect(bsa.get(32)).to.equal(1, "Incorrect cardinality");
        chai.expect(bsb.get(32)).to.equal(1, "Incorrect cardinality");

        for (let i = 0; i < 64; i++) {

            if (i === 32 || i === 0) {
                chai.assert(bsa.get(i) === 1, "???")

            } else {
                chai.assert(bsa.get(i) === 0, "???")

            }
            if (i === 32) {
                chai.assert(bsb.get(i) === 1, "???")

            } else {
                chai.assert(bsb.get(i) === 0, "???")

            }

        }
        chai.expect(bsa.toString()).to.equal("100000000000000000000000000000001", "Incorrect cardinality");
        chai.expect(bsb.toString()).to.equal("100000000000000000000000000000000", "Incorrect cardinality");
    });

    it('should pass setting in time', function (done) {

        let bs = new BitSet;
        let start = Date.now();
        for (let i = 0; i < 1000000; i++) {
            bs.set(i);
        }
        chai.assert(Date.now() - start<50);
        done();

    });

    it('should string set', function () {

        let bs = new BitSet('1000000000010000000000000000010001');

        assert.equal(bs.toString(), '1000000000010000000000000000010001');
    });

    it('should set auto scale', function () {

        let bs = new BitSet;

        bs = bs.set(512);

        assert.equal(bs.get(511), 0);
        assert.equal(bs.get(512), 1);
        assert.equal(bs.get(513), 0);
    });

    it('should get', function () {

        let bs = new BitSet();

        bs = bs.set(4, 1); // Set bit on 4th pos
        bs = bs.set(0); // Set bit on 0th pos

        assert.equal(bs.get(4) + bs.get(0), 2);
    });

    it('should work with flipped bitset: and', function () {

        let a = new BitSet(0);
        let b = new BitSet(0);
        a = a.set(1);
        b = b.set(50);

        let output = b.and(a.not());

        // check bits are correctly set beyond length of a
        assert.equal(1, output.get(50));
        // check bits are correctly unset beyond length of a
        assert.equal(0, output.get(51));
    });

    it('should work with different length scales: and', function () {

        let a = new BitSet();
        let b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.clone().and(b).toString(), b.clone().and(a).toString());
    });

    it('should work with different length scales: or', function () {

        let a = new BitSet();
        let b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.clone().or(b).toString(), b.clone().or(a).toString());
    });

    it('should work with different length scales: xor', function () {

        let a = new BitSet();
        let b = new BitSet();
        a = a.set(1);
        b = b.set(50);

        assert.equal(a.clone().xor(b).toString(), b.clone().xor(a).toString());
    });

    it('should work with zero: xor', function () {

        let a = new BitSet();
        let b = new BitSet();
        a = a.set(1);
        a = b.set(50);

        assert.equal(a.xor(b).toString(), b.xor(a).toString());
    });

    it('should work with inverted zero', function () {

        let a = new BitSet();
        a = a.not();

        assert.equal(a.toString(), '...1111');
    });

    it('should cut off infinity', function () {

        let a = new BitSet();
        a = a.not();
        assert.equal(a.toString(), '...1111');

        a = a.and(0xff);

        assert.equal(a.toString(), '11111111');
    });

    it('should and fuzz 00', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = 0;

        assert.equal(a.and(b).toString(), '10000000111')
        assert.equal(b.and(a).toString(), '10000000111')
    });

    it('should and fuzz 01', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = -1;

        assert.equal(a.and(b).toString(), '10000000111')
        assert.equal(b.and(a).toString(), '10000000111')
    });

    it('should and fuzz 10', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = 0;

        assert.equal(a.and(b).toString(), '10100100000000000000000000010000000111')
        assert.equal(b.and(a).toString(), '10100100000000000000000000010000000111')
    });

    it('should and fuzz 11', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = -1;

        assert.equal(a.and(b).toString(), '...11110100100000000000000000000010000000111')
        assert.equal(b.and(a).toString(), '...11110100100000000000000000000010000000111')
    });

    it('should or fuzz 00', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = 0;

        assert.equal(a.or(b).toString(), '10100100010010101000110101011111111111')
        assert.equal(b.or(a).toString(), '10100100010010101000110101011111111111')
    });

    it('should or fuzz 01', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = -1;

        assert.equal(a.or(b).toString(), '...11110100100010010101000110101011111111111')
        assert.equal(b.or(a).toString(), '...11110100100010010101000110101011111111111')
    });

    it('should or fuzz 10', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = 0;

        assert.equal(a.or(b).toString(), '...11110100100010010101000110101011111111111')
        assert.equal(b.or(a).toString(), '...11110100100010010101000110101011111111111')
    });

    it('should or fuzz 11', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = -1;

        assert.equal(a.or(b).toString(), '...11110100100010010101000110101011111111111')
        assert.equal(b.or(a).toString(), '...11110100100010010101000110101011111111111')
    });

    it('should xor fuzz 00', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = 0;

        assert.equal(a.xor(b).toString(), '10100100010010101000110101001111111000')
        assert.equal(b.xor(a).toString(), '10100100010010101000110101001111111000')
    });

    it('should xor fuzz 01', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = -1;

        assert.equal(a.xor(b).toString(), '...11110100100010010101000110101001111111000')
        assert.equal(b.xor(a).toString(), '...11110100100010010101000110101001111111000')
    });

    it('should xor fuzz 10', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = 0;

        assert.equal(a.xor(b).toString(), '...111101011000010010101000110101001111111000')
        assert.equal(b.xor(a).toString(), '...111101011000010010101000110101001111111000')
    });

    it('should xor fuzz 11', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = -1;

        assert.equal(a.xor(b).toString(), '1111111111111111111111111101011000010010101000110101001111111000')
        assert.equal(b.xor(a).toString(), '1111111111111111111111111101011000010010101000110101001111111000')
    });

    it('should andNot fuzz 00', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = 0;

        assert.equal(a.andNot(b).toString(), '1100111000')
        assert.equal(b.andNot(a).toString(), '10100100010010101000110101000011000000')
    });

    it('should andNot fuzz 01', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = 0;
        b._ = -1;

        assert.equal(a.andNot(b).toString(), '1100111000')
        assert.equal(b.andNot(a).toString(), '...11110100100010010101000110101000011000000')
    });

    it('should andNot fuzz 10', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = 0;

        assert.equal(a.andNot(b).toString(), '...111101011000000000000000000000001100111000')
        assert.equal(b.andNot(a).toString(), '10010101000110101000011000000')
    });

    it('should andNot fuzz 11', function () {

        let a = new BitSet;
        let b = new BitSet;

        a.data = [0b11100111111];
        b.data = [0b10010101000110101010011000111, 0b101001];
        a._ = -1;
        b._ = -1;

        assert.equal(a.andNot(b).toString(), '1111111111111111111111111101011000000000000000000000001100111000')
        assert.equal(b.andNot(a).toString(), '10010101000110101000011000000')
    });



    it('should work with simple xor use case', function () {
        let bsa = new BitSet
        bsa.set(0);
        bsa.set(1);

        let bsb = new BitSet;
        bsb.set(32);
        bsb = bsb.set(1);
        bsa = bsa.xor(bsb);

        chai.expect(bsa.cardinality()).to.equal(2, "Incorrect cardinality");
        chai.expect(bsa.get(0)).to.equal(1, "Incorrect cardinality");
        chai.expect(bsa.get(32)).to.equal(1, "Incorrect cardinality");

        chai.expect(bsa.toArray().toString()).to.equal("0,32", "Incorrect cardinality");

    });

    it('should get large undefined offsets', function () {

        let a = new BitSet();
        a = a.not();

        assert.equal(a.get(2000), 1);

    });

    it('should work with empty checks', function () {

        let a = new BitSet();

        assert.equal(a.isEmpty(), true);

        a.set(1000);
        assert.equal(a.isEmpty(), false);
    });

    it('should work with inverting', function () {

        let x = new BitSet;
        x.set(4);
        x.set(32);
        x = x.not();
        x.set(65, 0);
        x = x.not();
        x.set(8, 1);

        assert.equal(x.cardinality(), 4);
        assert.deepEqual(x.data, [272, 1, 2, 0, 0, 0, 0, 0, 0, 0]);
        assert.deepEqual(x.toArray(), [4, 8, 32, 65]);
    });

    it('get higher bits correctly', function () {

        let a = new BitSet([34]).not();
        let b = new BitSet().set(34, 1).not();

        assert.equal(a.get(80), b.get(80));
    });

    it('should withstand some fuzz', function () {

        for (let i = 0; i < 100; i++) {

            let foo = new BitSet();
            let x = 0;

            let tmp = Math.random() * (1 << 24) | 0;
            foo = foo.or(tmp);
            x |= tmp;

            tmp = Math.random() * (1 << 24) | 0;
            foo = foo.xor(tmp);
            x ^= tmp;

            tmp = Math.random() * (1 << 24) | 0;
            foo = foo.and(tmp);
            x &= tmp;

            // x = ~x;
            //foo = foo.not();     
            assert.equal(x.toString(2), foo.toString(2));
        }
    });

    it('should work with infinity strings', function () {

        let x = new BitSet('11').not().set(35, 0);

        assert.equal(x.toString(2), '...1111011111111111111111111111111111111100');
    });

    it('should work with reported bug', function () {
        let bs1 = new BitSet("101");
        let ss = bs1.toString(); // expecting "101", actual "101" Note: bs1 = {length=1, [0]=5}
        let a = bs1.get(1);      // expecting 0, actual 0
        let b = bs1.get(2);      // expecting 1, actual 1

        let bs2 = new BitSet("111");
        ss = bs2.toString();    // expecting "111", actual "111" Note: bs2 = {length=1, [0]=7}
        assert.equal(ss, '111');

        let bs3 = bs2.clear(1);
        ss = bs3.toString();     // expecting "101", actual "1" Note: bs3 = {length=2, [0]=1,[1]=0}
        assert.equal(ss, '101');

        let c = bs3.get(1);      // expecting 0, actual 0
        assert.equal(c, 0);
        let d = bs3.get(2);      // expecting 1, actual 0
        assert.equal(d, 1);
        let t = bs3.equals(bs1); // expecting true, actual false
        assert.equal(t, true);
    });

    it('should clear', function () {
        let bs1 = new BitSet("111101");
        bs1.clear(5);
        assert.equal(bs1.toString(), '11101');
        bs1.clear();
        assert.equal(bs1.toString(), '0');
    });
});