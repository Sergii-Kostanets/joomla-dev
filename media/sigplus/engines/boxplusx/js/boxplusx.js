/**
* boxplusx: a versatile lightweight pop-up window engine
* @author  Levente Hunyadi
* @version 1.0
* @remarks Copyright (C) 2009-2021 Levente Hunyadi
* @remarks Licensed under GNU/GPLv3, see https://www.gnu.org/licenses/gpl-3.0.html
* @see     https://hunyadi.info.hu/projects/boxplusx
**/

// NOTE: This file has been generated from a TypeScript source

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

// UNUSED EXPORTS: BoxPlusXDialog

;// CONCATENATED MODULE: ./src/urls.ts
/**
* Parses a query string into name/value pairs.
* @param querystring A string of "name=value" pairs, separated by "&".
* @return An object where keys are parameter names, and values are parameter values.
*/
function fromQueryString(querystring) {
	let parameters = {};
	if (querystring.length > 1) {
		querystring.substr(1).split('&').forEach((keyvalue) => {
			let index = keyvalue.indexOf('=');
			let key = index >= 0 ? keyvalue.substr(0, index) : keyvalue;
			let value = index >= 0 ? keyvalue.substr(index + 1) : '';
			parameters[decodeURIComponent(key)] = decodeURIComponent(value);
		});
	}
	return parameters;
}
/**
* Parses a URL string into URL components.
* @param url A URL string.
* @return URL components.
*/
function parseURL(url) {
	let parser = document.createElement("a");
	parser.href = url;
	const hashBangIndex = parser.hash.indexOf('!');
	return {
		protocol: parser.protocol,
		host: parser.host,
		hostname: parser.hostname,
		port: parser.port,
		pathname: parser.pathname,
		search: parser.search,
		queryparams: fromQueryString(parser.search),
		hash: parser.hash,
		id: parser.hash.substr(1, (hashBangIndex >= 0 ? hashBangIndex : parser.hash.length) - 1),
		/**
		* Fragment parameters. Recognizes any of the following syntax:
		* #key1=value1&key2=value2
		* #id!key1=value1&key2=value2
		*/
		fragmentparams: fromQueryString(parser.hash.substr(Math.max(0, hashBangIndex)))
	};
}
/**
* Determines whether navigating to a URL would entail only a hash change.
* @param url A URL string.
* @return True if changing the location would trigger only an onhashchange event.
*/
function isHashChange(url) {
	let actual = parseURL(url);
	let expected = parseURL(location.href); // parse location URL for compatibility with Internet Explorer
	return actual.protocol === expected.protocol
		&& actual.host === expected.host
		&& actual.pathname === expected.pathname // compare path
		&& actual.search === expected.search; // compare query string
}
/**
* Builds a query string from an object.
* @param parameters An object where keys are parameter names, and values are parameter values.
* @return A URL query string.
*/
function buildQuery(parameters) {
	return Object.keys(parameters).map((key) => {
		return encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key] || '');
	}).join('&');
}

;// CONCATENATED MODULE: ./src/htmldom.ts
/**
* Determines whether an element is either of the listed HTML element types.
* @param elem The HTML element to test.
* @param types The tag names to test against.
*/
function isElementOfType(elem, types) {
	return types.indexOf(elem.tagName.toLowerCase()) >= 0;
}
function isFormControl(elem) {
	return isElementOfType(elem, ['input', 'select', 'textarea']);
}

;// CONCATENATED MODULE: ./src/draggable.ts

/** Allows viewing obscured parts of a scrollable element by making drag gestures with the mouse. */
class Draggable {
	/**
	* @param interceptor The element that intercepts drag events.
	* @param scrollable The element that scrolls in response to mouse movement.
	*/
	constructor(interceptor, scrollable) {
		this.dragged = false;
		this.lastClientX = 0;
		this.lastClientY = 0;
		this.scrollable = scrollable;
		interceptor.addEventListener('mousedown', ev => this.dragStart(ev));
		interceptor.addEventListener('mouseup', ev => this.dragEnd(ev));
		interceptor.addEventListener('mouseout', ev => this.dragEnd(ev));
		interceptor.addEventListener('mousemove', ev => this.dragMove(ev));
	}
	dragStart(event) {
		if (isFormControl(event.target)) {
			return;
		}
		let style = window.getComputedStyle(this.scrollable);
		let canScroll = Draggable.scrollablePropertyValues.indexOf(style['overflowX']) >= 0 || Draggable.scrollablePropertyValues.indexOf(style['overflowY']) >= 0;
		if (canScroll) {
			let mouseEvent = event;
			this.lastClientX = mouseEvent.clientX;
			this.lastClientY = mouseEvent.clientY;
			this.dragged = true;
			mouseEvent.preventDefault();
		}
	}
	dragEnd(_) {
		this.dragged = false;
	}
	dragMove(event) {
		if (this.dragged) {
			let mouseEvent = event;
			this.scrollable.scrollLeft -= mouseEvent.clientX - this.lastClientX;
			this.scrollable.scrollTop -= mouseEvent.clientY - this.lastClientY;
			this.lastClientX = mouseEvent.clientX;
			this.lastClientY = mouseEvent.clientY;
		}
	}
}
Draggable.scrollablePropertyValues = ['auto', 'scroll'];

