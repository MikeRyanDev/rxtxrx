import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subscription } from 'rxjs/Subscription';
import { Usb, UsbDevice } from './WebUSB';
import { Buffer } from 'buffer';
import { SerialConnectionFactory, SerialMessage } from './api';

global.Buffer = Buffer;

export const createSerialConnection: SerialConnectionFactory = (
  messages: Observable<Buffer>,
  options: {
    path: string;
    baudRate: number;
    deviceFilters: { productId: number; vendorId: number }[];
  },
): Observable<SerialMessage> => {
  return new Observable((observer: Observer<SerialMessage>) => {
    const inputSubscription = new Subscription();
    let shouldRead = true;
    let usbDevice: UsbDevice;

    ((navigator as any).usb as Usb)
      .requestDevice({ filters: options.deviceFilters })
      .then(async device => {
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(2);
        await device.selectAlternateInterface(2, 0);
        await device.controlTransferOut({
          requestType: 'class',
          recipient: 'interface',
          request: 0x22,
          value: 0x01,
          index: 0x02,
        });

        observer.next({
          type: 'open',
        });

        usbDevice = device;

        const read = async () => {
          if (shouldRead) {
            const { status, data } = await device.transferIn(5, 64);

            observer.next({
              type: 'data',
              data: toBuffer(data.buffer),
            });

            read();
          }
        };

        read();

        inputSubscription.add(
          messages.subscribe(out => {
            device.transferOut(4, toArrayBuffer(out));
          }),
        );
      });

    return async () => {
      inputSubscription.unsubscribe();
      shouldRead = false;

      if (usbDevice) {
        await usbDevice.controlTransferOut({
          requestType: 'class',
          recipient: 'interface',
          request: 0x22,
          value: 0x00,
          index: 0x02,
        });
        await usbDevice.close();
      }
    };
  });
};

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; i++) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}

function toBuffer(arrayBuffer: ArrayBuffer) {
  const buffer = new Buffer(arrayBuffer.byteLength);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = view[i];
  }
  return buffer;
}
