import { useEffect, useState } from "react";

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 560 || window.innerHeight < 850);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 560 || window.innerHeight < 850);
    };

    window.addEventListener("resize", handleResize);
  });

  return [isMobile];
}
