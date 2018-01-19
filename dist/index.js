"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SerialPort = require("serialport");
var Observable_1 = require("rxjs/Observable");
var Subscription_1 = require("rxjs/Subscription");
exports.createSerialConnection = function (messages, options) {
    return new Observable_1.Observable(function (observer) {
        var inputSubscription = new Subscription_1.Subscription();
        var port = new SerialPort(options.path, {
            baudRate: options.baudRate,
        });
        port.on('open', function () {
            observer.next({ type: 'open' });
            inputSubscription.add(messages.subscribe(function (data) {
                port.write(data);
            }));
        });
        port.on('data', function (data) {
            observer.next({
                type: 'data',
                data: data,
            });
        });
        port.on('close', function () {
            observer.next({ type: 'close' });
        });
        return function () {
            inputSubscription.unsubscribe();
            port.close();
        };
    });
};
//# sourceMappingURL=index.js.map