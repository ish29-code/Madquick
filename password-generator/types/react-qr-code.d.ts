declare module 'react-qr-code' {
  import * as React from 'react';
  interface QRCodeProps extends React.SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    title?: string;
  }
  const QRCode: React.FC<QRCodeProps>;
  export default QRCode;
}
