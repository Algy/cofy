/*global COFY,document */
var TESTS = (function () {
    'use strict';
    return {
        read: {

            constants: function () {
                this.isSame(COFY.read('0').head, 0);
                this.isSame(COFY.read('"hello"').head, 'hello');
                this.isSame(COFY.read('"he\\\\\\"llo"').head, 'he\\"llo');
                this.isSame(COFY.read('hello').head.name, 'hello');
                this.isSame(COFY.read('a/b').head.parts[0], 'a');
                this.isSame(COFY.read('a/b').head.parts[1], 'b');
                this.isSame(COFY.read('a/b/c').head.name, 'a/b/c');
                this.isSame(COFY.read('a/b/c').head.parts[2], 'c');
                this.isSame(COFY.read('a/1').head.name, 'a/1');
                this.isSame(COFY.read('a/1').head.parts[1], 1);
                this.isSame(COFY.read('/').head.name, '/');
                this.isSame(COFY.read('/a').head.name, '/a');
                this.isSame(COFY.read('a/').head.name, 'a/');
                this.isSame(COFY.read('a//b').head.name, 'a//b');
            },

            lists: function () {
                this.isSame(COFY.read('()').head, null);
                this.isSame(COFY.read("'()").head.head.name, 'quote');
                this.isSame(COFY.read("'()").head.tail.head, null);
                this.isSame(COFY.read("'()").head.tail.tail, null);
                this.isSame(COFY.read('(1)').head.head, 1);
                this.isSame(COFY.read('(1)').head.tail, null);
                this.isSame(COFY.read('((1) 2)').head.head.head, 1);
                this.isSame(COFY.read('((1) 2)').head.tail.head, 2);
                this.isSame(COFY.read('((1) 2)').head.tail.tail, null);
                this.isSame(COFY.read('(1 : 2)').head.head, 1);
                this.isSame(COFY.read('(1 : 2)').head.tail, 2);
                this.isSame(COFY.read('(1 2 : 3)').head.tail.head, 2);
                this.isSame(COFY.read('(1 2 : 3)').head.tail.tail, 3);
            },

            multiple: function () {
                this.isSame(COFY.read('0 1').head, 0);
                this.isSame(COFY.read('0 1').tail.head, 1);
                this.isSame(COFY.read('0 1').tail.tail, null);
            },

            comments: function () {
                this.isSame(COFY.read('0 ; c').head, 0);
                this.isSame(COFY.read('0 ; c').tail, null);
                this.isSame(COFY.read(';c c\r\n1').head, 1);
                this.isSame(COFY.read(';c c\r\n1').tail, null);
                this.isSame(COFY.read('0\r\n;;c c \r\n2').head, 0);
                this.isSame(COFY.read('0\r\n;;c c \r\n2').tail.head, 2);
                this.isSame(COFY.read('0\r\n;;c c \r\n2').tail.tail, null);
            }
        },

        eval: {

            constants: function () {
                this.isSame(COFY.read_eval('0'), 0);
                this.isSame(COFY.read_eval('"hello"'), 'hello');
                this.isSame(COFY.read_eval("'hello").name, 'hello');
                this.isSame(COFY.read_eval("'hello/world").parts[0], 'hello');
                this.isSame(COFY.read_eval("'hello/world").parts[1], 'world');
                this.isNull(COFY.read_eval('()'));
                this.isNull(COFY.read_eval("'()"));
                this.isSame(COFY.read_eval("'(1)").head, 1);
                this.isNull(COFY.read_eval("'(1)").tail);
                this.isSame(COFY.read_eval("'((1))").head.head, 1);
                this.isSame(COFY.read_eval('0 1'), 1);
                this.isTrue(COFY.read_eval('true'));
                this.isFalse(COFY.read_eval('false'));
                this.isUndefined(COFY.read_eval('nil'));
                this.isTrue(COFY.read_eval('(nan? nan)'));
                this.isFalse(COFY.read_eval('(nan? 0)'));
                this.isFalse(COFY.read_eval('(nan? nil)'));
                this.isSame(COFY.read_eval("'hello"), COFY.read_eval("'hello"));
                this.isTrue(COFY.read_eval("(= (list 1 2 3) '(1 2 3))"));
            },

            identity: function () {
                this.isTrue(COFY.read_eval('(identical? 0 0)'));
                this.isFalse(COFY.read_eval('(identical? 0 1)'));
                this.isTrue(COFY.read_eval('(identical? "a" "a")'));
                this.isFalse(COFY.read_eval('(identical? "a" "b")'));
                this.isTrue(COFY.read_eval('(identical? "a" \'"a")'));
                this.isTrue(COFY.read_eval("(identical? 'a 'a)"));
                this.isFalse(COFY.read_eval("(identical? 'a 'b)"));
                this.isTrue(COFY.read_eval("(identical? 'a/b 'a/b)"));
                this.isTrue(COFY.read_eval("(identical? () '())"));
                this.isFalse(COFY.read_eval("(identical? ())"));
                this.isTrue(COFY.read_eval("(identical? nil)"));
                this.isFalse(COFY.read_eval("(identical? nan nan)"));
            },

            equality: function () {
                this.isTrue(COFY.read_eval('(= 0 0)'));
                this.isFalse(COFY.read_eval('(= 0 1)'));
                this.isTrue(COFY.read_eval('(= "a" "a")'));
                this.isTrue(COFY.read_eval('(= "a" \'"a")'));
                this.isFalse(COFY.read_eval('(= "a" "b")'));
                this.isTrue(COFY.read_eval("(= 'a 'a)"));
                this.isFalse(COFY.read_eval("(= 'a 'b)"));
                this.isTrue(COFY.read_eval("(= 'a/b 'a/b)"));
                this.isTrue(COFY.read_eval("(= () '())"));
                this.isTrue(COFY.read_eval("(= '(()) '(()))"));
                this.isFalse(COFY.read_eval("(= '(0 a) '(0 b))"));
                this.isTrue(COFY.read_eval("(= '(0 (a)) '(0 (a)))"));
                this.isTrue(COFY.read_eval("(= '(0 (a)) (take 2 (list 0 (take 1 '(a b)) 1)))"));
            },

            math: function () {
                this.isSame(COFY.read_eval('(+)'), 0);
                this.isSame(COFY.read_eval('(+ 1 2 3 4)'), 10);
                this.isSame(COFY.read_eval('(- 1 2)'), -1);
                this.isSame(COFY.read_eval('(*)'), 1);
                this.isSame(COFY.read_eval('(* 1 2 3 4)'), 24);
                this.isSame(COFY.read_eval('(/ 6 3)'), 2);
                this.isSame(COFY.read_eval('(/ 5 2)'), 2.5);
                this.isSame(COFY.read_eval('pi'), Math.PI);
                this.isSame(COFY.read_eval('e'), Math.E);
                this.isSame(COFY.read_eval('(abs 1)'), 1);
                this.isSame(COFY.read_eval('(abs -1)'), 1);
                this.isSame(COFY.read_eval('(min 2 1 3)'), 1);
                this.isSame(COFY.read_eval('(max 2 1 3)'), 3);
                this.isTrue(COFY.read_eval('random') !== Math.random);
                this.isSame(COFY.read_eval('(round 1.6)'), 2);
                this.isSame(COFY.read_eval('(floor 1.6)'), 1);
                this.isSame(COFY.read_eval('(ceil 1.4)'), 2);
                this.isTrue(COFY.read_eval('(< 1 2 3)'));
                this.isTrue(COFY.read_eval('(< 1)'));
                this.isTrue(COFY.read_eval('(<)'));
                this.isFalse(COFY.read_eval('(< 1 2 2)'));
                this.isFalse(COFY.read_eval('(< 1 2 1)'));
                this.isTrue(COFY.read_eval('(<= 1)'));
                this.isTrue(COFY.read_eval('(<=)'));
                this.isTrue(COFY.read_eval('(<= 1 2 3)'));
                this.isTrue(COFY.read_eval('(<= 1 2 2)'));
                this.isFalse(COFY.read_eval('(<= 1 2 1)'));
                this.isTrue(COFY.read_eval('(> 3 2 1)'));
                this.isTrue(COFY.read_eval('(> 1)'));
                this.isTrue(COFY.read_eval('(>)'));
                this.isFalse(COFY.read_eval('(> 2 2 1)'));
                this.isFalse(COFY.read_eval('(> 1 2 1)'));
                this.isTrue(COFY.read_eval('(>= 1)'));
                this.isTrue(COFY.read_eval('(>=)'));
                this.isTrue(COFY.read_eval('(>= 3 2 1)'));
                this.isTrue(COFY.read_eval('(>= 2 2 1)'));
                this.isFalse(COFY.read_eval('(>= 1 2 1)'));
            },

            math_security: function () {
                COFY.read_eval('(set! sin "call" 0)');
                this.isFalse(Math.sin.call === 0);
            },

            definitions: function () {
                var cofy = COFY.create();
                this.isUndefined(cofy.read_eval('(def a 1)'));
                this.isSame(cofy.read_eval('(def aa 1 ab 2) (+ aa ab)'), 3);
                this.throwsError(function () { cofy.read_eval('(def a 2)'); });
                this.throwsError(function () { cofy.read_eval('((fn (a) (def a 2) a) a)'); });
                this.throwsError(function () { cofy.read_eval('((fn () (def a 2 a 3) a))'); });
                this.isSame(COFY.read_eval('(def a 2) a'), 2);
                this.isSame(cofy.read_eval('((fn (a) a) a)'), 1);
                this.isSame(cofy.read_eval('((fn () (def a 2) a))'), 2);
                this.isSame(cofy.read_eval('(((fn () (def a 3) (fn () a))))'), 3);
                this.isSame(cofy.read_eval('((fn () (def a 1 b 2) (+ a b)))'), 3);
                this.isSame(cofy.read_eval('a'), 1);
                this.isSame(cofy.read_eval('(def (af x) (+ x 10)) (af 1)'), 11);
            },

            special_forms: function () {
                this.throwsError(function () { COFY.read_eval('(def if 1) if'); });
                this.isSame(COFY.read_eval('((fn () (def if 1) if))'), 1);
            },

            args: function () {
                this.isUndefined(COFY.read_eval('((fn (arg) arg))'));
                this.isSame(COFY.read_eval('((fn (arg) arg) 1)'), 1);
                this.isSame(COFY.read_eval('((fn (arg) arg) 1 2)'), 1);
                this.isUndefined(COFY.read_eval('(((fn (arg) (fn (arg) arg)) 1))'));
                this.isSame(COFY.read_eval('(((fn (arg) (fn (arg) arg))) 1)'), 1);
                this.isUndefined(COFY.read_eval('((fn (arg) ((fn (arg) arg))) 1)'));
            },

            varargs: function () {
                this.isNull(COFY.read_eval('((fn arglist arglist))'));
                this.isTrue(COFY.read_eval("(= ((fn arglist arglist) 1) '(1))"));
                this.isTrue(COFY.read_eval("(= ((fn arglist arglist) 1 2) '(1 2))"));
                this.isSame(COFY.read_eval('((fn (arg : rest) arg) 1)'), 1);
                this.isNull(COFY.read_eval('((fn (arg : rest) rest) 1)'));
                this.isSame(COFY.read_eval('((fn (arg1 arg2 : rest) arg1) 1)'), 1);
                this.isUndefined(COFY.read_eval('((fn (arg1 arg2 : rest) arg2) 1)'));
                this.isNull(COFY.read_eval('((fn (arg1 arg2 : rest) rest) 1)'));
                this.isTrue(COFY.read_eval("(= ((fn (arg : rest) rest) 1 2 3) '(2 3))"));
            },

            mutability: function () {
                this.isFalse(COFY.read_eval('(= (var 1) (var 1))'));
                this.isFalse(COFY.read_eval('(= (cons (var 1) 2) (cons (var 1) 2))'));
                this.isSame(COFY.read_eval('(deref (var 1))'), 1);
                this.isSame(COFY.read_eval('(swap! (var 1) 2)'), 1);
                this.isUndefined(COFY.read_eval('(set! (var 1) 2)'));
                this.isTrue(COFY.read_eval("(= ((fn (a) (def b (swap! a 2)) (cons (deref a) b)) (var 1)) '(2 : 1))"));
                this.isSame(COFY.read_eval("((fn (a) (set! a 2) (deref a)) (var 1))"), 2);
            },

            apply: function () {
                this.isTrue(COFY.read_eval("(= (apply (fn (arg : rest) rest) '(1 2 3)) '(2 3))"));
                this.isTrue(COFY.read_eval("(= (apply (fn args args) '(1 2 3)) '(1 2 3))"));
                this.isTrue(COFY.read_eval("(= (apply (fn args args) '(1 2 : 3)) '(1 2))"));
                this.isNull(COFY.read_eval('(apply (fn args args) ())'));
                this.isNull(COFY.read_eval('(apply (fn args args))'));
                this.throwsError(function () { COFY.read_eval('(apply)'); });
            },

            streams: {

                filter: function () {
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) true) ()) ())"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) false) ()) ())"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) true) '(1 2 3)) '(1 2 3))"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) false) '(1 2 3)) ())"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) ()) '(1 2 3)) ())"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) nil) '(1 2 3)) ())"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) (> a 1)) '(1 2 0 3)) '(2 3))"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) true) '(1 : 2)) '(1 : 2))"));
                    this.isSame(COFY.read_eval("(filter (fn (a) (> a 1)) '(1 : 2))"), 2);
                    this.isSame(COFY.read_eval("(filter (fn (a) (> a 1)) 2)"), 2);
                    this.isNull(COFY.read_eval("(filter (fn (a) (> a 1)) 1)"));
                    this.isTrue(COFY.read_eval("(= (filter (fn (a) (> a 1)) '(2 : 1)) '(2))"));
                    this.isTrue(COFY.read_eval("(= (take 3 (filter (fn (x) (= 0 (remainder x 3))) (iterate inc 1))) '(3 6 9))"));
                },

                map: function () {
                    this.isNull(COFY.read_eval("(map (fn (a) 1) ())"));
                    this.isTrue(COFY.read_eval("(= (map (fn (a) a) '(1 2 3)) '(1 2 3))"));
                    this.isTrue(COFY.read_eval("(= (map (fn (a) (+ a 10)) '(1 2 3)) '(11 12 13))"));
                    this.isTrue(COFY.read_eval("(= (map (fn (a) (+ a 10)) '(1 2 : 3)) '(11 12 : 13))"));
                    this.isSame(COFY.read_eval("(map (fn (a) (+ a 10)) 1)"), 11);
                    this.isTrue(COFY.read_eval("(lazy? (map (fn (a) (+ a 10)) '(1 2 3)))"));
                    this.isFalse(COFY.read_eval("(realized? (map (fn (a) (+ a 10)) '(1 2 3)))"));
                    this.isTrue(COFY.read_eval("(lazy? (map (fn (a) (+ a 10)) (iterate inc 1)))"));
                    this.isFalse(COFY.read_eval("(realized? (map (fn (a) (+ a 10)) (iterate inc 1)))"));
                    this.isTrue(COFY.read_eval("(= (take 4 (map (fn (a) (+ a 10)) (iterate inc 1))) '(11 12 13 14))"));
                },

                map_multiple_args: function () {
                    this.isSame(COFY.read_eval("(map (fn () 1))"), 1);
                    this.isTrue(COFY.read_eval("(= (map (fn (a b) (+ a b)) '(1 2 3) '(5 6 7)) '(6 8 10))"));
                    this.isTrue(COFY.read_eval("(= (map + '(1 2 3) '(5 6)) '(6 8))"));
                    this.isTrue(COFY.read_eval("(= (map + '(1 2 : 3) '(5 6)) '(6 8))"));
                    this.isTrue(COFY.read_eval("(= (map + '(1 2 : 3) '(5 6 : 7)) '(6 8 : 10))"));
                    this.isTrue(COFY.read_eval("(= (map list 1 2 3) '(1 2 3))"));
                    this.isTrue(COFY.read_eval("(= (map list 1 '(2) '((3))) '(1 (2) ((3))))"));
                    this.isTrue(COFY.read_eval("(= (take 6 (map + (iterate inc 1) (repeat 0 10))) '(1 12 3 14 5 16))"));
                },

                reduce: function () {
                    this.isUndefined(COFY.read_eval("(reduce (fn x 10))"));
                    this.isSame(COFY.read_eval("(reduce (fn x 10) 5)"), 5);
                    this.isSame(COFY.read_eval("(reduce (fn x 10) 5 ())"), 5);
                    this.isSame(COFY.read_eval("(reduce + 10 '(1))"), 11);
                    this.isSame(COFY.read_eval("(reduce + 10 1)"), 11);
                    this.isSame(COFY.read_eval("(reduce + 10 '(1 2))"), 13);
                    this.isSame(COFY.read_eval("(reduce + 10 '(1 : 2))"), 13);
                    this.isSame(COFY.read_eval("(reduce + 1 (take 4 (iterate inc 1)))"), 11);
                },

                zip: function () {
                    this.isNull(COFY.read_eval("(zip)"));
                    this.isNull(COFY.read_eval("(zip ())"));
                    this.isTrue(COFY.read_eval("(= (zip 1) '(1))"));
                    this.isTrue(COFY.read_eval("(= (zip '(1)) '(1))"));
                    this.isTrue(COFY.read_eval("(= (zip '(1 : 2)) '(1 2))"));
                    this.isTrue(COFY.read_eval("(= (zip '(1 2)) '(1 2))"));
                    this.isTrue(COFY.read_eval("(= (zip '(1 5 : 8) '(2 6) '(3 : 7) 4) '(1 2 3 4 5 6 7 8))"));
                    this.isTrue(COFY.read_eval("(= (take 5 (zip (iterate inc 1) (iterate inc 10))) '(1 10 2 11 3))"));
                    this.isTrue(COFY.read_eval("(= (take 6 (zip (iterate inc 1) '(10 11))) '(1 10 2 11 3 4))"));
                    this.isTrue(COFY.read_eval("(= (take 6 (zip (iterate inc 1) '(10 : 11))) '(1 10 2 11 3 4))"));
                },

                lazy: function () {
                    var val = 0, cofy;
                    cofy = COFY.create({ 'do-stuff': function () { val += 1; return val; }});
                    cofy.read_eval('(def (cons-fn) (cons (do-stuff) (lazy cons-fn)))');
                    cofy.read_eval('(def stream (lazy cons-fn))');
                    this.isSame(val, 0);
                    this.isSame(cofy.read_eval('(head stream)'), 1);
                    this.isSame(cofy.read_eval('(head stream)'), 1);
                    this.isSame(val, 1);
                    this.isTrue(cofy.read_eval('(lazy? (tail stream))'));
                    this.isSame(cofy.read_eval('(head stream)'), 1);
                    this.isSame(val, 1);
                    this.isSame(cofy.read_eval('(head (tail stream))'), 2);
                    this.isSame(val, 2);
                    this.isSame(cofy.read_eval('(head stream)'), 1);
                    this.isTrue(cofy.read_eval('(realized? stream)'));
                    this.isTrue(cofy.read_eval('(realized? (tail stream))'));
                    this.isFalse(cofy.read_eval('(realized? (tail (tail stream)))'));
                    this.isFalse(cofy.read_eval('(empty? (tail (tail stream)))'));
                    this.isTrue(cofy.read_eval('(realized? (tail (tail stream)))'));
                    this.isTrue(cofy.read_eval('(empty? (lazy (fn () ())))'));
                    this.isFalse(cofy.read_eval('(empty? (lazy (fn () 0)))'));
                    this.isFalse(cofy.read_eval("(empty? (lazy (fn () '(0))))"));
                    this.isTrue(cofy.read_eval("(empty? (tail (lazy (fn () '(0)))))"));
                },

                repeat: function () {
                    this.isTrue(COFY.read_eval('(lazy? (repeat 1))'));
                    this.isFalse(COFY.read_eval('(realized? (repeat 1))'));
                    this.isSame(COFY.read_eval('(head (repeat 1))'), 1);
                    this.isSame(COFY.read_eval('(head (tail (repeat 1)))'), 1);
                    this.isSame(COFY.read_eval('(head (repeat 1 2))'), 1);
                    this.isFalse(COFY.read_eval('(lazy? (tail (repeat 1 2)))'));
                    this.isSame(COFY.read_eval('(head (tail (repeat 1 2)))'), 2);
                    this.isTrue(COFY.read_eval('(lazy? (tail (tail (repeat 1 2))))'));
                    this.isSame(COFY.read_eval('(head (tail (tail (repeat 1 2))))'), 1);
                },

                iterate: function () {
                    this.isTrue(COFY.read_eval('(stream? (iterate inc 1))'));
                    this.isTrue(COFY.read_eval('(lazy? (tail (iterate inc 1)))'));
                    this.isFalse(COFY.read_eval('(realized? (tail (iterate inc 1)))'));
                    this.isSame(COFY.read_eval('(head (iterate inc 1))'), 1);
                    this.isSame(COFY.read_eval('(head (tail (iterate inc 1)))'), 2);
                    this.isSame(COFY.read_eval('(head (tail (tail (iterate inc 1))))'), 3);
                },

                take: function () {
                    this.isTrue(COFY.read_eval('(lazy? (take 3 (iterate inc 1)))'));
                    this.isFalse(COFY.read_eval('(realized? (take 3 (iterate inc 1)))'));
                    this.isSame(COFY.read_eval('(head (tail (tail (take 3 (iterate inc 1)))))'), 3);
                    this.isTrue(COFY.read_eval('(empty? (tail (tail (tail (take 3 (iterate inc 1))))))'));
                    this.isTrue(COFY.read_eval("(lazy? (take 3 '(1 2 3 4 5)))"));
                    this.isTrue(COFY.read_eval("(= (take 3 '(1 2 3 4 5)) '(1 2 3))"));
                },

                skip: function () {
                    this.isTrue(COFY.read_eval('(lazy? (skip 3 (iterate inc 1)))'));
                    this.isFalse(COFY.read_eval('(realized? (skip 3 (iterate inc 1)))'));
                    this.isSame(COFY.read_eval('(head (skip 3 (iterate inc 1)))'), 4);
                    this.isSame(COFY.read_eval('(head (tail (skip 3 (iterate inc 1))))'), 5);
                    this.isTrue(COFY.read_eval('(lazy? (tail (skip 3 (iterate inc 1))))'));
                    this.isFalse(COFY.read_eval('(realized? (tail (skip 3 (iterate inc 1))))'));
                    this.isTrue(COFY.read_eval('(empty? (skip (/ 1 0) (iterate inc 1)))'));
                    this.isTrue(COFY.read_eval('(empty? (skip nil (iterate inc 1)))'));
                    this.isTrue(COFY.read_eval("(lazy? (skip 3 '(1 2 3 4 5)))"));
                    this.isTrue(COFY.read_eval("(= (skip 3 '(1 2 3 4 5)) '(4 5))"));
                }
            },

            interop: {

                functions: function () {
                    this.isSame(COFY.read_eval('(fn (a b) (+ a b))')(1, 2), 3);
                    this.isSame(COFY.read_eval('(fn (a) (fn (b) (+ a b)))')(1)(2), 3);
                    this.isSame(COFY.read_eval('(fn (f) (f 1 2))')(function (a, b) { return a + b; }), 3);
                    this.isSame(COFY.read_eval('(fn (f a b) (f a b))')(function (a, b) { return a + b; }, 1, 2), 3);
                    this.isSame(COFY.read_eval('(fn (f) (fn (a b) (f a b)))')(function (a, b) { return a + b; })(1, 2), 3);
                },

                objects: function () {
                    this.isSame(COFY.read_eval('(fn (o) ((. o \'f) (. o "a")))')({ f: function (a) { return a + 1; }, a: 1 }), 2);
                    this.isSame(COFY.read_eval("(fn (o) ((. o \'f) (. o 'a)))")({ f: function (a) { return a + 1; }, a: 1 }), 2);
                    this.isSame(COFY.read_eval('(fn (o) o/a/b)')({ a: { b: 1 } }), 1);
                    this.isSame(COFY.read_eval('(fn (o) (o/f o/a))')({ f: function (a) { return a + 1; }, a: 1 }), 2);
                },

                arrays: function () {
                    this.isSame(COFY.read_eval('(fn (a) ((. a 0) (. a 1)))')([function (a) { return a + 1; }, 1]), 2);
                    this.isSame(COFY.read_eval('(fn (o) o/1/b)')([ 0, { b: 1 } ]), 1);
                    this.isSame(COFY.read_eval('(fn (a) (a/0 a/1))')([function (a) { return a + 1; }, 1]), 2);
                },

                capabilities_path_access: function () {
                    this.isSame(COFY.create({ o: { a: { b: 1 } }, c: [2, 'x'] }).read_eval('(+ o/a/b c/0)'), 3);
                },

                object_modification: function () {
                    var obj1 = { field: 1 }, obj2 = COFY.read_eval("(fn (a) (set! a 'field 2) a)")(obj1);
                    this.isSame(obj1, obj2);
                    this.isSame(obj1.field, 2);
                },

                array_modification: function () {
                    var arr1 = [0, 1], arr2 = COFY.read_eval('(fn (a) (set! a 1 2) a)')(arr1);
                    this.isSame(arr1, arr2);
                    this.isSame(arr1[1], 2);
                },

                dom_access: function () {
                    var cofy = COFY.create({ document: document });
                    this.isSame(cofy.read_eval('(. (.call document "getElementById" "test-text") "innerHTML")'), 'Test text');
                    cofy.read_eval('(set! (.call document "getElementById" "test-text") "innerHTML" "aaa")');
                    this.isSame(cofy.read_eval('(. (.call document "getElementById" "test-text") "innerHTML")'), 'aaa');
                    cofy.read_eval('(set! (.call document "getElementById" "test-text") "innerHTML" "Test text")');
                    this.isSame(cofy.read_eval('(. (.apply document "getElementById" \'("test-text")) "innerHTML")'), 'Test text');
                },

                dom_access_compact: function () {
                    var cofy = COFY.create({ document: document });
                    this.isSame(cofy.read_eval('(. (document/getElementById "test-text") \'innerHTML)'), 'Test text');
                    cofy.read_eval('(set! (document/getElementById "test-text") \'innerHTML "aaa")');
                    this.isSame(cofy.read_eval('(. (document/getElementById "test-text") \'innerHTML)'), 'aaa');
                    cofy.read_eval('(set! (document/getElementById "test-text") \'innerHTML "Test text")');
                    this.isSame(cofy.read_eval('(. (.call document document/getElementById "test-text") \'innerHTML)'), 'Test text');
                    this.isSame(cofy.read_eval('(. (.apply document document/getElementById \'("test-text")) \'innerHTML)'), 'Test text');
                }
            },

            modules: {

                import_symbol: function () {
                    var cofy = COFY.create({ lib: { add1: function (a) { return a + 1; } } });
                    this.throwsError(function () { cofy.read_eval('(add1 1)'); });
                    this.isSame(cofy.read_eval('(lib/add1 1)'), 2);
                    cofy.read_eval('(use lib)');
                    this.isSame(cofy.read_eval('(add1 1)'), 2);
                },

                import_expr: function () {
                    var cofy = COFY.create({ lib: { sublib: { add1: function (a) { return a + 1; } } } });
                    this.isSame(cofy.read_eval('(lib/sublib/add1 1)'), 2);
                    cofy.read_eval('(def aaa lib/sublib)');
                    this.isSame(cofy.read_eval('(aaa/add1 1)'), 2);
                    cofy.read_eval('(use aaa)');
                    this.isSame(cofy.read_eval('(add1 1)'), 2);
                },

                import_collision: function () {
                    var cofy = COFY.create({ lib: { add1: function (a) { return a + 1; } } });
                    this.isSame(cofy.read_eval('(lib/add1 1)'), 2);
                    cofy.read_eval('(def add1 (fn (x) (+ 1 x)))');
                    this.throwsError(function () { cofy.read_eval('(use lib)'); });
                }
            },

            macros: function () {
                var cofy = COFY.create();
            }
        },

        print: {

            constants: function () {
                this.isSame(COFY.read_eval_print('0'), '0');
                this.isSame(COFY.read_eval_print('"hello"'), '"hello"');
                this.isSame(COFY.read_eval_print('"hel\r\\n\\"\\\\lo"'), '"hel\\r\\n\\"\\\\lo"');
                this.isSame(COFY.read_eval_print("'hello"), 'hello');
                this.isSame(COFY.read_eval_print("'hello/world"), 'hello/world');
                this.isSame(COFY.read_eval_print('()'), '()');
                this.isSame(COFY.read_eval_print("'()"), '()');
            },

            jsconstants: function () {
                this.isSame(COFY.read_eval_print('true'), 'true');
                this.isSame(COFY.read_eval_print('false'), 'false');
                this.isSame(COFY.read_eval_print('nil'), 'undefined');
            },

            lists: function () {
                this.isSame(COFY.read_eval_print("'(1)"), '(1)');
                this.isSame(COFY.read_eval_print("'(1 2)"), '(1 2)');
                this.isSame(COFY.read_eval_print("'((1))"), '((1))');
                this.isSame(COFY.read_eval_print('(cons 1 2)'), '(1 : 2)');
                this.isSame(COFY.read_eval_print("'(1 : 2)"), '(1 : 2)');
                this.isSame(COFY.read_eval_print('(cons 0 (cons 1 2))'), '(0 1 : 2)');
                this.isSame(COFY.read_eval_print("'(0 : (1 : 2))"), '(0 1 : 2)');
                this.isSame(COFY.read_eval_print("'((1 : 2) : 3)"), '((1 : 2) : 3)');
                this.isSame(COFY.read_eval_print("'(0 : (1 : ()))"), '(0 1)');
                this.isSame(COFY.read_eval_print("'(0 1 : ())"), '(0 1)');
            }
        }
    };
}());
