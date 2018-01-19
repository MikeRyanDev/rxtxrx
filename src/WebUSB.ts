export interface TransferResult {
  status: string;
  data: DataView;
}

export interface UsbDeviceFilter {
  productId: number;
  vendorId: number;
}

export interface UsbDevice {
  configuration: any;
  transferIn(endpoint: number, bytes: number): Promise<TransferResult>;
  open(): Promise<void>;
  selectConfiguration(configNumber: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  selectAlternateInterface(a: number, b: number): Promise<void>;
  controlTransferOut(obj: any): Promise<void>;
  transferOut(interfaceNumber: number, data: ArrayBuffer): Promise<void>;
  close(): Promise<void>;
}

export interface Usb extends EventTarget {
  getDevices(): Promise<UsbDevice[]>;
  requestDevice(options: { filters: UsbDeviceFilter[] }): Promise<UsbDevice>;
}
