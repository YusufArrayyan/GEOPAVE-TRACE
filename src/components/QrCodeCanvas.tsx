import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  value,
  size = 180,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#131836',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400 ${className}`}
      >
        Memuat QR...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code ${value}`}
      width={size}
      height={size}
      className={`rounded-lg select-none ${className}`}
    />
  );
};

export async function generateQrPngDataUrl(value: string, size = 512): Promise<string> {
  return QRCode.toDataURL(value, {
    width: size,
    margin: 2,
    color: {
      dark: '#131836',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}

export async function generateQrSvgString(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#131836',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}