;// CONCATENATED MODULE: ./src/orientation.ts
class RationalNumber extends Number {
	constructor(numerator, denominator) {
		super(numerator / denominator);
		this.numerator = numerator;
		this.denominator = denominator;
	}
	toString() {
		return `${this.numerator}/${this.denominator}`;
	}
}
function isRationalLike(value) {
	return value !== undefined && value.numerator !== undefined && value.denominator !== undefined;
}
/**
* Orientation constants.
* Position names represent how row #0 and column #0 are oriented, e.g. TopLeft is the upright orientation.
* Positive numeric constants are aligned with values in EXIF standard.
*/
var ImageOrientation;
(function (ImageOrientation) {
	ImageOrientation[ImageOrientation["WrongImageType"] = -2] = "WrongImageType";
	ImageOrientation[ImageOrientation["NoInformation"] = -1] = "NoInformation";
	ImageOrientation[ImageOrientation["Unknown"] = 0] = "Unknown";
	ImageOrientation[ImageOrientation["TopLeft"] = 1] = "TopLeft";
	ImageOrientation[ImageOrientation["TopRight"] = 2] = "TopRight";
	ImageOrientation[ImageOrientation["BottomRight"] = 3] = "BottomRight";
	ImageOrientation[ImageOrientation["BottomLeft"] = 4] = "BottomLeft";
	ImageOrientation[ImageOrientation["LeftTop"] = 5] = "LeftTop";
	ImageOrientation[ImageOrientation["RightTop"] = 6] = "RightTop";
	ImageOrientation[ImageOrientation["RightBottom"] = 7] = "RightBottom";
	ImageOrientation[ImageOrientation["LeftBottom"] = 8] = "LeftBottom";
})(ImageOrientation || (ImageOrientation = {}));
/**
* Retrieves image EXIF orientation of the camera relative to the scene.
* @param url The image URL.
* @param callback Invoked passing the EXIF orientation.
*/
function getImageOrientationFromURL(url) {
	if (!/\.jpe?g$/i.test(url)) {
		return Promise.resolve(ImageOrientation.WrongImageType); // wrong image format, no EXIF data present in image formats GIF or PNG
	}
	else {
		return new Promise((resolve) => {
			let xhr = new XMLHttpRequest();
			xhr.open('get', url);
			xhr.responseType = 'blob';
			xhr.onload = () => {
				resolve(getImageOrientationFromBlob(xhr.response));
			};
			xhr.onerror = () => {
				resolve(ImageOrientation.NoInformation);
			};
			xhr.send();
		});
	}
}
/**
* Retrieves image EXIF orientation of the camera relative to the scene.
* @param blob The image data as a binary large object.
* @param callback Invoked passing the EXIF orientation.
*/
function getImageOrientationFromBlob(blob) {
	return new Promise((resolve) => {
		let reader = new FileReader();
		reader.onload = () => {
			let view = new DataView(reader.result);
			if (view.getUint16(0) != 0xFFD8) {
				return resolve(ImageOrientation.WrongImageType); // wrong image format, not a JPEG image
			}
			let length = view.byteLength;
			let offset = 2;
			while (offset < length) {
				let marker = view.getUint16(offset);
				offset += 2;
				if (marker == 0xFFE1) { // application marker APP1
					// EXIF header
					if (view.getUint32(offset += 2) != 0x45786966) { // corresponds to string "Exif"
						return resolve(ImageOrientation.NoInformation); // EXIF data absent
					}
					// TIFF header
					let little = view.getUint16(offset += 6) == 0x4949; // check if "Intel" (little-endian) byte alignment is used
					offset += view.getUint32(offset + 4, little); // last four bytes are offset to Image file directory (IFD)
					// IFD (Image file directory)
					let tags = view.getUint16(offset, little);
					offset += 2;
					for (let i = 0; i < tags; i++) {
						if (view.getUint16(offset + (i * 12), little) == 0x0112) { // corresponds to IFD0 (main image) Orientation
							let orientation = view.getUint16(offset + (i * 12) + 8, little);
							return resolve(orientation);
						}
					}
				}
				else if ((marker & 0xFF00) != 0xFF00) { // not an application marker
					break;
				}
				else {
					offset += view.getUint16(offset);
				}
			}
			return resolve(ImageOrientation.NoInformation); // application marker APP1 not found
		};
		reader.readAsArrayBuffer(blob);
	});
}
/**
* Retrieves EXIF image orientation and other metadata.
* @param image The image from which to extract information.
* @param extractMetadata Whether to attempt obtaining metadata other than image orientation.
* @return Promise fulfilled with EXIF orientation and metadata.
*/
function getImageMetadata(image, extractMetadata = false) {
	return new Promise((resolve) => {
		let url = image.src;
		if (/^file:/.test(url)) {
			return resolve({
				orientation: ImageOrientation.NoInformation
			}); // cross-origin requests are only supported for protocol schemes such as 'http' and 'https'
		}
		let EXIF = window.EXIF;
		if (extractMetadata && !!EXIF) {
			// use third-party plugin Exif.js to extract orientation and metadata, see <https://github.com/exif-js/exif-js>
			EXIF.getData(image, () => {
				let img = image;
				let orientation = ImageOrientation.Unknown;
				let metadata = {};
				let m = Object.assign({}, img.iptcdata, img.exifdata);
				if (Object.keys(m).length > 0) {
					Object.keys(m).forEach((key) => {
						let value = m[key];
						if (key == 'thumbnail' && value !== undefined) {
							let blob = value['blob'];
							if (blob !== undefined) {
								let image = document.createElement('img');
								image.src = URL.createObjectURL(blob);
								m[key] = image;
							}
						}
						else if (isRationalLike(value)) {
							m[key] = new RationalNumber(value.numerator, value.denominator);
						}
					});
					metadata = m;
					let o = m['Orientation'];
					if (o) {
						orientation = (+o); // coerce to enumeration value (number constant)
					}
				}
				resolve({ orientation, metadata });
			});
		}
		else {
			// use simple built-in method to extract orientation
			getImageOrientationFromURL(url).then((orientation) => {
				resolve({ orientation });
			});
		}
	});
}

;// CONCATENATED MODULE: ./src/timer.ts
class TimerController {
	constructor(eventFn, duration) {
		/** True if a slideshow is currently active. */
		this.active = false;
		this.eventFn = eventFn;
		this.duration = duration;
	}
	/** Gets if the timer is active. */
	get enabled() {
		return this.active;
	}
	/** Sets if the timer is active. */
	set enabled(value) {
		this.active = value;
	}
	/** The slideshow will trigger the timer event (when the duration expires) if it is in active state. */
	resume() {
		if (this.active) {
			this.startTimer();
		}
	}
	/** The slideshow will no longer trigger the timer event but remains in active state. */
	suspend() {
		this.stopTimer();
	}
	/** The slideshow is set in active state and will trigger the timer event (when the duration expires). */
	start() {
		this.active = true;
		this.startTimer();
	}
	/** The slideshow is set in inactive state and will no longer trigger the timer event. */
	stop() {
		this.active = false;
		this.stopTimer();
	}
	/** Restarts the slideshow timer. */
	startTimer() {
		this.stopTimer();
		if (this.duration > 0) {
			this.timer = window.setTimeout(this.eventFn, this.duration);
		}
	}
	/** Stops the slideshow timer. */
	stopTimer() {
		if (this.timer) {
			window.clearTimeout(this.timer);
			this.timer = undefined;
		}
	}
}

;// CONCATENATED MODULE: ./src/touch.ts
class touch_TimerController {
	constructor(elem, actions) {
		this.touchStartX = 0;
		this.lastTouch = 0;
		this.actions = actions;
		elem.addEventListener('touchstart', (touchEvent) => {
			this.touchStartX = touchEvent.changedTouches[0].pageX;
			if (this.actions.start) {
				this.actions.start();
			}
		});
		elem.addEventListener('touchend', (touchEvent) => {
			let now = new Date().getTime();
			let delta = now - this.lastTouch;
			if (delta > 0 && delta < 500) { // double tap (two successive taps one shortly after the other)
				touchEvent.preventDefault();
			}
			else { // single tap
				let x = touchEvent.changedTouches[0].pageX;
				if (x - this.touchStartX >= 50) { // swipe to the right
					this.actions.right();
				}
				else if (this.touchStartX - x >= 50) { // swipe to the left
					this.actions.left();
				}
			}
			this.lastTouch = now;
		});
	}
}

;// CONCATENATED MODULE: ./src/trail.ts
/** Converts an integer in the range [0, 255] into a hexadecimal representation. */
function dec2hex(dec) {
	return ('0' + dec.toString(16)).slice(-2);
}
/** Generates a hexadecimal string representing n bytes of random data. */
function generateUID(len) {
	const arr = new Uint8Array(len);
	window.crypto.getRandomValues(arr);
	return Array.from(arr, dec2hex).join('');
}
class Trail {
	constructor(navigateFn) {
		// manage history (browser back and forward buttons)
		this.eventFn = (event) => {
			let item = undefined;
			if (this.isHistoryState(event.state)) {
				item = event.state.item;
			}
			navigateFn(item);
		};
	}
	/**
	* Gets the currently shown item.
	* @return The item currently displayed.
	*/
	get current() {
		const state = history.state;
		return state.item;
	}
	/**
	* Pushes an item on top of the history stack.
	* @param item The item to be currently displayed.
	*/
	push(item) {
		if (this.isHistoryState(history.state)) {
			if (item != this.current) {
				this.pushHistoryState(item);
			}
		}
		else {
			this.uid = generateUID(16);
			this.addEventListener();
			this.pushHistoryState(item);
		}
	}
	/** Removes the managed history stack. */
	clear() {
		this.removeEventListener();
		this.unroll();
	}
	/** Discards all history items injected by this instance. */
	unroll() {
		if (this.isHistoryState(history.state)) {
			history.go(-1);
			window.setTimeout(() => {
				this.unroll();
			}, 0);
		}
		else {
			this.uid = undefined;
			// inject artificial state to clear any subsequent state entries
			history.pushState(null, '');
			// make sure the artificial state is discarded when we manipulate the history again
			history.go(-1);
		}
	}
	isHistoryState(historyState) {
		const state = historyState;
		if (state) {
			return state.uid == this.uid;
		}
		else {
			return false;
		}
	}
	pushHistoryState(item) {
		const state = {
			uid: this.uid,
			item: item,
		};
		history.pushState(state, '');
	}
	addEventListener() {
		window.addEventListener('popstate', this.eventFn);
	}
	removeEventListener() {
		window.removeEventListener('popstate', this.eventFn);
	}
}

;// CONCATENATED MODULE: ./src/index.ts
/**
* boxplusx: a versatile lightweight pop-up window engine
* @author  Levente Hunyadi
* @version 1.0
* @remarks Copyright (C) 2009-2021 Levente Hunyadi
* @remarks Licensed under GNU/GPLv3, see https://www.gnu.org/licenses/gpl-3.0.html
* @see     https://hunyadi.info.hu/projects/boxplusx
**/
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
	var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BoxPlusXDialog_1;







