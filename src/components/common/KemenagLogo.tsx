import { useState } from "react";

export function KemenagLogo({ className = "w-16 h-16" }: { className?: string }) {
  const [imgSrc, setImgSrc] = useState("/logokemenag.svg");

  return (
    <img
      src={imgSrc}
      alt="Logo Kemenag RI"
      className={`object-contain shrink-0 ${className}`}
      onError={() => {
        if (imgSrc !== "/logomts.png") {
          setImgSrc("/logomts.png");
        }
      }}
    />
  );
}
