/**
 * jscolor, JavaScript Color Picker
 *
 * @version 1.3.0
 * @license GNU Lesser General Public License, http://www.gnu.org/copyleft/lesser.html
 * @author  Honza Odvarko http://odvarko.cz
 * @created 2008-06-15
 * @updated 2009-10-16
 * @link    http://jscolor.com
 */


var jscolor = {
    callback: null,
    preventClose: false,
    dir: '', // location of jscolor directory (leave empty to autodetect)
    preloading: true, // use image preloading?
    dom: null,
    install: function () {
        jscolor.addEvent(window, 'load', jscolor.init);
        jscolor.addEvent(window, 'click', jscolor.h);


    },
    h: function (e) {

    },

    open: function (dom) {
        jscolor.dom = dom;
        var matchClass = new RegExp('(^|\\s)(' + jscolor.bindClass + ')\\s*(\\{[^}]*\\})?', 'i');
        var e = jscolor.dom; //getElementsByClassNam("backcolor");getElementsByTagName('input');
       // alert(e.colo);
        if (!e.color) {
            var prop = {};
            e.color = new jscolor.color(e, prop); //alert(af);
            //
        }
        jscolor.dom.color.showPicker();
    },

    close: function (dom) {
        if (dom && dom.color) {
            dom.color.hidePicker();
            dom.color = undefined;
            jscolor.callback = null;
            this.dom = null;

        }
    },

    init: function () {
        if (jscolor.preloading) {
            //     jscolor.preload();
        }

    },

    getDir: function () {
        if (!jscolor.dir) {
            var detected = jscolor.detectDir();
            jscolor.dir = detected !== false ? detected : 'jscolor/';
        }
        return jscolor.dir;
    },


    detectDir: function () {
        var base = location.href;

        var e = document.getElementsByTagName('base');
        for (var i = 0; i < e.length; i += 1) {
            if (e[i].href) { base = e[i].href; }
        }

        var e = document.getElementsByTagName('script');
        for (var i = 0; i < e.length; i += 1) {
            if (e[i].src && /(^|\/)jscolor\.js([?#].*)?$/i.test(e[i].src)) {
                var src = new jscolor.URI(e[i].src);
                var srcAbs = src.toAbsolute(base);
                srcAbs.path = srcAbs.path.replace(/[^\/]+$/, ''); // remove filename
                srcAbs.query = null;
                srcAbs.fragment = null;
                return srcAbs.toString();
            }
        }
        return false;
    },

    preload: function () {
        for (var fn in jscolor.imgRequire) {
            if (jscolor.imgRequire.hasOwnProperty(fn)) {
                jscolor.loadImage(fn);
            }
        }
    },


    images: {
        pad: [181, 101],
        sld: [16, 101],
        cross: [15, 15],
        arrow: [7, 11]
    },


    imgRequire: {},
    imgLoaded: {},


    requireImage: function (filename) {
        jscolor.imgRequire[filename] = true;
    },


    loadImage: function (filename) {
        if (!jscolor.imgLoaded[filename]) {
            jscolor.imgLoaded[filename] = new Image();
            jscolor.imgLoaded[filename].src = jscolor.getDir() + filename;
        }
    },

    addEvent: function (el, evnt, func) {
        if (el.addEventListener) {
            el.addEventListener(evnt, func, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + evnt, func);
        }
    },


    CancelEvent: function (el, evnt) {
        if (!el) {
            return;
        }
        if (document.createEventObject) {
            var ev = document.createEventObject();
            el.CancelEvent('on' + evnt, ev);
        } else if (document.createEvent) {
            var ev = document.createEvent('HTMLEvents');
            ev.initEvent(evnt, true, true);
            el.dispatchEvent(ev);
        } else if (el['on' + evnt]) { // alternatively use the traditional event model (IE5)
            el['on' + evnt]();
        }
    },


    getElementPos: function (e) {
        var e1 = e, e2 = e;
        var x = 0, y = 0;
        if (e1.offsetParent) {
            do {
                x += e1.offsetLeft;
                y += e1.offsetTop;
            } while (e1 = e1.offsetParent);
        }
        while ((e2 = e2.parentNode) && e2.nodeName !== 'BODY') {
            x -= e2.scrollLeft;
            y -= e2.scrollTop;
        }
        return [x, y];
    },


    getElementSize: function (e) {
        return [e.offsetWidth, e.offsetHeight];
    },


    getMousePos: function (e) {
        if (!e) { e = window.event; }
        if (typeof e.pageX === 'number') {
            return [e.pageX, e.pageY];
        } else if (typeof e.clientX === 'number') {
            return [
				e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
				e.clientY + document.body.scrollTop + document.documentElement.scrollTop
			];
        }
    },


    getViewPos: function () {
        if (typeof window.pageYOffset === 'number') {
            return [window.pageXOffset, window.pageYOffset];
        } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            return [document.body.scrollLeft, document.body.scrollTop];
        } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            return [document.documentElement.scrollLeft, document.documentElement.scrollTop];
        } else {
            return [0, 0];
        }
    },


    getViewSize: function () {
        if (typeof window.innerWidth === 'number') {
            return [window.innerWidth, window.innerHeight];
        } else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
            return [document.body.clientWidth, document.body.clientHeight];
        } else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            return [document.documentElement.clientWidth, document.documentElement.clientHeight];
        } else {
            return [0, 0];
        }
    },


    URI: function (uri) { // See RFC3986

        this.scheme = null;
        this.authority = null;
        this.path = '';
        this.query = null;
        this.fragment = null;

        this.parse = function (uri) {
            var m = uri.match(/^(([A-Za-z][0-9A-Za-z+.-]*)(:))?((\/\/)([^\/?#]*))?([^?#]*)((\?)([^#]*))?((#)(.*))?/);
            this.scheme = m[3] ? m[2] : null;
            this.authority = m[5] ? m[6] : null;
            this.path = m[7];
            this.query = m[9] ? m[10] : null;
            this.fragment = m[12] ? m[13] : null;
            return this;
        };

        this.toString = function () {
            var result = '';
            if (this.scheme !== null) { result = result + this.scheme + ':'; }
            if (this.authority !== null) { result = result + '//' + this.authority; }
            if (this.path !== null) { result = result + this.path; }
            if (this.query !== null) { result = result + '?' + this.query; }
            if (this.fragment !== null) { result = result + '#' + this.fragment; }

            return result;
        };

        this.toAbsolute = function (base) {
            var base = new jscolor.URI(base);
            var r = this;
            var t = new jscolor.URI;

            if (base.scheme === null) { return false; }

            if (r.scheme !== null && r.scheme.toLowerCase() === base.scheme.toLowerCase()) {
                r.scheme = null;
            }

            if (r.scheme !== null) {
                t.scheme = r.scheme;
                t.authority = r.authority;
                t.path = removeDotSegments(r.path);
                t.query = r.query;
            } else {
                if (r.authority !== null) {
                    t.authority = r.authority;
                    t.path = removeDotSegments(r.path);
                    t.query = r.query;
                } else {
                    if (r.path === '') { // TODO: == or === ?
                        t.path = base.path;
                        if (r.query !== null) {
                            t.query = r.query;
                        } else {
                            t.query = base.query;
                        }
                    } else {
                        if (r.path.substr(0, 1) === '/') {
                            t.path = removeDotSegments(r.path);
                        } else {
                            if (base.authority !== null && base.path === '') { // TODO: == or === ?
                                t.path = '/' + r.path;
                            } else {
                                t.path = base.path.replace(/[^\/]+$/, '') + r.path;
                            }
                            t.path = removeDotSegments(t.path);
                        }
                        t.query = r.query;
                    }
                    t.authority = base.authority;
                }
                t.scheme = base.scheme;
            }
            t.fragment = r.fragment;

            return t;
        };

        function removeDotSegments(path) {
            var out = '';
            while (path) {
                if (path.substr(0, 3) === '../' || path.substr(0, 2) === './') {
                    path = path.replace(/^\.+/, '').substr(1);
                } else if (path.substr(0, 3) === '/./' || path === '/.') {
                    path = '/' + path.substr(3);
                } else if (path.substr(0, 4) === '/../' || path === '/..') {
                    path = '/' + path.substr(4);
                    out = out.replace(/\/?[^\/]*$/, '');
                } else if (path === '.' || path === '..') {
                    path = '';
                } else {
                    var rm = path.match(/^\/?[^\/]*/)[0];
                    path = path.substr(rm.length);
                    out = out + rm;
                }
            }
            return out;
        }

        if (uri) {
            this.parse(uri);
        }

    },


    /*
    * Usage example:
    * var myColor = new jscolor.color(myInputElement)
    */

    color: function (target, prop) {



        this.required = true; // refuse empty values?
        this.adjust = true; // adjust value to uniform notation?
        this.hash = true; // prefix color with # symbol?
        this.caps = true; // uppercase?
        this.valueElement = null; // value holder
        this.styleElement = null; // where to reflect current color
        this.hsv = [0, 0, 1]; // read-only  0-6, 0-1, 0-1
        this.rgb = [1, 1, 1]; // read-only  0-1, 0-1, 0-1

        this.color = "";

        this.pickerMode = 'HSV'; // HSV | HVS
        this.pickerPosition = 'bottom'; // left | right | top | bottom
        this.pickerFace = 10; // px
        this.pickerFaceColor = 'ThreeDFace'; // CSS color
        this.pickerBorder = 1; // px
        this.pickerBorderColor = 'ThreeDHighlight ThreeDShadow ThreeDShadow ThreeDHighlight'; // CSS color
        this.pickerInset = 1; // px
        this.pickerInsetColor = 'ThreeDShadow ThreeDHighlight ThreeDHighlight ThreeDShadow'; // CSS color
        this.pickerZIndex = 10000;

        var self = this;
        var modeID = this.pickerMode.toLowerCase() === 'hvs' ? 1 : 0;

        var posPad,
			posSld;

        //
        //绑定 target事件
        //
        jscolor.addEvent(target, 'focus', function () {
            //  self.showPicker();
        });

        function isPickerOwner() {
            return jscolor.picker && jscolor.picker.owner === self;
        }

        this.hidePicker = function () {
            if (isPickerOwner()) {
                removePicker();
            }
        };
        //显示拾取器
        this.showPicker = function () {
            if (!isPickerOwner()) {
                var tp = jscolor.getElementPos(target); // target pos
                var ts = jscolor.getElementSize(target); // target size
                var vp = jscolor.getViewPos(); // view pos
                var vs = jscolor.getViewSize(); // view size
                var ps = [ // picker size
					2 * this.pickerBorder + 4 * this.pickerInset + 2 * this.pickerFace + jscolor.images.pad[0] + 2 * jscolor.images.arrow[0] + jscolor.images.sld[0],
					2 * this.pickerBorder + 2 * this.pickerInset + 2 * this.pickerFace + jscolor.images.pad[1]
				];
                var a, b, c;
                switch (this.pickerPosition.toLowerCase()) {
                    case 'left': a = 1; b = 0; c = -1; break;
                    case 'right': a = 1; b = 0; c = 1; break;
                    case 'top': a = 0; b = 1; c = -1; break;
                    default: a = 0; b = 1; c = 1; break;
                }
                var l = (ts[b] + ps[b]) / 2;
                var pp = [ // picker pos
					-vp[a] + tp[a] + ps[a] > vs[a] ?
						(-vp[a] + tp[a] + ts[a] / 2 > vs[a] / 2 && tp[a] + ts[a] - ps[a] >= 0 ? tp[a] + ts[a] - ps[a] : tp[a]) :
						tp[a],
					-vp[b] + tp[b] + ts[b] + ps[b] - l + l * c > vs[b] ?
						(-vp[b] + tp[b] + ts[b] / 2 > vs[b] / 2 && tp[b] + ts[b] - l - l * c >= 0 ? tp[b] + ts[b] - l - l * c : tp[b] + ts[b] - l + l * c) :
						(tp[b] + ts[b] - l + l * c >= 0 ? tp[b] + ts[b] - l + l * c : tp[b] + ts[b] - l - l * c)
				];
                drawPicker(pp[a], pp[b]);
            }
        };


        function removePicker() {
            delete jscolor.picker.owner;
            // alert(document.getElementsByTagName('body')[0].innerHTML)
            document.getElementsByTagName('body')[0].removeChild(jscolor.picker.boxB);
        }



        this.SetColor = function () {
            if (this.fromString("#FFFFFF")) {
                if (isPickerOwner()) {
                    redrawPad();
                }
                if (isPickerOwner()) {
                    redrawSld();
                }
            }
        };

        //
        //导出颜色
        //
        //
        this.GetColor = function (flags) {
            if (true) {
                var value = this.toString();
                if (this.caps) { value = value.toUpperCase(); }
                if (this.hash) { value = '#' + value; }
                this.color = value;
                //  alert(value + "  DFGDFGFDGF");
                if (jscolor.callback) jscolor.callback.apply(null, [value]);
            }

            //单击颜色面板或滑条后  将指着移到这个位置
            if (isPickerOwner()) {
                redrawPad();
            }
            if (isPickerOwner()) {
                redrawSld();
            }

        };


        this.fromHSV = function (h, s, v) { // null = don't change
            h < 0 && (h = 0) || h > 6 && (h = 6);
            s < 0 && (s = 0) || s > 1 && (s = 1);
            v < 0 && (v = 0) || v > 1 && (v = 1);

            this.rgb = HsvToRgb(
				h === null ? this.hsv[0] : (this.hsv[0] = h),
				s === null ? this.hsv[1] : (this.hsv[1] = s),
				v === null ? this.hsv[2] : (this.hsv[2] = v)
			);


        };


        this.fromRGB = function (r, g, b) { // null = don't change
            r < 0 && (r = 0) || r > 1 && (r = 1);
            g < 0 && (g = 0) || g > 1 && (g = 1);
            b < 0 && (b = 0) || b > 1 && (b = 1);
            var hsv = RgbToHsv(
				r === null ? this.rgb[0] : (this.rgb[0] = r),
				g === null ? this.rgb[1] : (this.rgb[1] = g),
				b === null ? this.rgb[2] : (this.rgb[2] = b)
			);
            if (hsv[0] !== null) {
                this.hsv[0] = hsv[0];
            }
            if (hsv[2] !== 0) {
                this.hsv[1] = hsv[1];
            }
            this.hsv[2] = hsv[2];

        };


        this.fromString = function (hex) {
            var m = hex.match(/^\W*([0-9A-F]{3}([0-9A-F]{3})?)\W*$/i);
            if (!m) {
                return false;
            } else {
                alert("A");
                if (m[1].length === 6) { // 6-char notation
                    this.fromRGB(
						parseInt(m[1].substr(0, 2), 16) / 255,
						parseInt(m[1].substr(2, 2), 16) / 255,
						parseInt(m[1].substr(4, 2), 16) / 255

					);
                } else { // 3-char notation
                    this.fromRGB(
						parseInt(m[1].charAt(0) + m[1].charAt(0), 16) / 255,
						parseInt(m[1].charAt(1) + m[1].charAt(1), 16) / 255,
						parseInt(m[1].charAt(2) + m[1].charAt(2), 16) / 255

					);
                }
                return true;
            }
        };

        //将rgb格式颜色换成 这种样式#FFFFFF
        this.toString = function () {
            return (
				(0x100 | Math.round(255 * this.rgb[0])).toString(16).substr(1) +
				(0x100 | Math.round(255 * this.rgb[1])).toString(16).substr(1) +
				(0x100 | Math.round(255 * this.rgb[2])).toString(16).substr(1)
			);
        };


        //将rgb转换成hsv
        function RgbToHsv(r, g, b) {
            var n = Math.min(Math.min(r, g), b);
            var v = Math.max(Math.max(r, g), b);
            var m = v - n;
            if (m === 0) { return [null, 0, v]; }
            var h = r === n ? 3 + (b - g) / m : (g === n ? 5 + (r - b) / m : 1 + (g - r) / m);
            return [h === 6 ? 0 : h, m / v, v];
        }



        // 将hsv转换成rgb
        function HsvToRgb(h, s, v) {
            if (h === null) { return [v, v, v]; }
            var i = Math.floor(h);
            var f = i % 2 ? h - i : 1 - (h - i);
            var m = v * (1 - s);
            var n = v * (1 - s * f);
            switch (i) {
                case 6:
                case 0: return [v, n, m];
                case 1: return [n, v, m];
                case 2: return [m, v, n];
                case 3: return [m, n, v];
                case 4: return [n, m, v];
                case 5: return [v, m, n];
            }
        }


        //
        //绘制面板函数
        //


        function setPad(e) {
            var posM = jscolor.getMousePos(e);
            var x = posM[0] - posPad[0];
            var y = posM[1] - posPad[1];
            switch (modeID) {
                case 0: self.fromHSV(x * (6 / (jscolor.images.pad[0] - 1)), 1 - y / (jscolor.images.pad[1] - 1), null); break;
                case 1: self.fromHSV(x * (6 / (jscolor.images.pad[0] - 1)), null, 1 - y / (jscolor.images.pad[1] - 1)); break;
            }

        }


        function setSld(e) {
            var posM = jscolor.getMousePos(e);
            var y = posM[1] - posPad[1];
            switch (modeID) {
                case 0: self.fromHSV(null, null, 1 - y / (jscolor.images.sld[1] - 1)); break;
                case 1: self.fromHSV(null, 1 - y / (jscolor.images.sld[1] - 1), null); break;
            }
        }

        //
        //重画面板函数
        //


        function redrawSld() {
            // redraw the slider pointer
            switch (modeID) {
                case 0: var yComponent = 2; break;
                case 1: var yComponent = 1; break;
            }
            var y = Math.round((1 - self.hsv[yComponent]) * (jscolor.images.sld[1] - 1));
            jscolor.picker.sldM.style.backgroundPosition =
				'0 ' + (self.pickerFace + self.pickerInset + y - Math.floor(jscolor.images.arrow[1] / 2)) + 'px';
        }


        function redrawPad() {
            // redraw the pad pointer
            switch (modeID) {
                case 0: var yComponent = 1; break;
                case 1: var yComponent = 2; break;
            }
            var x = Math.round((self.hsv[0] / 6) * (jscolor.images.pad[0] - 1));
            var y = Math.round((1 - self.hsv[yComponent]) * (jscolor.images.pad[1] - 1));
            jscolor.picker.padM.style.backgroundPosition =
				(self.pickerFace + self.pickerInset + x - Math.floor(jscolor.images.cross[0] / 2)) + 'px ' +
				(self.pickerFace + self.pickerInset + y - Math.floor(jscolor.images.cross[1] / 2)) + 'px';

            // redraw the slider image
            var seg = jscolor.picker.sld.childNodes;

            switch (modeID) {
                case 0:
                    var rgb = HsvToRgb(self.hsv[0], self.hsv[1], 1);
                    for (var i = 0; i < seg.length; i += 1) {
                        seg[i].style.backgroundColor = 'rgb(' +
							(rgb[0] * (1 - i / seg.length) * 100) + '%,' +
							(rgb[1] * (1 - i / seg.length) * 100) + '%,' +
							(rgb[2] * (1 - i / seg.length) * 100) + '%)';
                    }
                    break;
                case 1:
                    var rgb, s, c = [self.hsv[2], 0, 0];
                    var i = Math.floor(self.hsv[0]);
                    var f = i % 2 ? self.hsv[0] - i : 1 - (self.hsv[0] - i);
                    switch (i) {
                        case 6:
                        case 0: rgb = [0, 1, 2]; break;
                        case 1: rgb = [1, 0, 2]; break;
                        case 2: rgb = [2, 0, 1]; break;
                        case 3: rgb = [2, 1, 0]; break;
                        case 4: rgb = [1, 2, 0]; break;
                        case 5: rgb = [0, 2, 1]; break;
                    }
                    for (var i = 0; i < seg.length; i += 1) {
                        s = 1 - 1 / (seg.length - 1) * i;
                        c[1] = c[0] * (1 - s * f);
                        c[2] = c[0] * (1 - s);
                        seg[i].style.backgroundColor = 'rgb(' +
							(c[rgb[0]] * 100) + '%,' +
							(c[rgb[1]] * 100) + '%,' +
							(c[rgb[2]] * 100) + '%)';
                    }
                    break;
            }
        }

        function drawPicker(x, y) {
            if (!jscolor.picker) {
                jscolor.picker = {
                    box: document.createElement('div'),
                    boxB: document.createElement('div'),
                    pad: document.createElement('div'),
                    padB: document.createElement('div'),
                    padM: document.createElement('div'),
                    sld: document.createElement('div'),
                    sldB: document.createElement('div'),
                    sldM: document.createElement('div')
                };
                for (var i = 0, segSize = 4; i < jscolor.images.sld[1]; i += segSize) {
                    var seg = document.createElement('div');
                    seg.style.height = segSize + 'px';
                    seg.style.fontSize = '1px';
                    seg.style.lineHeight = '0';
                    jscolor.picker.sld.appendChild(seg);
                }
                jscolor.picker.sldB.appendChild(jscolor.picker.sld);
                jscolor.picker.box.appendChild(jscolor.picker.sldB);
                jscolor.picker.box.appendChild(jscolor.picker.sldM);
                jscolor.picker.padB.appendChild(jscolor.picker.pad);
                jscolor.picker.box.appendChild(jscolor.picker.padB);
                jscolor.picker.box.appendChild(jscolor.picker.padM);
                jscolor.picker.boxB.appendChild(jscolor.picker.box);
            }

            var p = jscolor.picker;
            p.boxB.setAttribute("id", "jscolor");
            p.boxB.onclick = function () {

                jscolor.preventClose = true;
            }
            p.boxB.ondblclick = function () {

                jscolor.preventClose = true;
            }
            // recompute controls positions
            posPad = [
				x + self.pickerBorder + self.pickerFace + self.pickerInset,
				y + self.pickerBorder + self.pickerFace + self.pickerInset];
            posSld = [
				null,
				y + self.pickerBorder + self.pickerFace + self.pickerInset];

            // controls interaction
            //        p.box.onmouseup =
            //		p.box.onmouseout = function () { target.focus(); };
            //       p.box.onmousedown = function () { abortBlur = true; };

            //    p.box.onmousemove = function (e) { holdPad && setPad(e); holdSld && setSld(e); };


            //单击颜色面板时
            p.padM.onmousedown = function (e) { setPad(e); self.GetColor(); };


            //单击滑动条时
            p.sldM.onmousedown = function (e) { setSld(e); self.GetColor(); };

            // picker
            p.box.style.width = 4 * self.pickerInset + 2 * self.pickerFace + jscolor.images.pad[0] + 2 * jscolor.images.arrow[0] + jscolor.images.sld[0] + 'px';
            p.box.style.height = 2 * self.pickerInset + 2 * self.pickerFace + jscolor.images.pad[1] + 'px';

            // picker border
            p.boxB.style.position = 'absolute';
            p.boxB.style.clear = 'both';
            p.boxB.style.left = x + 'px';
            p.boxB.style.top = y + 'px';
            p.boxB.style.zIndex = self.pickerZIndex;
            p.boxB.style.border = self.pickerBorder + 'px solid';
            p.boxB.style.borderColor = self.pickerBorderColor;
            p.boxB.style.background = self.pickerFaceColor;

            // pad image
            p.pad.style.width = jscolor.images.pad[0] + 'px';
            p.pad.style.height = jscolor.images.pad[1] + 'px';

            // pad border
            p.padB.style.position = 'absolute';
            p.padB.style.left = self.pickerFace + 'px';
            p.padB.style.top = self.pickerFace + 'px';
            p.padB.style.border = self.pickerInset + 'px solid';
            p.padB.style.borderColor = self.pickerInsetColor;

            // pad mouse area
            p.padM.style.position = 'absolute';
            p.padM.style.left = '0';
            p.padM.style.top = '0';
            p.padM.style.width = self.pickerFace + 2 * self.pickerInset + jscolor.images.pad[0] + jscolor.images.arrow[0] + 'px';
            p.padM.style.height = p.box.style.height;
            p.padM.style.cursor = 'crosshair';

            // slider image
            p.sld.style.overflow = 'hidden';
            p.sld.style.width = jscolor.images.sld[0] + 'px';
            p.sld.style.height = jscolor.images.sld[1] + 'px';

            // slider border
            p.sldB.style.position = 'absolute';
            p.sldB.style.right = self.pickerFace + 'px';
            p.sldB.style.top = self.pickerFace + 'px';
            p.sldB.style.border = self.pickerInset + 'px solid';
            p.sldB.style.borderColor = self.pickerInsetColor;

            // slider mouse area
            p.sldM.style.position = 'absolute';
            p.sldM.style.right = '0';
            p.sldM.style.top = '0';
            p.sldM.style.width = jscolor.images.sld[0] + jscolor.images.arrow[0] + self.pickerFace + 2 * self.pickerInset + 'px';
            p.sldM.style.height = p.box.style.height;
            try {
                p.sldM.style.cursor = 'pointer';
            } catch (eOldIE) {
                p.sldM.style.cursor = 'hand';
            }

            // load images in optimal order
            switch (modeID) {
                case 0: var padImg = 'hs.png'; break;
                case 1: var padImg = 'hv.png'; break;
            }
            p.padM.style.background = "url('" + jscolor.getDir() + "cross.gif') no-repeat";
            p.sldM.style.background = "url('" + jscolor.getDir() + "arrow.gif') no-repeat";
            p.pad.style.background = "url('" + jscolor.getDir() + padImg + "') 0 0 no-repeat";

            // place pointers
            redrawPad();
            redrawSld();

            jscolor.picker.owner = self;
            document.getElementsByTagName('body')[0].appendChild(p.boxB);
        }

    }

};

jscolor.install();