/** Position of control with respect to the viewport area. */
var BoxPlusXPosition;
(function (BoxPlusXPosition) {
	BoxPlusXPosition["Hidden"] = "hidden";
	BoxPlusXPosition["Above"] = "above";
	BoxPlusXPosition["Top"] = "top";
	BoxPlusXPosition["Bottom"] = "bottom";
	BoxPlusXPosition["Below"] = "below";
})(BoxPlusXPosition || (BoxPlusXPosition = {}));
/** Text writing system. */
var BoxPlusXWritingSystem;
(function (BoxPlusXWritingSystem) {
	BoxPlusXWritingSystem["LeftToRight"] = "ltr";
	BoxPlusXWritingSystem["RightToLeft"] = "rtl";
})(BoxPlusXWritingSystem || (BoxPlusXWritingSystem = {}));
const BoxPlusXOptionsDefaults = {
	id: undefined,
	slideshow: 0,
	autostart: false,
	loop: false,
	preferredWidth: 800,
	preferredHeight: 600,
	useDevicePixelRatio: true,
	navigation: BoxPlusXPosition.Bottom,
	controls: BoxPlusXPosition.Below,
	captions: BoxPlusXPosition.Below,
	contextmenu: true,
	metadata: false,
	dir: BoxPlusXWritingSystem.LeftToRight,
	history: false
};
/** @ExportDecoratedItems */
function sealed(_) {
}
/** Content type shown in the pop-up window. */
var BoxPlusXContentType;
(function (BoxPlusXContentType) {
	BoxPlusXContentType[BoxPlusXContentType["None"] = 0] = "None";
	BoxPlusXContentType[BoxPlusXContentType["Unavailable"] = 1] = "Unavailable";
	BoxPlusXContentType[BoxPlusXContentType["Image"] = 2] = "Image";
	BoxPlusXContentType[BoxPlusXContentType["Video"] = 3] = "Video";
	BoxPlusXContentType[BoxPlusXContentType["EmbeddedContent"] = 4] = "EmbeddedContent";
	BoxPlusXContentType[BoxPlusXContentType["DocumentFragment"] = 5] = "DocumentFragment";
	BoxPlusXContentType[BoxPlusXContentType["Frame"] = 6] = "Frame";
})(BoxPlusXContentType || (BoxPlusXContentType = {}));
/** Determine how content behaves when the container is resized. */
var BoxPlusXDimensionBehavior;
(function (BoxPlusXDimensionBehavior) {
	/** The item does not permit resizing (e.g. HTML <object> element with fixed width and height). */
	BoxPlusXDimensionBehavior[BoxPlusXDimensionBehavior["FixedSize"] = 0] = "FixedSize";
	/** The item has fixed aspect ratio (e.g. HTML <video> element). */
	BoxPlusXDimensionBehavior[BoxPlusXDimensionBehavior["FixedAspectRatio"] = 1] = "FixedAspectRatio";
	/** The item width and height can be set independently. */
	BoxPlusXDimensionBehavior[BoxPlusXDimensionBehavior["Resizable"] = 2] = "Resizable";
	/** The item has an intrinsic width and height but either of these may be set to a smaller value when there is insufficient space. */
	BoxPlusXDimensionBehavior[BoxPlusXDimensionBehavior["ResizableBestFit"] = 3] = "ResizableBestFit";
})(BoxPlusXDimensionBehavior || (BoxPlusXDimensionBehavior = {}));
function* matchAll(str, regExp) {
	let match;
	while (match = regExp.exec(str)) {
		yield match;
	}
	return undefined;
}
function parseOptionalInteger(str, def) {
	return parseInt(str !== null && str !== void 0 ? str : '', 10) || def;
}
function parseOptionalBoolean(str) {
	return str === 'true' || !!parseInt(str !== null && str !== void 0 ? str : '', 10);
}
/**
* Checks if a location identifies an image.
* @param path A path or the path component of a URL.
* @return True if the path is likely to identify an image.
*/
function isImageFile(path) {
	return /\.(gif|jpe?g|png|svg|webp)$/i.test(path);
}
/**
* Sets all undefined properties on an object using a reference object.
*/
function applyDefaults(obj, ref) {
	let extended = obj || {};
	for (const prop in JSON.parse(JSON.stringify(ref))) { // use JSON functions to clone object
		if (!Object.prototype.hasOwnProperty.call(extended, prop)) {
			extended[prop] = ref[prop];
		}
	}
	return extended;
}
/**
* Removes all children of an HTML element.
* @param elem The HTML element whose children to remove.
*/
function removeChildNodes(elem) {
	while (elem.hasChildNodes()) {
		elem.removeChild(elem.lastChild);
	}
}
/**
* Toggles a CSS class on an element.
* @param elem The HTML element to add the class to or remove the class from.
* @param cls The CSS class name.
* @param state If true, the class is added; if false, removed.
*/
function toggleClass(elem, cls, state) {
	elem.classList.toggle(cls, state);
}
/**
* Sets the visibility of an HTML element.
* @param elem The HTML element to inspect.
* @param True if the object is to be made visible.
*/
function setVisible(elem, state) {
	toggleClass(elem, 'boxplusx-hidden', !state);
}
/**
* Determines the visibility of an HTML element.
* @param elem The HTML element to inspect.
* @return True if the object is visible.
*/
function isVisible(elem) {
	return !elem.classList.contains('boxplusx-hidden');
}
/**
* Creates a HTML <div> element, acting as a building block for the dialog.
* @param name The class name the element gets.
* @param hidden Whether the element is initially hidden.
* @param children Any children the element should have.
* @return The newly created element, ready for injection into the DOM.
*/
function createElement(name, hidden, children) {
	let elem = document.createElement('div');
	elem.classList.add('boxplusx-' + name);
	setVisible(elem, !hidden);
	if (children) {
		elem.append(...children);
	}
	return elem;
}
/** Creates several HTML <div> elements, acting as building blocks for the dialog. */
function createElements(names) {
	return names.map((name) => {
		return createElement(name);
	});
}
/**
* Returns the title and description text for a content item.
* @param elem The HTML element whose textual description to extract.
*/
function getItemText(elem) {
	let title = '';
	let description = '';
	if (elem instanceof HTMLAnchorElement) {
		const dataset = elem.dataset;
		const dataTitle = dataset['title'];
		if (dataTitle !== undefined) {
			title = dataTitle;
		}
		else {
			// an HTML anchor element that nests an HTML image element with an "alt" attribute
			const image = elem.querySelector('img');
			if (image !== null) {
				const alternateText = image.getAttribute('alt');
				if (alternateText !== null) {
					title = alternateText;
				}
			}
		}
		const dataSummary = dataset['summary'];
		if (dataSummary !== undefined) {
			description = dataSummary;
		}
		else {
			// an HTML anchor element with a "title" attribute
			const titleAttrText = elem.getAttribute('title');
			if (titleAttrText !== null) {
				description = titleAttrText;
			}
		}
		if (title === description) {
			description = '';
		}
	}
	return { title, description };
}
/** Generates item properties from an HTML element collection. */
function elementsToProperties(elems) {
	return elems.map((elem) => {
		let { title, description } = getItemText(elem);
		let url = '';
		let poster;
		let srcset;
		if (elem instanceof HTMLAnchorElement) {
			url = elem.href;
			let dataset = elem.dataset;
			poster = dataset['poster'];
			srcset = dataset['srcset'];
		}
		// extract the HTML data attribute "download", which tells the engine where to look for the high-resolution
		// original, should the visitor choose to save a copy of the image to their computer
		let download = elem.dataset['download'];
		let image;
		let images = elem.getElementsByTagName('img');
		if (images.length > 0) {
			image = images[0];
		}
		return {
			url,
			image,
			poster,
			srcset,
			title,
			description,
			download,
		};
	});
}
/**
* The boxplusx lightbox pop-up window instance.
* Though typically used as a singleton, the interface permits instantiating multiple instances.
*/
let BoxPlusXDialog = BoxPlusXDialog_1 = class BoxPlusXDialog {
	/** Initializes the layout and behavior of the pop-up dialog. */
	constructor(options) {
		/** Information about elements, part of the same group, to be displayed in the pop-up window. */
		this.members = [];
		/** Index of current item shown. */
		this.current = 0;
		/** Aspect behavior for the item currently displayed. */
		this.aspect = BoxPlusXDimensionBehavior.FixedAspectRatio;
		/** Content type currently shown in the pop-up window. */
		this.contentType = BoxPlusXContentType.None;
		/** Whether content size is reduced to fit available viewport area. */
		this.shrinkToFit = true;
		/** Whether content size is allowed to grow to take all available viewport area. */
		this.expandToFit = false;
		this.options = applyDefaults(options, BoxPlusXOptionsDefaults);
		// builds the boxplusx pop-up window HTML structure, as if by injecting the following into the DOM:
		//
		// <div class="boxplusx-container boxplusx-hidden">
		//     <div class="boxplusx-dialog">
		//         <div class="boxplusx-wrapper boxplusx-hidden">
		//             <div class="boxplusx-wrapper">
		//                 <div class="boxplusx-wrapper">
		//                     <div class="boxplusx-viewport">
		//                         <div class="boxplusx-aspect"></div>
		//                         <div class="boxplusx-content"></div>
		//                         <div class="boxplusx-expander"></div>
		//                         <div class="boxplusx-previous"></div>
		//                         <div class="boxplusx-next"></div>
		//                     </div>
		//                     <div class="boxplusx-navigation">
		//                         <div class="boxplusx-navbar">
		//                             <div class="boxplusx-navitem">
		//                                 <div class="boxplusx-aspect"></div>
		//                                 <div class="boxplusx-navimage"></div>
		//                             </div>
		//                         </div>
		//                         <div class="boxplusx-rewind"></div>
		//                         <div class="boxplusx-forward"></div>
		//                     </div>
		//                 </div>
		//                 <div class="boxplusx-controls">
		//                     <div class="boxplusx-previous"></div>
		//                     <div class="boxplusx-next"></div>
		//                     <div class="boxplusx-close"></div>
		//                     <div class="boxplusx-start"></div>
		//                     <div class="boxplusx-stop"></div>
		//                     <div class="boxplusx-download"></div>
		//                     <div class="boxplusx-metadata"></div>
		//                 </div>
		//             </div>
		//             <div class="boxplusx-caption">
		//                 <div class="boxplusx-title"></div>
		//                 <div class="boxplusx-description"></div>
		//             </div>
		//         </div>
		//         <div class="boxplusx-progress boxplusx-hidden"></div>
		//     </div>
		// </div>
		// create elements
		this.aspectHolder = createElement('aspect');
		this.innerContainer = createElement('content');
		this.expander = createElement('expander');
		this.navigationBar = createElement('navbar');
		this.navigationArea = createElement('navigation', false, [this.navigationBar].concat(createElements(['rewind', 'forward'])));
		this.viewport = createElement('viewport', false, [this.aspectHolder, this.innerContainer, this.expander].concat(createElements(['previous', 'next'])));
		let controls = createElement('controls', false, createElements(['previous', 'next', 'close', 'start', 'stop', 'download', 'metadata']));
		this.captionTitle = createElement('title');
		this.captionDescription = createElement('description');
		this.caption = createElement('caption', false, [this.captionTitle, this.captionDescription]);
		let innerWrapper = createElement('wrapper', false, [this.viewport, this.navigationArea]);
		let outerWrapper = createElement('wrapper', false, [innerWrapper, controls]);
		this.contentWrapper = createElement('wrapper', true, [outerWrapper, this.caption]);
		this.progressIndicator = createElement('progress', true);
		this.dialog = createElement('dialog', false, [this.contentWrapper, this.progressIndicator]);
		this.outerContainer = createElement('container', true, [this.dialog]);
		if (this.options.id) {
			this.outerContainer.id = this.options.id;
		}
		// arrange layout
		this.caption.classList.add('boxplusx-' + this.options.captions);
		controls.classList.add('boxplusx-' + this.options.controls);
		this.navigationArea.classList.add('boxplusx-' + this.options.navigation);
		document.body.appendChild(this.outerContainer);
		this.preferredWidth = this.options.preferredWidth;
		this.preferredHeight = this.options.preferredHeight;
		this.outerContainer.addEventListener('click', (event) => {
			if (event.target === this.outerContainer) {
				this.close();
			}
		}, false);
		this.addEventToAllElements('click', {
			'previous': () => { this.previous(); },
			'next': () => { this.next(); },
			'close': () => { this.close(); },
			'start': () => { this.start(); },
			'stop': () => { this.stop(); },
			'metadata': () => { this.metadata(); },
			'download': () => { this.download(); },
			'rewind': () => { this.stopNavigationBar(); },
			'forward': () => { this.stopNavigationBar(); }
		});
		this.addEventToAllElements('mouseover', {
			'rewind': () => { this.rewindNavigationBar(); },
			'forward': () => { this.forwardNavigationBar(); }
		});
		this.addEventToAllElements('mouseout', {
			'rewind': () => { this.stopNavigationBar(); },
			'forward': () => { this.stopNavigationBar(); }
		});
		if (!this.options.contextmenu) {
			this.dialog.addEventListener('contextmenu', (event) => {
				event.preventDefault();
			});
		}
		this.outerContainer.dir = this.options.dir;
		// set up drag and drop for content
		new Draggable(this.viewport, this.innerContainer);
		// set up slideshow controller
		this.slideshow = new TimerController(() => { this.next(); }, this.options.slideshow);
		let toggleShrinkToFit = () => {
			if (this.preferredWidth > this.viewport.clientWidth || this.preferredHeight > this.viewport.clientHeight) {
				this.shrinkToFit = !this.shrinkToFit;
				const index = this.current;
				this.navigateToIndex(index);
			}
		};
		this.expander.addEventListener('click', toggleShrinkToFit);
		this.viewport.addEventListener('dblclick', toggleShrinkToFit);
		// prevent mouse wheel events from view area from propagating to document view
		this.innerContainer.addEventListener('mousewheel', (event) => {
			let wheelEvent = event;
			let canScroll = window.getComputedStyle(this.innerContainer).overflowY != 'hidden';
			let maxScroll = this.innerContainer.scrollHeight - this.innerContainer.clientHeight;
			if (canScroll && maxScroll > 0) {
				let scrollTop = this.innerContainer.scrollTop;
				let deltaY = wheelEvent.deltaY;
				if ((scrollTop === maxScroll && deltaY > 0) || (scrollTop === 0 && deltaY < 0)) {
					wheelEvent.preventDefault();
				}
			}
		});
		// map key to action
		let keyActions = new Map();
		keyActions.set(27, () => { this.close(); }); // ESC
		keyActions.set(36, () => { this.first(); }); // HOME
		keyActions.set(35, () => { this.last(); }); // END
		const prevFn = () => { this.previous(); };
		const nextFn = () => { this.next(); };
		switch (this.options.dir) {
			case BoxPlusXWritingSystem.LeftToRight:
				keyActions.set(37, prevFn); // left arrow
				keyActions.set(39, nextFn); // right arrow
				break;
			case BoxPlusXWritingSystem.RightToLeft:
				keyActions.set(39, prevFn); // right arrow
				keyActions.set(37, nextFn); // left arrow
				break;
		}
		// pressing a key
		window.addEventListener('keydown', (keyboardEvent) => {
			if (isVisible(this.outerContainer)) {
				// let form elements handle their own input
				if (isFormControl(keyboardEvent.target)) {
					return;
				}
				let keyAction = keyActions.get(keyboardEvent.which || keyboardEvent.keyCode);
				if (keyAction) {
					keyAction();
					keyboardEvent.preventDefault();
				}
			}
		}, false);
		// navigation by swipe
		new touch_TimerController(this.viewport, {
			right: () => {
				if (this.shrinkToFit) {
					this.previous();
				}
			},
			left: () => {
				if (this.shrinkToFit) {
					this.next();
				}
			}
		});
		// mobile-friendly forward and rewind for quick-access navigation bar
		new touch_TimerController(this.navigationBar, {
			start: () => {
				this.stopNavigationBar();
			},
			right: () => {
				this.rewindNavigationBar();
			},
			left: () => {
				this.forwardNavigationBar();
			}
		});
		// window resize
		window.addEventListener('resize', (_) => {
			if (isVisible(this.outerContainer)) {
				this.setMaximumDialogSize();
				this.repositionNavigationBar();
				this.updateExpanderState();
			}
		});
		if (this.options.history) {
			this.trail = new Trail((index) => {
				if (index !== undefined) {
					this.navigateToIndex(index);
				}
				else {
					this.close();
				}
			});
		}
	}
	/** Binds a set of elements to this dialog instance. */
	bind(items) {
		let properties = elementsToProperties(Array.from(items));
		let openfun = (index) => {
			this.open(properties, index);
		};
		items.forEach((elem, index) => {
			elem.addEventListener('click', (event) => {
				event.preventDefault();
				openfun(index);
			}, false);
		});
		return openfun;
	}
	/** Opens the pop-up window. */
	open(members, index) {
		this.members = members;
		// populate quick-access navigation bar
		const isNavigationVisible = members.length > 1 && this.options.navigation != BoxPlusXPosition.Hidden;
		setVisible(this.navigationArea, isNavigationVisible);
		if (isNavigationVisible) {
			members.forEach((member, i) => {
				let navigationAspect = createElement('aspect');
				let navigationImage = createElement('navimage');
				let navigationItem = createElement('navitem', false, [navigationAspect, navigationImage]);
				let allowAction = true;
				navigationItem.addEventListener('touchstart', () => {
					if (this.isNavigationBarSliding()) {
						allowAction = false;
					}
				});
				navigationItem.addEventListener('click', () => {
					if (allowAction) {
						this.navigate(i);
					}
					allowAction = true;
				});
				let image = member.image;
				if (image) {
					let img = image;
					let setNavigationImage = () => {
						let aspectStyle = navigationAspect.style;
						if (img.naturalWidth && img.naturalHeight) {
							aspectStyle.setProperty('width', img.naturalWidth + 'px');
							aspectStyle.setProperty('padding-top', (100.0 * img.naturalHeight / img.naturalWidth) + '%');
						}
						if (img.src) {
							navigationImage.style.setProperty('background-image', 'url("' + img.src + '")');
						}
					};
					if (img.src && img.complete) { // make sure the image is available
						setNavigationImage();
					}
					else {
						// set aspect properties immediately when the image is loaded
						img.addEventListener('load', setNavigationImage);
						let preloadableImage = image;
						// trigger pre-loader service if registered by another script
						if (preloadableImage.preloader) {
							preloadableImage.preloader.load();
						}
					}
				}
				navigationImage.innerText = (i + 1) + '';
				this.navigationBar.appendChild(navigationItem);
			});
		}
		this.show(index);
	}
	/** Show the pop-up window. */
	show(index) {
		if (this.options.autostart && this.options.slideshow > 0) {
			this.slideshow.enabled = true;
		}
		setVisible(this.outerContainer, true);
		setVisible(this.progressIndicator, true);
		this.navigateToIndex(index);
	}
	close() {
		this.slideshow.stop();
		// clear history track
		this.current = 0;
		if (this.trail) {
			this.trail.clear();
		}
		// call private method that does not manipulate history
		this.hideWindow();
	}
	navigate(index) {
		if (index != this.current) {
			this.navigateToIndex(index);
		}
	}
	first() {
		this.navigate(0);
	}
	previous() {
		const index = this.current;
		if (index > 0) {
			this.navigate(index - 1);
		}
		else if (this.options.loop) {
			this.last();
		}
	}
	next() {
		const index = this.current;
		if (index < this.members.length - 1) {
			this.navigate(index + 1);
		}
		else if (this.options.loop) {
			this.first();
		}
	}
	last() {
		this.navigate(this.members.length - 1);
	}
	start() {
		this.slideshow.start();
		if (this.options.slideshow > 0) {
			this.updateControls();
		}
	}
	stop() {
		this.slideshow.stop();
		if (this.options.slideshow > 0) {
			this.updateControls();
		}
	}
	metadata() {
		let metadata = this.queryElement('detail');
		if (metadata) {
			setVisible(metadata, !isVisible(metadata));
		}
	}
	download() {
		const index = this.current;
		const url = this.members[index].download;
		if (url !== undefined) {
			let anchor = document.createElement('a');
			anchor.href = url;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
		}
	}
	;
	queryElement(identifier) {
		return this.dialog.querySelector('.boxplusx-' + identifier);
	}
	queryAllElements(identifier) {
		return this.dialog.querySelectorAll('.boxplusx-' + identifier);
	}
	applyAllElements(identifier, func) {
		this.queryAllElements(identifier).forEach((elem) => {
			func(elem);
		});
	}
	addEventToAllElements(eventName, map) {
		for (const identifier of Object.getOwnPropertyNames(map)) {
			const eventFn = map[identifier];
			this.applyAllElements(identifier, (elem) => {
				elem.addEventListener(eventName, eventFn, false);
			});
		}
	}
	isContentInteractive(type) {
		switch (type) {
			case BoxPlusXContentType.Unavailable:
			case BoxPlusXContentType.Image:
				return false;
		}
		return true;
	}
	/** Sets a content type that helps identify what is shown in the pop-up window viewport area. */
	setContentType(contentType) {
		function getContentTypeString(type) {
			switch (type) {
				case BoxPlusXContentType.Unavailable:
					return 'unavailable';
				case BoxPlusXContentType.Image:
					return 'image';
				case BoxPlusXContentType.Video:
					return 'video';
				case BoxPlusXContentType.EmbeddedContent:
					return 'embed';
				case BoxPlusXContentType.DocumentFragment:
					return 'document';
				case BoxPlusXContentType.Frame:
					return 'frame';
				case BoxPlusXContentType.None:
					return 'none';
			}
		}
		let classList = this.innerContainer.classList;
		classList.remove('boxplusx-' + getContentTypeString(this.contentType));
		classList.remove('boxplusx-interactive');
		this.contentType = contentType;
		classList.add('boxplusx-' + getContentTypeString(contentType));
		if (this.isContentInteractive(contentType)) {
			classList.add('boxplusx-interactive');
		}
	}
	updateControls() {
		let index = this.current;
		let isFirstItem = index == 0;
		let members = this.members;
		let isLastItem = index >= members.length - 1;
		let loop = this.options.loop && !(isFirstItem && isLastItem);
		let slideshow = this.options.slideshow > 0;
		this.applyAllElements('previous', (elem) => {
			setVisible(elem, loop || !isFirstItem);
		});
		this.applyAllElements('next', (elem) => {
			setVisible(elem, loop || !isLastItem);
		});
		this.applyAllElements('start', (elem) => {
			setVisible(elem, slideshow && !this.slideshow.enabled && !isLastItem);
		});
		this.applyAllElements('stop', (elem) => {
			setVisible(elem, slideshow && this.slideshow.enabled);
		});
		this.applyAllElements('download', (elem) => {
			setVisible(elem, members[index].download !== undefined);
		});
		this.applyAllElements('metadata', (elem) => {
			setVisible(elem, this.options.metadata && !!this.queryElement('detail'));
		});
	}
	updateExpanderState() {
		let isOversize = this.preferredWidth > this.viewport.clientWidth || this.preferredHeight > this.viewport.clientHeight;
		setVisible(this.expander, isOversize && !this.isContentInteractive(this.contentType));
		toggleClass(this.expander, 'boxplusx-collapse', !this.shrinkToFit);
		toggleClass(this.expander, 'boxplusx-expand', this.shrinkToFit);
	}
	hideWindow() {
		// reset shrink to fit
		this.shrinkToFit = true;
		this.expandToFit = false;
		this.updateExpanderState();
		// reset content displayed
		this.removeAnimationProperties();
		this.clearContent();
		this.setContentType(BoxPlusXContentType.None);
		removeChildNodes(this.navigationBar);
		setVisible(this.contentWrapper, false);
		setVisible(this.outerContainer, false); // must come before manipulating history
	}
	/** Reveals the content to be displayed. */
	showContent() {
		this.removeAnimationProperties();
		setVisible(this.progressIndicator, false);
		let index = this.current;
		if (index >= this.members.length - 1) {
			this.slideshow.stop();
		}
		this.updateControls();
		setVisible(this.contentWrapper, true);
		// dialog must be visible to have valid offset values
		this.repositionNavigationBar();
		this.updateExpanderState();
		this.slideshow.resume();
	}
	/**
	* Trigger dialog animation to morph into a size suitable for the next item.
	* @param aspect Specifies how the dialog should respond when resized.
	* @param originalWidth The original dialog CSS width to start with.
	* @param originalHeight The original dialog CSS height to start with.
	*/
	morphDialog(aspect, originalWidth, originalHeight) {
		this.aspect = aspect;
		// save current dialog dimensions and aspect ratio
		let computedStyle = window.getComputedStyle(this.dialog);
		const currentWidth = originalWidth || computedStyle.getPropertyValue('width');
		const currentHeight = originalHeight || computedStyle.getPropertyValue('height');
		this.removeAnimationProperties();
		// use temporarily exposed elements for calculations
		setVisible(this.contentWrapper, true);
		let viewportClassList = this.viewport.classList;
		viewportClassList.remove('boxplusx-fixedaspect');
		viewportClassList.remove('boxplusx-draggable');
		if (BoxPlusXDimensionBehavior.FixedSize === aspect || BoxPlusXDimensionBehavior.FixedAspectRatio === aspect) {
			// set new aspect ratio
			// if specified as a percentage, CSS padding is expressed in terms of container width (even for top
			// and bottom padding), which we utilize here to make item grow/shrink vertically as it grows/shrinks
			// horizontally
			let aspectStyle = this.aspectHolder.style;
			if (this.expandToFit) {
				aspectStyle.setProperty('width', '100vw');
			}
			else {
				aspectStyle.setProperty('width', this.preferredWidth + 'px');
			}
			aspectStyle.setProperty('padding-top', (100.0 * this.preferredHeight / this.preferredWidth) + '%');
			viewportClassList.add('boxplusx-fixedaspect');
		}
		else if (BoxPlusXDimensionBehavior.ResizableBestFit === aspect) {
			viewportClassList.add('boxplusx-draggable');
		}
		else if (BoxPlusXDimensionBehavior.Resizable === aspect) {
			let containerStyle = this.innerContainer.style;
			containerStyle.setProperty('width', this.preferredWidth + 'px');
			containerStyle.setProperty('max-height', this.preferredHeight + 'px');
		}
		this.setMaximumDialogSize();
		// get desired target size with all inner controls temporarily visible
		const desiredWidth = computedStyle.getPropertyValue('width');
		const desiredHeight = computedStyle.getPropertyValue('height');
		const desiredMaxWidth = computedStyle.getPropertyValue('max-width');
		// animation transition end function
		let appliedStyle = this.dialog.style;
		let fn = () => {
			if (isVisible(this.outerContainer)) {
				appliedStyle.setProperty('max-width', desiredMaxWidth);
				this.showContent();
			}
		};
		if (currentWidth != desiredWidth || currentHeight != desiredHeight) { // dialog animation required to fit new content size
			// hide elements after calculations have been made
			setVisible(this.contentWrapper, false);
			// reset previous dialog dimensions
			appliedStyle.removeProperty('max-width');
			appliedStyle.setProperty('width', currentWidth);
			appliedStyle.setProperty('height', currentHeight);
			this.dialog.classList.add('boxplusx-animation');
			// determine when event "transitionend" would be fired
			// helps thwart deadlock when event "transitionend" is never fired due to race condition
			const duration = Math.max.apply(null, computedStyle.getPropertyValue('transition-duration').split(',').map(function (item) {
				let value = parseFloat(item);
				if (/\ds$/.test(item)) {
					return 1000 * value;
				}
				else {
					return value;
				}
			}));
			window.setTimeout(fn, duration);
		}
		else { // no dialog animation required, only swap content
			fn();
		}
		// start CSS transition by setting desired size for pop-up window as transition target
		appliedStyle.setProperty('width', desiredWidth);
		appliedStyle.setProperty('height', desiredHeight);
	}
	/**
	* Removes all element properties associated with dialog animation.
	*/
	removeAnimationProperties() {
		this.dialog.classList.remove('boxplusx-animation');
		// remove any explicit sizes applied for the sake of the CSS transition animation
		let appliedStyle = this.dialog.style;
		appliedStyle.removeProperty('width');
		appliedStyle.removeProperty('height');
	}
	/**
	* Uses the bisection algorithm to determine the dialog size.
	* @param a Lower bound (percentage) value at which the dialog fits.
	* @param b Upper bound (percentage) value at which the dialog does not fit.
	* @param applyFun Applies a value (e.g. sets content width or height).
	* @return The (percentage) value at which the dialog fits exactly.
	*/
	bisectionSearch(a, b, applyFun) {
		/**
		* Evaluates the dialog height at a particular value.
		* @param value A parameter value to apply.
		* @return The dialog height in pixels (including border and padding) when the value is applied.
		*/
		let evaluateFun = (value) => {
			applyFun(value);
			return this.dialog.offsetHeight;
		};
		const containerHeight = this.outerContainer.clientHeight;
		let dlgHeightB = evaluateFun(b); // no extra horizontal constraints
		if (dlgHeightB <= containerHeight) {
			return b; // nothing to do; pop-up window fits vertically
		}
		let dlgHeightA = evaluateFun(a); // force dialog take its minimum size
		if (dlgHeightA >= containerHeight) {
			applyFun(b); // reset constraints
			return b; // nothing to do; pop-up window too large to fit even with most constraints
		}
		// use bisection method to find least restrictive horizontal constraint that still allows the pop-up window
		// to fit vertically
		for (let n = 1; n < 10; ++n) { // use a maximum iteration count to avoid problems with slow convergence
			let c = ((a + b) / 2) | 0; // cast to integer for improved performance
			let dlgHeightC = evaluateFun(c);
			if (dlgHeightC < containerHeight) {
				a = c; // found a better lower bound
				dlgHeightA = dlgHeightC;
			}
			else {
				b = c; // found a better upper bound
				dlgHeightB = dlgHeightC;
			}
		}
		// when the algorithm terminates, lower and upper bound are close; apply the lower bound as the value we seek
		applyFun(a);
		return a;
	}
	/**
	* Set maximum width for dialog so that it does not exceed viewport dimensions.
	* CSS property max-height: 100% is not respected by browsers in this context: the height of the containing
	* block is not specified explicitly (i.e., it depends on content height), and the element is not absolutely
	* positioned, therefore the percentage value is treated as none (to avoid infinite re-calculation loops in
	* layout); as a work-around, we set an upper limit on width instead.
	*/
	setMaximumDialogSize() {
		if (BoxPlusXDimensionBehavior.FixedAspectRatio === this.aspect) {
			// for fixed aspect ratio, we vary the maximum dialog width in terms of the width of the container element
			// (browser viewport), expressed as a percentage value
			let dialogStyle = this.dialog.style;
			this.bisectionSearch(0, 1000, function (value) {
				dialogStyle.setProperty('max-width', (value / 10) + '%');
			});
		}
		else if (BoxPlusXDimensionBehavior.ResizableBestFit === this.aspect || BoxPlusXDimensionBehavior.Resizable === this.aspect) {
			// for dynamic aspect ratio, we vary the content holder element pixel height
			let containerStyle = this.innerContainer.style;
			containerStyle.removeProperty('max-height');
			let value = this.bisectionSearch(0, window.innerHeight, function (value) {
				containerStyle.setProperty('height', value + 'px');
			});
			containerStyle.removeProperty('height');
			containerStyle.setProperty('max-height', Math.min(value, this.preferredHeight) + 'px');
		}
	}
	/**
	* Makes the specified item currently active.
	* @param index The zero-based index of the item to be displayed.
	*/
	navigateToIndex(index) {
		var _a;
		const member = this.members[index];
		this.current = index;
		if (this.trail) {
			this.trail.push(index);
		}
		let computedStyle = window.getComputedStyle(this.dialog);
		const currentWidth = computedStyle.getPropertyValue('width');
		const currentHeight = computedStyle.getPropertyValue('height');
		this.slideshow.suspend();
		setVisible(this.progressIndicator, true);
		// save caption text
		let title = member.title;
		let description = member.description;
		const href = member.url;
		const urlparts = parseURL(href);
		const path = urlparts.pathname;
		const parameters = Object.assign({}, urlparts.queryparams, urlparts.fragmentparams);
		this.preferredWidth = parseOptionalInteger(parameters['width'], this.options.preferredWidth);
		this.preferredHeight = parseOptionalInteger(parameters['height'], this.options.preferredHeight);
		this.expandToFit = parseOptionalBoolean(parameters['fullscreen']);
		if (isHashChange(href)) {
			const target = urlparts.id ? urlparts.id : ((_a = parameters['target']) !== null && _a !== void 0 ? _a : '');
			if (target) {
				let elem = document.getElementById(target);
				if (elem) {
					let content = elem.cloneNode(true);
					this.replaceContent(content, title, description);
					this.setContentType(BoxPlusXContentType.DocumentFragment);
					this.morphDialog(BoxPlusXDimensionBehavior.Resizable, currentWidth, currentHeight);
				}
				else {
					this.displayUnavailable();
				}
			}
			else {
				this.displayUnavailable();
			}
		}
		else if (isImageFile(path)) {
			// download image in the background
			let image = document.createElement('img');
			let srcset = member['srcset'];
			if (srcset) {
				image.srcset = srcset;
			}
			image.addEventListener('load', (_) => {
				// try extracting image EXIF orientation for photos
				getImageMetadata(image, this.options.metadata).then(data => {
					let container = document.createDocumentFragment();
					// set image
					let rotationContainer = document.createElement('div');
					let imageElement = document.createElement('div');
					if (data.orientation > 0) {
						imageElement.classList.add('boxplusx-orientation-' + data.orientation);
					}
					let imageElementStyle = imageElement.style;
					imageElementStyle.setProperty('background-image', 'url("' + image.src + '")');
					if (image.srcset) {
						let matches = matchAll(image.srcset, /\b(\S+)\s+([\d.]+x)\b/g);
						let imageset = Array.from(matches, (match) => {
							return 'url("' + match[1] + '") ' + match[2];
						}).join();
						imageElementStyle.setProperty('background-image', '-webkit-image-set(' + imageset + ')');
					}
					let dpr = this.options.useDevicePixelRatio ? (window.devicePixelRatio || 1) : 1;
					let h = Math.floor(image.naturalHeight / dpr);
					let w = Math.floor(image.naturalWidth / dpr);
					if (!CSS.supports("image-orientation", "from-image") && data.orientation >= 5 && data.orientation <= 8) { // image rotated by 90 or 270 degrees
						this.preferredWidth = h;
						this.preferredHeight = w;
						// CSS transform does not affect bounding box for layout, enlarge/shrink CSS width/height
						// to accommodate for transformation results
						imageElementStyle.setProperty('width', (100 * w / h) + '%');
						imageElementStyle.setProperty('height', (100 * h / w) + '%');
					}
					else { // image rotated by 0 or 180 degrees
						this.preferredWidth = w;
						this.preferredHeight = h;
						// necessary when we re-use existing container accommodating previous image
						imageElementStyle.removeProperty('width');
						imageElementStyle.removeProperty('height');
					}
					if (!this.shrinkToFit) {
						let rotationContainerStyle = rotationContainer.style;
						rotationContainerStyle.setProperty('width', this.preferredWidth + 'px');
						rotationContainerStyle.setProperty('height', this.preferredHeight + 'px');
					}
					rotationContainer.appendChild(imageElement);
					container.appendChild(rotationContainer);
					// get image metadata information
					if (data.metadata !== undefined) {
						let metadata = data.metadata;
						let textElement = createElement('detail', true);
						let table = document.createElement('table');
						let keys = Object.keys(metadata);
						keys.sort();
						keys.forEach((key) => {
							let value = metadata[key];
							if (value !== undefined) {
								let row = document.createElement('tr');
								let headerCell = document.createElement('td');
								headerCell.innerText = key;
								let valueCell = document.createElement('td');
								if (value instanceof HTMLElement) {
									valueCell.append(value);
								}
								else {
									valueCell.innerText = value.toString();
								}
								row.append(headerCell, valueCell);
								table.appendChild(row);
							}
						});
						textElement.appendChild(table);
						container.appendChild(textElement);
					}
					this.replaceContent(container, title, description);
					this.caption.style.setProperty('max-width', this.preferredWidth + 'px'); // must come after replacing content to have any effect
					this.setContentType(BoxPlusXContentType.Image);
					// start dialog animation
					this.morphDialog(this.shrinkToFit ? BoxPlusXDimensionBehavior.FixedAspectRatio : BoxPlusXDimensionBehavior.ResizableBestFit, currentWidth, currentHeight);
				});
			}, false);
			image.addEventListener('error', () => { this.displayUnavailable(); }, false);
			image.src = href;
			// pre-fetch next image (unless last is shown) to speed up slideshows and viewing images one after the other
			if (index < this.members.length - 1) {
				const nextmember = this.members[index + 1];
				const nexthref = nextmember.url;
				const nexturlparts = parseURL(nexthref);
				if (isImageFile(nexturlparts.pathname)) {
					let nextimage = document.createElement('img');
					nextimage.src = nexthref;
				}
			}
		}
		else if (/\.(mov|mpe?g|mp4|ogg|webm)$/i.test(path)) { // supported by HTML5-native <video> tag
			let video = document.createElement('video');
			let play = createElement('play');
			let container = createElement('video', false, [video, play]);
			video.addEventListener('loadedmetadata', (_) => {
				// set video
				this.replaceContent(container, title, description);
				this.setContentType(BoxPlusXContentType.Video);
				this.preferredWidth = video.videoWidth;
				this.preferredHeight = video.videoHeight;
				this.morphDialog(BoxPlusXDimensionBehavior.FixedAspectRatio, currentWidth, currentHeight);
			}, false);
			video.addEventListener('error', () => this.displayUnavailable(), false);
			video.src = href;
			let poster = member.poster;
			if (poster) {
				video.poster = poster;
			}
			play.addEventListener('click', function () {
				setVisible(play, false);
				video.controls = true;
				video.play();
			});
		}
		else if (/\.pdf$/.test(path)) {
			let embed = document.createElement('embed');
			embed.src = href;
			embed.type = 'application/pdf';
			this.replaceContent(embed, title, description);
			this.setContentType(BoxPlusXContentType.EmbeddedContent);
			this.morphDialog(BoxPlusXDimensionBehavior.FixedAspectRatio, currentWidth, currentHeight);
		}
		else {
			// check for YouTube URLs
			let match = /^https?:\/\/(?:www\.)youtu(?:\.be|be\.com)\/(?:embed\/|watch\?v=|v\/|)([-_0-9A-Z]{11,})/i.exec(href);
			if (match !== null) {
				this.displayFrame('https://www.youtube.com/embed/' + match[1] + '?' + buildQuery({ rel: '0', controls: '1', showinfo: '0' }), title, description);
				return;
			}
			// URL to unrecognized target (a plain URL to an external location)
			this.displayFrame(href, title, description);
		}
	}
	/**
	* Clears the content in the inner container.
	* This function clears all CSS properties set from script so they revert to their values specified
	* in the stylesheet file.
	*/
	clearContent() {
		// remove all HTML child elements
		removeChildNodes(this.innerContainer);
		let dialogStyle = this.dialog.style;
		let aspectStyle = this.aspectHolder.style;
		let containerStyle = this.innerContainer.style;
		// remove CSS properties that force the aspect ratio
		aspectStyle.removeProperty('padding-top');
		aspectStyle.removeProperty('width');
		// remove content and content styling
		containerStyle.removeProperty('width'); // preferred width
		// remove fit to window constraints
		dialogStyle.removeProperty('max-width');
		containerStyle.removeProperty('max-height');
		this.captionTitle.innerHTML = "";
		this.captionDescription.innerHTML = "";
	}
	/**
	* Replaces the content currently displayed in the pop-up window.
	* @param content HTML content to place in the viewport area.
	* @param title The caption text title to associate with the item.
	* @param description The caption text description to associate with the item.
	*/
	replaceContent(content, title, description) {
		this.clearContent();
		this.innerContainer.appendChild(content);
		this.caption.style.removeProperty('max-width'); // reset caption style
		this.captionTitle.innerHTML = title;
		this.captionDescription.innerHTML = description;
	}
	/** Displays an indicator that the requested content is not available. */
	displayUnavailable() {
		this.clearContent();
		// set unavailable image
		this.setContentType(BoxPlusXContentType.Unavailable);
		// start dialog animation
		this.morphDialog(BoxPlusXDimensionBehavior.FixedAspectRatio);
	}
	/**
	* Displays the contents of an external page in the pop-up window.
	* @param src The URL to the source to be displayed.
	* @param title The caption text title to associate with the item.
	* @param description The caption text description to associate with the item.
	*/
	displayFrame(src, title, description) {
		let frame = document.createElement('iframe');
		frame.width = '' + this.preferredWidth;
		frame.height = '' + this.preferredHeight;
		frame.allow = 'fullscreen';
		frame.src = src;
		// HTML iframe must be added to the DOM in order for the 'load' event to be triggered
		this.replaceContent(frame, title, description);
		// must register 'load' event after adding to the DOM to avoid the event being triggered for blank document
		let hasFired = false;
		frame.addEventListener('load', (_) => {
			// make sure spurious 'load' events are ignored
			// (the third parameter to addEventListener called 'options' is not supported in all browsers)
			if (hasFired) {
				return;
			}
			hasFired = true;
			this.setContentType(BoxPlusXContentType.Frame);
			this.morphDialog(BoxPlusXDimensionBehavior.FixedAspectRatio);
		}, false);
	}
	/** Returns the current offset of an element from the edge, taking into account text directionality. */
	getItemEdgeOffset(item) {
		switch (this.options.dir) {
			case BoxPlusXWritingSystem.RightToLeft:
				const parentItem = item.offsetParent;
				return parentItem.offsetWidth - item.offsetWidth - item.offsetLeft; // an implementation of function offsetRight
			case BoxPlusXWritingSystem.LeftToRight:
				return item.offsetLeft;
		}
	}
	/**
	* Returns the maximum value for positioning the quick-access navigation bar.
	* Values in the range [-maximum; 0] are permitted as pixel length values for the CSS left property in order for
	* the navigation bar to remain in view.
	*/
	getNavigationRange() {
		return Math.max(this.navigationBar.offsetWidth - this.navigationArea.offsetWidth, 0);
	}
	/** Returns the current navigation bar position, taking into account text directionality. */
	getNavigationPosition() {
		// negate computed value because the property offsetLeft or offsetRight takes values in the range [-maximum; 0]
		return -this.getItemEdgeOffset(this.navigationBar);
	}
	/**
	* Starts moving the navigation bar towards the specified target position.
	* @param targetPosition A nonnegative number, indicating target position.
	* @param duration A nonnegative number, indicating number of milliseconds for the animation to take.
	*/
	slideNavigationBar(targetPosition, duration) {
		const rtl = this.options.dir == BoxPlusXWritingSystem.RightToLeft;
		let navigationStyle = this.navigationBar.style;
		navigationStyle.setProperty(rtl ? 'right' : 'left', (-targetPosition) + 'px');
		navigationStyle.setProperty('transition-duration', duration > 0 ? (5 * duration) + 'ms' : '');
	}
	isNavigationBarSliding() {
		return !!this.navigationBar.style.getPropertyValue('transition-duration');
	}
	/** Re-position the navigation bar so that the active item is aligned with the left edge of the navigation area. */
	repositionNavigationBar() {
		if (isVisible(this.navigationArea)) {
			// remove focus from navigation item corresponding to previously active item
			for (let k = 0; k < this.navigationBar.childNodes.length; ++k) {
				this.navigationBar.childNodes[k].classList.remove('boxplusx-current');
			}
			// set focus on navigation item corresponding to currently active item
			const index = this.current;
			const maximum = this.getNavigationRange(); // the maximum permitted offset
			let item = this.navigationBar.childNodes[index];
			item.classList.add('boxplusx-current');
			// get the current scroll offset, which may possibly be out of view
			let scrollPosition = this.getNavigationPosition();
			const itemEdgeOffset = this.getItemEdgeOffset(item);
			// the last position to scroll forward to before the current item goes (partially) out of view
			let lastForwardScrollFit = Math.min(maximum, itemEdgeOffset);
			if (scrollPosition > lastForwardScrollFit) {
				scrollPosition = lastForwardScrollFit;
			}
			// the last position to scroll backward to before the current item goes (partially) out of view
			// subtract item width because items are left offset-aligned
			let lastBackwardScrollFit = Math.max(0, itemEdgeOffset - this.navigationArea.offsetWidth + item.offsetWidth);
			if (scrollPosition < lastBackwardScrollFit) {
				scrollPosition = lastBackwardScrollFit;
			}
			this.slideNavigationBar(scrollPosition, 0); // temporarily disable any transition animation
		}
	}
	rewindNavigationBar() {
		const maximum = this.getNavigationRange();
		const current = maximum - this.getNavigationPosition();
		// set target position for navigation bar, reached via CSS transition animation
		// furthermost position for rewinding corresponds to the navigation bar pushed to the rightmost permitted
		// position (left offset value 0), set transition duration depending on how far we are from the furthermost
		// position to get a constant movement speed, regardless of what the current navigation bar position is
		this.slideNavigationBar(0, maximum - current);
	}
	forwardNavigationBar() {
		const maximum = this.getNavigationRange();
		const current = this.getNavigationPosition();
		// set target position for navigation bar, reached via CSS transition animation
		// furthermost position for forwarding corresponds to the navigation bar pushed to the leftmost permitted
		// position (greatest absolute value), set transition duration depending on how far we are from the furthermost
		// position to get a constant movement speed, regardless of what the current navigation bar position is
		this.slideNavigationBar(maximum, maximum - current);
	}
	stopNavigationBar() {
		// stop CSS transition animation by forcing the current offset values returned by computed style
		this.slideNavigationBar(this.getNavigationPosition(), 0); // temporarily disable any transition animation
	}
	/**
	* Discovers boxplusx links on a web page.
	* boxplusx links are regular HTML <a> elements whose 'rel' attribute has a value with the pattern 'boxplusx-NNN'
	* where NNN is a unique name. All items that share the same unique name are organized into the same gallery. When
	* the user clicks an item that is part of a gallery, the item opens in the pop-up window and users can navigate
	* between this and other items in the gallery without closing the pop-up window.
	*/
	static discover(strict, tag, options) {
		let activator = tag !== null && tag !== void 0 ? tag : 'boxplusx';
		let dialog = new BoxPlusXDialog_1(options);
		// discover groups of pop-up window display items on a web page
		// links with "rel" attribute that start with (but are not identical to) the activation string
		const items = document.querySelectorAll('a[href][rel^=' + activator + ']:not([rel=' + activator + '])');
		// make groups by name
		const groups = new Map();
		items.forEach((item) => {
			let identifier = item.getAttribute('rel');
			if (!identifier) {
				return;
			}
			let group = groups.get(identifier);
			if (group === undefined) {
				group = [];
				groups.set(identifier, group);
			}
			group.push(item);
		});
		groups.forEach((group) => {
			dialog.bind(group);
		});
		[].filter.call(document.querySelectorAll('a[href][rel=' + activator + ']'), (item) => {
			dialog.bind([item]);
		});
		if (!strict) {
			// individual links to images or video not part of a gallery
			let items = document.querySelectorAll('a[href]:not([rel^=' + activator + '])');
			[].filter.call(items, (item) => {
				return /\.(gif|jpe?g|mov|mpe?g|ogg|png|svg|web[mp])$/i.test(item.pathname) && !item.target;
			}).forEach((item) => {
				dialog.bind([item]);
			});
		}
	}
	;
};
BoxPlusXDialog = BoxPlusXDialog_1 = __decorate([
	sealed
], BoxPlusXDialog);

// ensure symbol is exported by Closure Compiler
window['BoxPlusXDialog'] = BoxPlusXDialog;

/******/ })()
;