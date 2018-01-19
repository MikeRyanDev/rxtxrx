"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var Subscription_1 = require("rxjs/Subscription");
var buffer_1 = require("buffer");
global.Buffer = buffer_1.Buffer;
exports.createSerialConnection = function (messages, options) {
    return new Observable_1.Observable(function (observer) {
        var inputSubscription = new Subscription_1.Subscription();
        var shouldRead = true;
        var usbDevice;
        navigator.usb
            .requestDevice({ filters: options.deviceFilters })
            .then(function (device) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var read;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, device.open()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, device.selectConfiguration(1)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, device.claimInterface(2)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, device.selectAlternateInterface(2, 0)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, device.controlTransferOut({
                                requestType: 'class',
                                recipient: 'interface',
                                request: 0x22,
                                value: 0x01,
                                index: 0x02,
                            })];
                    case 5:
                        _a.sent();
                        observer.next({
                            type: 'open',
                        });
                        usbDevice = device;
                        read = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, status_1, data;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!shouldRead) return [3 /*break*/, 2];
                                        return [4 /*yield*/, device.transferIn(5, 64)];
                                    case 1:
                                        _a = _b.sent(), status_1 = _a.status, data = _a.data;
                                        observer.next({
                                            type: 'data',
                                            data: toBuffer(data.buffer),
                                        });
                                        read();
                                        _b.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); };
                        read();
                        inputSubscription.add(messages.subscribe(function (out) {
                            var arr = new Uint8Array(Array.from(out));
                            device.transferOut(4, toArrayBuffer(out));
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
        return function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inputSubscription.unsubscribe();
                        shouldRead = false;
                        if (!usbDevice) return [3 /*break*/, 3];
                        return [4 /*yield*/, usbDevice.controlTransferOut({
                                requestType: 'class',
                                recipient: 'interface',
                                request: 0x22,
                                value: 0x00,
                                index: 0x02,
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, usbDevice.close()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    });
};
function toArrayBuffer(buffer) {
    var arrayBuffer = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buffer.length; i++) {
        view[i] = buffer[i];
    }
    return arrayBuffer;
}
function toBuffer(arrayBuffer) {
    var buffer = new buffer_1.Buffer(arrayBuffer.byteLength);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buffer.length; i++) {
        buffer[i] = view[i];
    }
    return buffer;
}
//# sourceMappingURL=browser.js.map