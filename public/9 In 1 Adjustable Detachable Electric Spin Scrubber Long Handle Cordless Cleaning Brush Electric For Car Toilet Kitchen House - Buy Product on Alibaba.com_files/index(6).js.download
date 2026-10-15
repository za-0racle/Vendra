(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("react")) : typeof define === "function" && define.amd ? define(["exports", "react"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.HeaderFavorite = {}, global.React));
})(this, function(exports, react) {
	Object.defineProperties(exports, {
		__esModule: { value: true },
		[Symbol.toStringTag]: { value: "Module" }
	});
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	react = __toESM(react);
	//#region node_modules/js-cookie/dist/js.cookie.mjs
	/*! js-cookie v3.0.8 | MIT */
	function assign(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (key === "__proto__") continue;
				target[key] = source[key];
			}
		}
		return target;
	}
	var defaultConverter = {
		read: function(value) {
			if (value[0] === "\"") value = value.slice(1, -1);
			return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
		},
		write: function(value) {
			return encodeURIComponent(value).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
		}
	};
	function init(converter, defaultAttributes) {
		function set(name, value, attributes) {
			if (typeof document === "undefined") return;
			attributes = assign({}, defaultAttributes, attributes);
			if (typeof attributes.expires === "number") attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
			if (attributes.expires) attributes.expires = attributes.expires.toUTCString();
			name = encodeURIComponent(name).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
			var stringifiedAttributes = "";
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) continue;
				stringifiedAttributes += "; " + attributeName;
				if (attributes[attributeName] === true) continue;
				stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
			}
			return document.cookie = name + "=" + converter.write(value, name) + stringifiedAttributes;
		}
		function get(name) {
			if (typeof document === "undefined" || arguments.length && !name) return;
			var cookies = document.cookie ? document.cookie.split("; ") : [];
			var jar = {};
			for (var i = 0; i < cookies.length; i++) {
				var parts = cookies[i].split("=");
				var value = parts.slice(1).join("=");
				try {
					var found = decodeURIComponent(parts[0]);
					if (!(found in jar)) jar[found] = converter.read(value, found);
					if (name === found) break;
				} catch (_e) {}
			}
			return name ? jar[name] : jar;
		}
		return Object.create({
			set,
			get,
			remove: function(name, attributes) {
				set(name, "", assign({}, attributes, { expires: -1 }));
			},
			withAttributes: function(attributes) {
				return init(this.converter, assign({}, this.attributes, attributes));
			},
			withConverter: function(converter) {
				return init(assign({}, this.converter, converter), this.attributes);
			}
		}, {
			attributes: { value: Object.freeze(defaultAttributes) },
			converter: { value: Object.freeze(converter) }
		});
	}
	var api = init(defaultConverter, { path: "/" });
	//#endregion
	//#region src/utils.ts
	/**
	* 页面是否 RTL。与收藏夹页（trade-favorite utils/rtl.js）同实现：
	* 标题/公司名行的方向跟随页面而非内容嗅探（dir=auto 会被英文文案带偏）。
	*/
	var isRTL = () => document.documentElement.dir === "rtl";
	/**
	* 输入模态跟踪：区分键盘导航与鼠标/hover 场景。
	* reactjs-popup 打开弹层会无条件程序聚焦第一个可聚焦元素（focusContentOnOpen，无 prop 关闭），
	* Chrome 把「之前焦点在 body 的程序 focus」判定为 :focus-visible 并画出浏览器默认 outline；
	* 故用模态跟踪替代浏览器启发：仅键盘（Tab）场景显示焦点环，鼠标/hover 打开不显示。
	*/
	var keyboardMode = false;
	if (typeof window !== "undefined") {
		window.addEventListener("keydown", (event) => {
			if (event.key === "Tab") keyboardMode = true;
		}, true);
		window.addEventListener("mousedown", () => {
			keyboardMode = false;
		}, true);
	}
	var isKeyboardMode = () => keyboardMode;
	var getObjectCookieMap = (cookieName) => {
		const cfg = {};
		(api.get(cookieName) || "").split("&").forEach((str) => {
			const pair = str.split("=");
			if (pair[0]) cfg[pair[0]] = pair[1];
		});
		return cfg;
	};
	var getCtoken = () => {
		let json;
		try {
			json = getObjectCookieMap("xman_us_t");
		} catch (_unused) {}
		return (json === null || json === void 0 ? void 0 : json.ctoken) || api.get("ctoken");
	};
	var getTbtoken = () => {
		let json;
		try {
			json = getObjectCookieMap("sc_g_cfg_f");
		} catch (_unused2) {}
		return (json === null || json === void 0 ? void 0 : json._tb_token_) || api.get("_tb_token_");
	};
	//#endregion
	//#region src/auth.ts
	/**
	* 登录闸门：以「H5 cookie 会话就绪」为判据，对齐服务端 @Verify 的校验逻辑。
	* xman_us_t 必须同时含 sign=y 与 ctoken=，仅判 sign=y 会放行匿名请求，
	* 被服务端以 invalid account 拒绝。
	*/
	var hasWebSession = () => {
		if (typeof document === "undefined") return false;
		try {
			const cfg = getObjectCookieMap("xman_us_t");
			return cfg.sign === "y" && Boolean(cfg.ctoken);
		} catch (_unused) {
			return false;
		}
	};
	/** 当前登录用户，用于埋点公共参数 */
	var getLoginId = () => {
		if (typeof document === "undefined") return "";
		const matched = document.cookie.match(/(?:^|;\s*)login_id=([^;]+)/);
		return matched ? decodeURIComponent(matched[1]) : "";
	};
	//#endregion
	//#region src/assets/blank-status-favourites.png
	var blank_status_favourites_default = "data:image/png;base64,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";
	//#endregion
	//#region src/constants.ts
	/** 取数超时（header 场景不可接受长等待，购物车为 30s） */
	var REQUEST_TIMEOUT = 8e3;
	/** 收藏接口基准域名，transferDomain 运行时按地区改写为 us-/hz- */
	var FAVORITE_BASE_DOMAIN = "us-favorite.alibaba.com";
	/**
	* 空态插画（设计稿 2548-12767 "blank status-favourites"：牛皮纸箱 + 爱心贴纸，100×100）。
	* 图源直接从 Figma 导出并随包发布，避免依赖外部图床；如设计侧后续给出 CDN 资源，替换为外链即可。
	*/
	var EMPTY_ILLUSTRATION = blank_status_favourites_default;
	/**
	* 金品供应商认证图标。数据源为精简契约的 isGoldSupplier，展示口径对齐
	* 收藏夹页商品列表供应商区（product.jsx GOLD_VERIFY_ICON 同资源，height 定高 width 等比）。
	* 替代旧口径 VERIFIED_BADGE（Verified Supplier 徽标，其数据源 isTradeAssurance 已不下发）。
	*/
	var GOLD_SUPPLIER_ICON = "https://sc01.alicdn.com/kf/H58367af07b91408ab045a753e6b0c41av.png";
	/** 商家 logo 缺失时的兜底图（与收藏夹页一致） */
	var DEFAULT_SUPPLIER_LOGO = "https://s.alicdn.com/@img/imgextra/i4/O1CN01kGoV151koOWhezENv_!!6000000004730-2-tps-102-102.png";
	//#endregion
	//#region src/components/empty.tsx
	/** S2 全空态：插画 + 主文案 + 引导副文案，整体居中（设计稿 2548-12767） */
	var Empty = ({ title, desc }) => /* @__PURE__ */ react.default.createElement("div", {
		className: "favorite-empty",
		"data-testid": "hf-empty"
	}, /* @__PURE__ */ react.default.createElement("img", {
		className: "favorite-empty-img",
		src: EMPTY_ILLUSTRATION,
		alt: "",
		dir: "ltr"
	}), /* @__PURE__ */ react.default.createElement("div", {
		className: "favorite-empty-title",
		dir: "auto"
	}, title), /* @__PURE__ */ react.default.createElement("div", {
		className: "favorite-empty-desc",
		dir: "auto"
	}, desc));
	//#endregion
	//#region src/components/heart-icon.tsx
	/** 爱心图标：用于空态引导文案里的 {icon} 占位（文案定稿要求用图而非 emoji） */
	var HeartIcon = ({ size = 12 }) => /* @__PURE__ */ react.default.createElement("svg", {
		className: "favorite-heart-icon",
		width: size,
		height: size,
		viewBox: "0 0 24 24",
		fill: "none",
		"aria-hidden": "true",
		focusable: "false"
	}, /* @__PURE__ */ react.default.createElement("path", {
		d: "M12 8.44456L10.1528 6.5973C8.68773 5.13224 6.31239 5.13224 4.84733 6.5973C3.38227 8.06236 3.38227 10.4377 4.84733 11.9028L12.0001 19.0555L19.1528 11.9027C20.6179 10.4377 20.6179 8.06233 19.1528 6.59727C17.6877 5.13221 15.3124 5.13221 13.8473 6.59727L12 8.44456ZM12.0001 21L3.87506 12.875C1.87303 10.873 1.87303 7.62706 3.87506 5.62503C5.87709 3.62299 9.12303 3.623 11.1251 5.62503L12 6.50001L12.8751 5.625C12.8753 5.62478 12.8755 5.62456 12.8757 5.62434C14.8778 3.62297 18.1233 3.62319 20.1251 5.625C22.1271 7.62703 22.1271 10.873 20.1251 12.875L12.0001 21Z",
		fill: "#222222"
	}));
	//#endregion
	//#region src/use-focus-ring.ts
	/**
	* 焦点环按输入模态显示：鼠标/hover（含 reactjs-popup 打开弹层时的程序聚焦）不显示焦点环，
	* 键盘 Tab 导航时显示。返回 focusRing（是否加 .focus-ring class）与 focusProps。
	*/
	var useFocusRing = () => {
		const [focusRing, setFocusRing] = (0, react.useState)(false);
		return {
			focusRing,
			focusProps: {
				onFocus: () => setFocusRing(isKeyboardMode()),
				onBlur: () => setFocusRing(false)
			}
		};
	};
	//#endregion
	//#region src/components/title-tags.tsx
	/**
	* 卡片标题/公司名行内业务标签（大促促销标 / 能力标签）。
	* 渲染口径对齐收藏夹页商品列表（product.jsx renderTitleTags）：
	* - needContainer 缺省或 true：容器样式（背景/文字色、圆角、定高 16px）
	* - needContainer=false：裸元素直出（契约上必为纯图标标签，图标按自身 width/height 展示）
	* - 兼容三种形态：纯文字 / 纯图标 / 图标(起始端)+文字
	* 窗外态（isShow=false）与图标/文字皆空项已在 adapter 剔除，此处直接 map。
	* 行内间距用逻辑属性（margin-inline-*），RTL 下自动翻转；标签与标题的
	* 阅读方向由调用方的标题行容器控制（dir 跟随页面，见 product-item / supplier-item）。
	*/
	var TitleTags = ({ tags }) => Array.isArray(tags) ? /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, tags.map((tag, index) => {
		const hasIcon = Boolean(tag.iconUrl);
		const hasText = Boolean(tag.text);
		if (!hasIcon && !hasText) return null;
		const needContainer = tag.needContainer !== false;
		return /* @__PURE__ */ react.default.createElement("span", {
			key: index,
			className: needContainer ? "favorite-title-tag" : "favorite-title-tag favorite-title-tag--bare",
			style: needContainer ? {
				backgroundColor: tag.backgroundColor,
				color: tag.textColor
			} : void 0,
			"data-testid": "hf-title-tag"
		}, hasIcon ? /* @__PURE__ */ react.default.createElement("img", {
			className: "favorite-title-tag-icon",
			src: tag.iconUrl,
			width: tag.iconWidth,
			height: tag.iconHeight,
			alt: ""
		}) : null, hasText ? /* @__PURE__ */ react.default.createElement("span", { className: "favorite-title-tag-text" }, tag.text) : null);
	})) : null;
	//#endregion
	//#region \0@oxc-project+runtime@0.144.0/helpers/esm/typeof.js
	function _typeof(o) {
		"@babel/helpers - typeof";
		return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, _typeof(o);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.144.0/helpers/esm/toPrimitive.js
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.144.0/helpers/esm/toPropertyKey.js
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.144.0/helpers/esm/defineProperty.js
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	//#endregion
	//#region \0@oxc-project+runtime@0.144.0/helpers/esm/objectSpread2.js
	function ownKeys(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread2(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
				_defineProperty(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	//#endregion
	//#region src/components/product-item.tsx
	/** 图片加载失败时隐藏 img，露出容器灰底，避免出现破图 */
	var hideBrokenImage = (event) => {
		event.currentTarget.style.visibility = "hidden";
	};
	var ProductItem = ({ item, moqText, position, onClick }) => {
		const { title, imageUrl, detailUrl, priceText, tags } = item || {};
		const { focusRing, focusProps } = useFocusRing();
		return /* @__PURE__ */ react.default.createElement("a", _objectSpread2({
			className: `favorite-card${focusRing ? " focus-ring" : ""}`,
			href: detailUrl,
			title,
			target: "_blank",
			rel: "noreferrer",
			"data-testid": "hf-product-item",
			onClick: () => onClick(item, position)
		}, focusProps), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-card-media" }, imageUrl ? /* @__PURE__ */ react.default.createElement("img", {
			src: imageUrl,
			alt: title || "Product",
			onError: hideBrokenImage
		}) : null), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-card-main" }, /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-product-title",
			dir: isRTL() ? "rtl" : "ltr"
		}, /* @__PURE__ */ react.default.createElement(TitleTags, { tags }), /* @__PURE__ */ react.default.createElement("span", { className: "favorite-product-title-text" }, title)), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-product-price" }, priceText ? /* @__PURE__ */ react.default.createElement("span", {
			className: "favorite-price-current",
			dir: "ltr"
		}, priceText) : null, moqText ? /* @__PURE__ */ react.default.createElement("span", {
			className: "favorite-product-moq",
			dir: "auto"
		}, moqText) : null)));
	};
	//#endregion
	//#region src/components/arrow-icon.tsx
	/** View all 后的右箭头（设计稿 12×12）。RTL 下由样式做水平翻转 */
	var ArrowIcon = () => /* @__PURE__ */ react.default.createElement("svg", {
		className: "favorite-arrow-icon",
		width: "12",
		height: "12",
		viewBox: "0 0 12 12",
		fill: "none",
		"aria-hidden": "true",
		focusable: "false"
	}, /* @__PURE__ */ react.default.createElement("path", {
		d: "M4.2 2.4 8.3 6l-4.1 3.6",
		stroke: "#222222",
		strokeWidth: "1.4",
		strokeLinecap: "round",
		strokeLinejoin: "round"
	}));
	//#endregion
	//#region src/components/section.tsx
	/**
	* 收藏分区。
	* 收藏总数为 0 时不展示 View all（设计稿：仅标题 + 引导文案），避免把用户导到空列表。
	*/
	var Section = ({ title, emptyTip, showViewAll, viewAllText, viewAllUrl, onViewAll, children, testId }) => {
		const isEmpty = Boolean(emptyTip);
		const { focusRing, focusProps } = useFocusRing();
		return /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-section",
			"data-testid": testId
		}, /* @__PURE__ */ react.default.createElement("div", { className: "favorite-section-head" }, /* @__PURE__ */ react.default.createElement("span", {
			className: "favorite-section-title",
			dir: "auto"
		}, title), showViewAll ? /* @__PURE__ */ react.default.createElement("a", _objectSpread2({
			className: `favorite-view-all${focusRing ? " focus-ring" : ""}`,
			href: viewAllUrl,
			target: "_blank",
			rel: "noreferrer",
			"data-testid": testId ? `${testId}-view-all` : void 0,
			onClick: onViewAll
		}, focusProps), /* @__PURE__ */ react.default.createElement("span", { dir: "auto" }, viewAllText), /* @__PURE__ */ react.default.createElement(ArrowIcon, null)) : null), isEmpty ? /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-section-tip",
			"data-testid": testId ? `${testId}-empty` : void 0
		}, /* @__PURE__ */ react.default.createElement("span", { dir: "auto" }, emptyTip)) : /* @__PURE__ */ react.default.createElement("div", { className: "favorite-section-body" }, children));
	};
	//#endregion
	//#region src/components/sign-in.tsx
	/** S1 未登录态：提示文案 + 通栏主按钮（设计稿 2550-12791） */
	var SignIn = ({ tip, buttonText, onSignIn }) => {
		const { focusRing, focusProps } = useFocusRing();
		return /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-signin",
			"data-testid": "hf-signin"
		}, /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-signin-tip",
			dir: "auto"
		}, tip), /* @__PURE__ */ react.default.createElement("button", _objectSpread2({
			type: "button",
			className: `favorite-signin-btn${focusRing ? " focus-ring" : ""}`,
			"data-testid": "hf-signin-btn",
			onClick: onSignIn
		}, focusProps), /* @__PURE__ */ react.default.createElement("span", { dir: "auto" }, buttonText)));
	};
	//#endregion
	//#region src/components/supplier-item.tsx
	var SupplierItem = ({ item, position, onClick }) => {
		const { companyName, logoUrl, homepageUrl, goldSupplier, yearsText, locationText, tags } = item || {};
		const facts = [yearsText, locationText].filter(Boolean);
		const { focusRing, focusProps } = useFocusRing();
		return /* @__PURE__ */ react.default.createElement("a", _objectSpread2({
			className: `favorite-card${focusRing ? " focus-ring" : ""}`,
			href: homepageUrl,
			title: companyName,
			target: "_blank",
			rel: "noreferrer",
			"data-testid": "hf-supplier-item",
			onClick: () => onClick(item, position)
		}, focusProps), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-card-media" }, /* @__PURE__ */ react.default.createElement("img", {
			src: logoUrl || "https://s.alicdn.com/@img/imgextra/i4/O1CN01kGoV151koOWhezENv_!!6000000004730-2-tps-102-102.png",
			alt: companyName || "Supplier",
			onError: (event) => {
				event.currentTarget.src = DEFAULT_SUPPLIER_LOGO;
			}
		})), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-card-main" }, /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-supplier-name",
			dir: isRTL() ? "rtl" : "ltr"
		}, /* @__PURE__ */ react.default.createElement(TitleTags, { tags }), /* @__PURE__ */ react.default.createElement("span", { className: "favorite-supplier-name-text" }, companyName)), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-supplier-facts" }, goldSupplier ? /* @__PURE__ */ react.default.createElement("img", {
			className: "favorite-gold-supplier",
			src: GOLD_SUPPLIER_ICON,
			alt: "Gold Supplier"
		}) : null, facts.map((text, index) => /* @__PURE__ */ react.default.createElement("span", {
			className: "favorite-fact",
			key: text
		}, index > 0 || goldSupplier ? /* @__PURE__ */ react.default.createElement("i", { className: "favorite-fact-dot" }) : null, /* @__PURE__ */ react.default.createElement("span", { dir: "ltr" }, text))))));
	};
	//#endregion
	//#region src/i18n.ts
	/**
	* 英文兜底文案。接入方通过 props.i18n 覆盖（取词为空的 key 自动回落到此处）。
	* 文案定稿见 https://aliyuque.antfin.com/duzeyan.dzy/mpvxxp/oa4wrmmungg2725q
	* 占位符由组件填充，不要拆成字符串拼接（多语言语序会错）：
	* - {num}：分区计数（ProductsWithCount / SuppliersWithCount）
	* - {icon}：空态引导文案里的爱心图标占位
	*/
	var i18n = {
		Title: "Favorites",
		Products: "Products",
		ProductsWithCount: "Products ({num})",
		Suppliers: "Suppliers",
		SuppliersWithCount: "Suppliers ({num})",
		ViewAll: "View all",
		SignInTip: "Sign in to view your favorites",
		SignIn: "Sign in",
		EmptyTitle: "Nothing saved yet",
		EmptyDesc: "Click the {icon} on a product or supplier to save it here",
		EmptyProduct: "Click the {icon} on a product to save it here",
		EmptySupplier: "Click the {icon} on a supplier to save it here"
	};
	//#endregion
	//#region src/log.ts
	/**
	* 埋点。与收藏夹页统一走 /sc.trade-assurance.trade-favorite，
	* 以 pageName=header-favorite 区分入口，便于数据侧按收藏域聚合（PRD 要求）。
	* icon 的 hover / click 由 header 侧用其自有 log() 上报，不在此处。
	*/
	var LOGKEY = "/sc.trade-assurance.trade-favorite";
	var PAGE_NAME = "header-favorite";
	/**
	* 每次调用时获取 goldlog：aplus SDK 可能比本组件晚加载，
	* 模块加载时捕获会导致后续永远走降级队列。
	*/
	var getGoldlog = () => {
		if (typeof window === "undefined") return { record: () => {} };
		return window.goldlog || { record: (logkey, gmkey, gokey) => {
			(window.goldlog_queue || (window.goldlog_queue = [])).push({
				action: "goldlog.record",
				arguments: [
					logkey,
					gmkey,
					gokey
				]
			});
		} };
	};
	/** 公共参数：入口标识 + 用户 + 当前页面（用于分析哪些页面转化最好） */
	var getCommonParams = () => ({
		pageName: PAGE_NAME,
		channel: "pc",
		loginId: getLoginId(),
		pageUrl: typeof window === "undefined" ? "" : window.location.href
	});
	var serialize = (params) => Object.keys(params).filter((key) => params[key] !== void 0 && params[key] !== null && params[key] !== "").map((key) => params[key] instanceof Object ? `${key}=${JSON.stringify(params[key])}` : `${key}=${params[key]}`).join("&");
	var log_default = (gokey, ext = null, type = "CLK", logkey = LOGKEY) => {
		if (!gokey || typeof window === "undefined") return;
		let strParams = `actionName=${gokey}`;
		try {
			const extParams = serialize(_objectSpread2(_objectSpread2({}, getCommonParams()), ext instanceof Object ? ext : {}));
			if (extParams) strParams = `${strParams}&${extParams}`;
		} catch (err) {}
		getGoldlog().record(logkey, type, strParams);
	};
	//#endregion
	//#region src/panel.tsx
	/** 锚点求值：支持直接给元素，或给 CSS 选择器（宿主拿不到 ref 时更好接） */
	var resolveAnchor = (anchor) => {
		if (!anchor) return null;
		if (typeof anchor !== "string") return anchor;
		try {
			return document.querySelector(anchor);
		} catch (_unused) {
			return null;
		}
	};
	/**
	* 小三角的水平位置 = 锚点中心相对面板左边缘的距离，收拢在 [ARROW_EDGE_GAP, 宽-ARROW_EDGE_GAP] 内。
	* 这里刻意用物理坐标（getBoundingClientRect 的 left）而非逻辑属性：三角要对齐的是
	* 屏幕上那个图标的实际位置，RTL 下面板与图标一起镜像，按物理坐标算天然正确。
	* 返回 null 表示量不到（无锚点 / 尚未布局 / SSR），此时交回 CSS 的默认贴边位置。
	*/
	var measureArrowLeft = (panel, anchor) => {
		const anchorEl = resolveAnchor(anchor);
		if (!panel || !anchorEl || typeof panel.getBoundingClientRect !== "function") return null;
		const panelRect = panel.getBoundingClientRect();
		const anchorRect = anchorEl.getBoundingClientRect();
		if (!panelRect.width || !anchorRect.width) return null;
		const center = anchorRect.left + anchorRect.width / 2 - panelRect.left;
		const max = panelRect.width - 20;
		if (max <= 20) return null;
		return Math.min(Math.max(center, 20), max);
	};
	/**
	* 弹层外壳：统一各状态的容器与小三角。
	*
	* 分工——面板本身「不超出屏幕」由宿主的定位策略负责（reactjs-popup 的 keepTooltipInside /
	* position / offset）；组件只负责让三角始终指向爱心图标：宿主为防溢出把面板往内推之后，
	* 这里按锚点中心重算，不像写死 translateX 那样会指偏。
	*/
	var Panel = ({ arrow = true, arrowAnchor, children }) => {
		const panelRef = (0, react.useRef)(null);
		const [arrowLeft, setArrowLeft] = (0, react.useState)(null);
		(0, react.useLayoutEffect)(() => {
			if (!arrow) return;
			const sync = () => setArrowLeft(measureArrowLeft(panelRef.current, arrowAnchor));
			sync();
			window.addEventListener("resize", sync);
			return () => window.removeEventListener("resize", sync);
		}, [arrow, arrowAnchor]);
		return /* @__PURE__ */ react.default.createElement("div", {
			className: "header-favorite",
			ref: panelRef
		}, arrow && /* @__PURE__ */ react.default.createElement("span", {
			className: "favorite-arrow",
			"data-testid": "hf-arrow",
			"aria-hidden": "true",
			style: arrowLeft === null ? void 0 : {
				left: `${arrowLeft - 8}px`,
				right: "auto"
			}
		}), children);
	};
	//#endregion
	//#region src/react-try-catch-render.ts
	/**
	* 渲染错误边界 HOC：捕获渲染异常、上报埋点并降级，保证异常不外溢到宿主。
	* 注意：这里不使用泛型透传 props 类型 —— api-extractor 无法解析匿名泛型 class
	* （报 "Unable to follow symbol for P" 导致 build 中断），由调用方对结果做一次
	* ComponentType<Props> 断言来恢复类型。
	*/
	var react_try_catch_render_default = ({ blockName = "", errorRenderComponent = null } = {}) => {
		const errorKey = `${blockName.replace(/-/g, "_") || "component"}_error`;
		return (ReactComponent) => {
			return class TryCatch extends react.default.Component {
				constructor(..._args) {
					super(..._args);
					this.state = {
						hasError: false,
						error: null
					};
				}
				componentDidCatch(error) {
					this.setState({
						hasError: true,
						error
					});
					log_default(errorKey, {
						type: "componentError",
						msg: error === null || error === void 0 ? void 0 : error.message
					});
				}
				render() {
					const { hasError, error } = this.state;
					if (!hasError) return react.default.createElement(ReactComponent, this.props);
					return errorRenderComponent ? react.default.createElement(errorRenderComponent, { error }) : null;
				}
			};
		};
	};
	//#endregion
	//#region src/adapter.ts
	var import_fetch_jsonp = /* @__PURE__ */ __toESM((/* @__PURE__ */ __commonJSMin(((exports, module) => {
		(function(global, factory) {
			if (typeof define === "function" && define.amd) define(["exports", "module"], factory);
			else if (typeof exports !== "undefined" && typeof module !== "undefined") factory(exports, module);
			else {
				var mod = { exports: {} };
				factory(mod.exports, mod);
				global.fetchJsonp = mod.exports;
			}
		})(exports, function(exports$1, module$1) {
			"use strict";
			var defaultOptions = {
				timeout: 5e3,
				jsonpCallback: "callback",
				jsonpCallbackFunction: null
			};
			function generateCallbackFunction() {
				return "jsonp_" + Date.now() + "_" + Math.ceil(Math.random() * 1e5);
			}
			function clearFunction(functionName) {
				try {
					delete window[functionName];
				} catch (e) {
					window[functionName] = void 0;
				}
			}
			function removeScript(scriptId) {
				var script = document.getElementById(scriptId);
				if (script) document.getElementsByTagName("head")[0].removeChild(script);
			}
			function fetchJsonp(_url) {
				var options = arguments.length <= 1 || arguments[1] === void 0 ? {} : arguments[1];
				var url = _url;
				var timeout = options.timeout || defaultOptions.timeout;
				var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;
				var timeoutId = void 0;
				return new Promise(function(resolve, reject) {
					var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
					var scriptId = jsonpCallback + "_" + callbackFunction;
					window[callbackFunction] = function(response) {
						resolve({
							ok: true,
							json: function json() {
								return Promise.resolve(response);
							}
						});
						if (timeoutId) clearTimeout(timeoutId);
						removeScript(scriptId);
						clearFunction(callbackFunction);
					};
					url += url.indexOf("?") === -1 ? "?" : "&";
					var jsonpScript = document.createElement("script");
					jsonpScript.setAttribute("src", "" + url + jsonpCallback + "=" + callbackFunction);
					if (options.charset) jsonpScript.setAttribute("charset", options.charset);
					if (options.nonce) jsonpScript.setAttribute("nonce", options.nonce);
					if (options.referrerPolicy) jsonpScript.setAttribute("referrerPolicy", options.referrerPolicy);
					if (options.crossorigin) jsonpScript.setAttribute("crossorigin", typeof options.crossorigin === "string" ? options.crossorigin : "anonymous");
					var fp = options.fetchPriority;
					if (fp === "high" || fp === "low" || fp === "auto") jsonpScript.setAttribute("fetchPriority", fp);
					jsonpScript.id = scriptId;
					document.getElementsByTagName("head")[0].appendChild(jsonpScript);
					timeoutId = setTimeout(function() {
						reject(/* @__PURE__ */ new Error("JSONP request to " + _url + " timed out"));
						clearFunction(callbackFunction);
						removeScript(scriptId);
						window[callbackFunction] = function() {
							clearFunction(callbackFunction);
						};
					}, timeout);
					jsonpScript.onerror = function() {
						reject(/* @__PURE__ */ new Error("JSONP request to " + _url + " failed"));
						clearFunction(callbackFunction);
						removeScript(scriptId);
						if (timeoutId) clearTimeout(timeoutId);
					};
				});
			}
			module$1.exports = fetchJsonp;
		});
	})))());
	/**
	* 服务端 `getRecentFavorites` 的 data（2026-08-28 起为**精简契约**：元素只含弹层
	* 渲染所需字段，不再透出 winterfell 12643/12644 flat 全集），且列表与总数平铺在同层：
	* `{ products, companies, totalProductCount, totalCompanyCount }`。
	*
	* 弹层内部用的是按分区收敛的 `{ product: { totalCount, list }, supplier: {...} }`，
	* 故在此做一层映射：**原始字段名只在本文件出现**，组件与缓存都只见内部契约。
	*/
	/** 总数口径为收藏原始总数（含失效项），异常分支服务端给 0；非法值一律归零 */
	var toCount = (raw) => {
		const value = Number(raw);
		return Number.isFinite(value) && value > 0 ? value : 0;
	};
	var toList = (raw) => Array.isArray(raw) ? raw : [];
	/** 地区文案 "City, Country"；无城市时仅国家 */
	var toLocationText = (city, country) => [city, country].filter(Boolean).join(", ");
	/**
	* 起订量文案 "MOQ: 2"。服务端只下发起订量数字（实测为字符串），前缀是行业
	* 通用缩写不翻译，与收藏夹页商品卡（product.jsx）同口径由前端拼装。
	*/
	var toMoqText = (moqQuantity) => moqQuantity != null && moqQuantity !== "" ? `MOQ: ${moqQuantity}` : "";
	/**
	* 经营年限文案：完全由接口数据驱动——服务端按本地化下发完整文案（如 "6年" / "6 yrs"），
	* 组件原样透传，不做任何拼接或单位补全。空值归空不占位。
	*/
	var toYearsText = (goldSupplierYears) => goldSupplierYears == null ? "" : String(goldSupplierYears).trim();
	/**
	* 业务标签（如 Super September 大促标）收敛。服务端 tags 带时间窗，
	* 窗外会翻成 isShow=false + icon.url 空串，故以 isShow 与「图标/文字皆空」
	* 双重判空为闸门剔除窗外态（与收藏夹页 product.jsx/supplier.jsx 同口径）；
	* needContainer 直接透传（false = 裸元素直出纯图标标签，缺省视为容器样式）。
	* 收敛后仅保留渲染所需字段，原始结构不出 adapter。
	*/
	var toTags = (raw) => toList(raw).filter((tag) => {
		var _tag$icon;
		return (tag === null || tag === void 0 ? void 0 : tag.isShow) && (((_tag$icon = tag.icon) === null || _tag$icon === void 0 ? void 0 : _tag$icon.url) || tag.text);
	}).map((tag) => {
		var _tag$icon2, _tag$icon3, _tag$icon4;
		return {
			text: tag.text,
			iconUrl: (_tag$icon2 = tag.icon) === null || _tag$icon2 === void 0 ? void 0 : _tag$icon2.url,
			iconWidth: (_tag$icon3 = tag.icon) === null || _tag$icon3 === void 0 ? void 0 : _tag$icon3.width,
			iconHeight: (_tag$icon4 = tag.icon) === null || _tag$icon4 === void 0 ? void 0 : _tag$icon4.height,
			needContainer: tag.needContainer,
			textColor: tag.textColor,
			backgroundColor: tag.backgroundColor
		};
	});
	var adaptProduct = (raw) => ({
		productId: raw.productId,
		title: raw.title,
		imageUrl: raw.mainImage,
		detailUrl: raw.action,
		priceText: raw.price,
		moqText: toMoqText(raw.moqQuantity),
		tags: toTags(raw.tags)
	});
	var adaptCompany = (raw) => ({
		companyId: raw.companyId,
		companyName: raw.companyName,
		logoUrl: raw.logoUrl,
		homepageUrl: raw.action,
		goldSupplier: raw.isGoldSupplier === true,
		yearsText: toYearsText(raw.goldSupplierYears),
		locationText: toLocationText(raw.companyRegisterCity, raw.companyRegisterCountry),
		tags: toTags(raw.tags)
	});
	/**
	* 把服务端响应映射为弹层内部契约。
	* 服务端已按固定上限截断并过滤失效项，此处再 slice 一次纯属防御（契约变动时不至于撑破布局）。
	*
	* 返回 `AdaptedFavoriteData`：无论响应多脏都补齐两侧与字段，调用方无需再做空判。
	*/
	var adaptRecentFavorites = (raw) => {
		const response = raw || {};
		return {
			product: {
				totalCount: toCount(response.totalProductCount),
				list: toList(response.products).slice(0, 2).map(adaptProduct)
			},
			supplier: {
				totalCount: toCount(response.totalCompanyCount),
				list: toList(response.companies).slice(0, 2).map(adaptCompany)
			}
		};
	};
	//#endregion
	//#region node_modules/@ali/icbu-domain-transfer/lib/index.js
	var require_lib = /* @__PURE__ */ __commonJSMin(((exports) => {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.transferDomain = void 0;
		function transferDomain(domain, customHost) {
			const host = customHost || location && location.hostname;
			if (host) {
				const suffixList = host.match(/alibaba\.(.*)/);
				if (suffixList && suffixList.length > 0) return domain.replace("com", suffixList[1]);
			}
			return domain;
		}
		exports.transferDomain = transferDomain;
	}));
	//#endregion
	//#region src/url.ts
	/**
	* 收藏域名：按用户地区自动区分 us/hz（对齐 detail-fantasy PC 端与 favorite-component）。
	* require + 兜底：包不可用时退回 us 域名，不影响组件可用性。
	*/
	var getFavoriteDomain = () => {
		try {
			const { transferDomain } = require_lib();
			return transferDomain("us-favorite.alibaba.com") || "us-favorite.alibaba.com";
		} catch (_unused) {
			return FAVORITE_BASE_DOMAIN;
		}
	};
	/** 收藏夹页地址；tab='suppliers' 时深链到商家 tab */
	var getFavoriteHomeUrl = (tab) => {
		const base = `https://${getFavoriteDomain()}/favorite2/favorite_home.htm`;
		return tab === "suppliers" ? `${base}?tab=suppliers` : base;
	};
	/** 登录页地址（xman 不可用时的降级路径） */
	var getSignInUrl = (redirectUrl = getFavoriteHomeUrl()) => {
		return `https://login.alibaba.com?tracelog=header_favorite&return_url=${encodeURIComponent(redirectUrl)}`;
	};
	/**
	* 唤起登录：优先 xman 弹层（登录成功后落到收藏夹页），不可用时跳登录页。
	* 与购物车 handleLogin 保持一致。
	*/
	var signIn = (redirectUrl = getFavoriteHomeUrl()) => {
		if (typeof window === "undefined") return;
		try {
			var _window$loadXman, _window;
			const xman = (_window$loadXman = (_window = window).loadXman) === null || _window$loadXman === void 0 ? void 0 : _window$loadXman.call(_window, { signInSuccess: () => {
				window.location.href = redirectUrl;
			} });
			if (xman === null || xman === void 0 ? void 0 : xman.show) {
				xman.show();
				return;
			}
		} catch (_unused2) {}
		window.open(getSignInUrl(redirectUrl));
	};
	//#endregion
	//#region \0@oxc-project+runtime@0.144.0/helpers/esm/asyncToGenerator.js
	function asyncGeneratorStep(n, t, e, r, o, a, c) {
		try {
			var i = n[a](c), u = i.value;
		} catch (n) {
			e(n);
			return;
		}
		i.done ? t(u) : Promise.resolve(u).then(r, o);
	}
	function _asyncToGenerator(n) {
		return function() {
			var t = this, e = arguments;
			return new Promise(function(r, o) {
				var a = n.apply(t, e);
				function _next(n) {
					asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
				}
				function _throw(n) {
					asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
				}
				_next(void 0);
			});
		};
	}
	//#endregion
	//#region src/service.ts
	/**
	* header 聚合接口：一次返回品 / 商各最近 2 条 + 双侧收藏总数。
	* 无入参（条数是服务端常量，不可配），路径带 `.htm` 后缀——与 trade-favorite
	* 全部 10 个 favorite 接口的调用惯例一致（服务端 mapping 无后缀，靠
	* `WebConfiguration#setUseSuffixPatternMatch(true)` 后缀匹配支持）。
	* 响应 data 为 flat 平铺结构，统一由 adapter 映射为弹层内部契约。
	*/
	var RECENT_FAVORITES_PATH = "/favorite2/ajax/getRecentFavorites.htm";
	/**
	* 归一化业务码。服务端 `FavoriteViewResult.code` 是 Integer（JSON 数字），
	* 存量链路也可能给字符串或 null，故统一转数字后比较。
	*/
	var parseCode = (raw) => raw == null || raw === "" ? null : Number(raw);
	/**
	* 服务端 `@Verify` 前置拦截（Referer 白名单 / ctoken 校验不过）时，
	* 响应只有 result=false + 固定英文文案而 **不带 code**，
	* 需按文案归一到未登录，否则会被当系统错误降级成空态。
	*/
	var NOT_LOGIN_MESSAGES = ["must login", "invalid account"];
	var isNotLoginMessage = (message) => {
		const text = String(message || "").toLowerCase();
		return NOT_LOGIN_MESSAGES.some((keyword) => text.includes(keyword));
	};
	/**
	* 取数。JSONP 协议（跨子域，服务端 JsonpAdvice 已全局支持 callback 参数）。
	* 任何异常都不抛出，统一以 SummaryResult 表达，由调用方决定降级展示。
	*/
	var getHeaderFavoriteSummary = function() {
		var _ref = _asyncToGenerator(function* () {
			const url = `//${getFavoriteDomain()}${RECENT_FAVORITES_PATH}?_tb_token_=${getTbtoken() || ""}&ctoken=${getCtoken() || ""}`;
			try {
				const res = yield (yield (0, import_fetch_jsonp.default)(url, { timeout: REQUEST_TIMEOUT })).json();
				const code = parseCode(res === null || res === void 0 ? void 0 : res.code);
				if (code === 200) return {
					ok: true,
					data: adaptRecentFavorites(res.data)
				};
				if (code == null && isNotLoginMessage(res === null || res === void 0 ? void 0 : res.message)) return {
					ok: false,
					code: 402
				};
				return {
					ok: false,
					code
				};
			} catch (_unused) {
				return {
					ok: false,
					error: true
				};
			}
		});
		return function getHeaderFavoriteSummary() {
			return _ref.apply(this, arguments);
		};
	}();
	//#endregion
	//#region src/skeleton.tsx
	function Skeleton(props) {
		return /* @__PURE__ */ react.default.createElement("div", _objectSpread2(_objectSpread2({}, props), {}, { className: (props === null || props === void 0 ? void 0 : props.className) ? `header-favorite-loading-container ${props.className}` : "header-favorite-loading-container" }), /* @__PURE__ */ react.default.createElement("div", { className: "header-favorite-block" }), /* @__PURE__ */ react.default.createElement("div", { className: "header-favorite-block" }), /* @__PURE__ */ react.default.createElement("div", { className: "header-favorite-block" }));
	}
	//#endregion
	//#region src/index.tsx
	/** 把空态引导文案里的 {icon} 占位替换成爱心图标节点，避免前端拼接文案破坏多语言语序。
	* 分区计数的 {num} 占位由各 Section 的 title 直接 replace，不经此函数 */
	var fill = (template, value) => {
		const parts = String(template).split("{icon}");
		if (parts.length === 1) return template;
		return /* @__PURE__ */ react.default.createElement(react.default.Fragment, null, parts[0], value, parts.slice(1).join("{icon}"));
	};
	/** 曝光埋点里的状态口径：signIn / list / empty */
	var getExposureState = (state, productCount, supplierCount) => {
		if (state === "signIn") return "signIn";
		return productCount || supplierCount ? "list" : "empty";
	};
	/**
	* 页面级 SWR 缓存：面板数据在同一页面生命周期内保留一份。
	* 再次展开时先展示缓存（秒开、不闪骨架），同时后台静默重取并更新；页面刷新自动失效。
	*/
	var summaryCache = null;
	/** 清空面板缓存。接入方在用户登出 / 切换账号后调用，避免下个账号短暂看到旧数据 */
	var clearSummaryCache = () => {
		summaryCache = null;
	};
	/** 渲染异常时的降级形态：保留标题与入口，不把异常抛给 header */
	var fallbackView = () => {
		try {
			return /* @__PURE__ */ react.default.createElement("div", { className: "header-favorite" }, /* @__PURE__ */ react.default.createElement("div", { className: "favorite-title" }, /* @__PURE__ */ react.default.createElement("span", null, i18n.Title)), /* @__PURE__ */ react.default.createElement(Empty, {
				title: i18n.EmptyTitle,
				desc: fill(i18n.EmptyDesc, /* @__PURE__ */ react.default.createElement(HeartIcon, null))
			}));
		} catch (error) {
			log_default("header_favorite_error", {
				type: "render",
				msg: error === null || error === void 0 ? void 0 : error.message
			});
		}
		return null;
	};
	var HeaderFavoriteView = ({ i18n: propsI18N, login, visible = true, arrow, arrowAnchor, data: propsData }) => {
		const i18n$1 = (0, react.useMemo)(() => propsI18N ? _objectSpread2(_objectSpread2({}, i18n), propsI18N) : i18n, [propsI18N]);
		const isLogged = (0, react.useMemo)(() => typeof login === "boolean" ? login : hasWebSession(), [login]);
		const [data, setData] = (0, react.useState)(propsData || summaryCache || null);
		const [state, setState] = (0, react.useState)(() => {
			if (!isLogged) return "signIn";
			return propsData || summaryCache ? "list" : "loading";
		});
		const product = data === null || data === void 0 ? void 0 : data.product;
		const supplier = data === null || data === void 0 ? void 0 : data.supplier;
		const productCount = (product === null || product === void 0 ? void 0 : product.totalCount) || 0;
		const supplierCount = (supplier === null || supplier === void 0 ? void 0 : supplier.totalCount) || 0;
		const productList = ((product === null || product === void 0 ? void 0 : product.list) || []).slice(0, 2);
		const supplierList = ((supplier === null || supplier === void 0 ? void 0 : supplier.list) || []).slice(0, 2);
		/**
		* SWR 取数：每次展开都重新拉接口（收藏是高频写入数据，列表页/详情页随时增删），
		* 但有缓存时先展示缓存、后台静默重取并更新——实时性与秒开兼得，不再每次 hover 都闪骨架。
		* 静默重取失败保持旧数据展示；仅首次（无缓存）失败才降级空态。
		* 组件 mount 即等于弹层展开（弹层容器关闭会卸载组件）；组件常驻的接入方由 visible 翻转触发重取。
		*/
		(0, react.useEffect)(() => {
			if (!visible || !isLogged || propsData) return;
			let aborted = false;
			const hasCache = Boolean(summaryCache);
			if (!hasCache) {
				setData(null);
				setState("loading");
			}
			getHeaderFavoriteSummary().then((res) => {
				if (aborted) return;
				if (res.ok) {
					summaryCache = res.data;
					setData(res.data);
					return;
				}
				if (res.code === 402) {
					summaryCache = null;
					setState("signIn");
					return;
				}
				log_default("header_favorite_error", {
					type: "api",
					msg: res.code || "request_failed"
				});
				if (!hasCache) setData({});
			});
			return () => {
				aborted = true;
			};
		}, [
			visible,
			isLogged,
			propsData
		]);
		(0, react.useEffect)(() => {
			if (data) setState("list");
		}, [data]);
		const exposedRef = (0, react.useRef)(false);
		(0, react.useEffect)(() => {
			if (!visible) {
				exposedRef.current = false;
				return;
			}
			if (state === "loading" || exposedRef.current) return;
			exposedRef.current = true;
			log_default("header_favorite_popup_exposure", {
				state: getExposureState(state, productCount, supplierCount),
				productCount,
				supplierCount
			}, "EXP");
		}, [
			visible,
			state,
			productCount,
			supplierCount
		]);
		const panelProps = {
			arrow,
			arrowAnchor
		};
		const renderTitle = () => /* @__PURE__ */ react.default.createElement("div", { className: "favorite-title" }, /* @__PURE__ */ react.default.createElement("span", { dir: "auto" }, i18n$1.Title));
		if (state === "signIn") return /* @__PURE__ */ react.default.createElement(Panel, panelProps, renderTitle(), /* @__PURE__ */ react.default.createElement(SignIn, {
			tip: i18n$1.SignInTip,
			buttonText: i18n$1.SignIn,
			onSignIn: () => {
				log_default("header_favorite_signin_click");
				signIn();
			}
		}));
		if (state === "loading") return /* @__PURE__ */ react.default.createElement(Panel, panelProps, renderTitle(), /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-skeleton",
			"data-testid": "hf-skeleton"
		}, [0, 1].map((row) => /* @__PURE__ */ react.default.createElement("div", {
			className: "favorite-skeleton-row",
			key: row
		}, /* @__PURE__ */ react.default.createElement(Skeleton, { className: "favorite-skeleton-media" }), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-skeleton-texts" }, /* @__PURE__ */ react.default.createElement(Skeleton, { className: "favorite-skeleton-line" }), /* @__PURE__ */ react.default.createElement(Skeleton, { className: "favorite-skeleton-line favorite-skeleton-line-short" }), /* @__PURE__ */ react.default.createElement(Skeleton, { className: "favorite-skeleton-price" }))))));
		if (!productCount && !supplierCount) return /* @__PURE__ */ react.default.createElement(Panel, panelProps, renderTitle(), /* @__PURE__ */ react.default.createElement(Empty, {
			title: i18n$1.EmptyTitle,
			desc: fill(i18n$1.EmptyDesc, /* @__PURE__ */ react.default.createElement(HeartIcon, null))
		}));
		const onProductClick = (item, position) => {
			log_default("header_favorite_product_click", {
				productId: item === null || item === void 0 ? void 0 : item.productId,
				position
			});
		};
		const onSupplierClick = (item, position) => {
			log_default("header_favorite_supplier_click", {
				companyId: item === null || item === void 0 ? void 0 : item.companyId,
				position
			});
		};
		return /* @__PURE__ */ react.default.createElement(Panel, panelProps, renderTitle(), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-content" }, /* @__PURE__ */ react.default.createElement(Section, {
			testId: "hf-product-section",
			title: productCount ? String(i18n$1.ProductsWithCount).replace("{num}", String(productCount)) : i18n$1.Products,
			emptyTip: productList.length ? void 0 : fill(i18n$1.EmptyProduct, /* @__PURE__ */ react.default.createElement(HeartIcon, null)),
			showViewAll: Boolean(productCount),
			viewAllText: i18n$1.ViewAll,
			viewAllUrl: getFavoriteHomeUrl("products"),
			onViewAll: () => log_default("header_favorite_product_view_all_click", { productCount })
		}, productList.map((item, index) => /* @__PURE__ */ react.default.createElement(ProductItem, {
			key: item.productId || index,
			item,
			moqText: item.moqText,
			position: index + 1,
			onClick: onProductClick
		}))), /* @__PURE__ */ react.default.createElement("div", { className: "favorite-divider" }), /* @__PURE__ */ react.default.createElement(Section, {
			testId: "hf-supplier-section",
			title: supplierCount ? String(i18n$1.SuppliersWithCount).replace("{num}", String(supplierCount)) : i18n$1.Suppliers,
			emptyTip: supplierList.length ? void 0 : fill(i18n$1.EmptySupplier, /* @__PURE__ */ react.default.createElement(HeartIcon, null)),
			showViewAll: Boolean(supplierCount),
			viewAllText: i18n$1.ViewAll,
			viewAllUrl: getFavoriteHomeUrl("suppliers"),
			onViewAll: () => log_default("header_favorite_supplier_view_all_click", { supplierCount })
		}, supplierList.map((item, index) => /* @__PURE__ */ react.default.createElement(SupplierItem, {
			key: item.companyId || index,
			item,
			position: index + 1,
			onClick: onSupplierClick
		})))));
	};
	/**
	* 弹层组件。命名导出必须保留 —— 接入方按 window.HeaderFavorite.HeaderFavorite 取组件。
	* 断言恢复 props 类型（HOC 内部不带泛型，原因见 react-try-catch-render.ts）。
	*/
	var HeaderFavorite = react_try_catch_render_default({
		blockName: "header-favorite",
		errorRenderComponent: fallbackView
	})(HeaderFavoriteView);
	//#endregion
	exports.HeaderFavorite = HeaderFavorite;
	exports.default = HeaderFavorite;
	exports.clearSummaryCache = clearSummaryCache;
	exports.getFavoriteHomeUrl = getFavoriteHomeUrl;
	exports.getSignInUrl = getSignInUrl;
	exports.signIn = signIn;
});
