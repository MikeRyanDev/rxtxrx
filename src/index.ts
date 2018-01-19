import * as SerialPort from 'serialport';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { SerialConnectionFactory, SerialMessage } from './api';
import { UsbDeviceFilter } from './WebUSB';

export const createSerialConnection: SerialConnectionFactory = (
  messages: Observable<Buffer>,
  options: {
    path: string;
    baudRate: number;
    deviceFilters: UsbDeviceFilter[];
  },
): Observable<SerialMessage> => {
  return new Observable((observer: Observer<SerialMessage>) => {
    const inputSubscription = new Subscription();

    const port = new SerialPort(options.path, {
      baudRate: options.baudRate,
    });

    port.on('open', () => {
      observer.next({ type: 'open' });
      inputSubscription.add(
        messages.subscribe(data => {
          port.write(data);
        }),
      );
    });

    port.on('data', (data: Buffer) => {
      observer.next({
        type: 'data',
        data,
      });
    });

    port.on('close', () => {
      observer.next({ type: 'close' });
    });

    return () => {
      inputSubscription.unsubscribe();
      port.close();
    };
  });
};
