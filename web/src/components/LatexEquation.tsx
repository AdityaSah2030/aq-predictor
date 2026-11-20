import React, { useEffect, useRef } from "react";
import katex from "katex";

interface LatexEquationProps {
  math: string;
  block?: boolean;
}

export const LatexEquation: React.FC<LatexEquationProps> = ({ math, block = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false
        });
      } catch (err) {
        console.error("KaTeX rendering error:", err);
      }
    }
  }, [math, block]);

  return <div ref={containerRef} className={block ? "katex-display-scroll" : ""} />;
};
