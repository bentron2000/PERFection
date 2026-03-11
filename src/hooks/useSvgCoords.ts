import { useCallback, type RefObject } from "react";

export function useSvgCoords(svgRef: RefObject<SVGSVGElement | null>) {
  return useCallback(
    (e: MouseEvent | React.MouseEvent): [number, number] => {
      const svg = svgRef.current;
      if (!svg) return [0, 0];
      const r = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      return [
        (e.clientX - r.left) * (vb.width / r.width),
        (e.clientY - r.top) * (vb.height / r.height),
      ];
    },
    [svgRef]
  );
}
