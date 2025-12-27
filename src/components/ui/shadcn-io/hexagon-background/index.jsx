'use client';
import * as React from 'react';

import { cn } from '../../../../lib/utils';

function HexagonBackground({
  className,
  children,
  hexagonProps,
  hexagonSize = 75,
  hexagonMargin = 3,
  ...props
}) {
  const hexagonWidth = React.useMemo(() => hexagonSize, [hexagonSize]);
  const hexagonHeight = React.useMemo(() => hexagonSize * 1.1, [hexagonSize]);
  const rowSpacing = React.useMemo(() => hexagonSize * 0.8, [hexagonSize]);
  const baseMarginTop = React.useMemo(() => -36 - 0.275 * (hexagonSize - 100), [hexagonSize]);
  const computedMarginTop = React.useMemo(() => baseMarginTop + hexagonMargin, [baseMarginTop, hexagonMargin]);
  const oddRowMarginLeft = React.useMemo(() => -(hexagonSize / 2), [hexagonSize]);
  const evenRowMarginLeft = React.useMemo(() => hexagonMargin / 2, [hexagonMargin]);

  const [gridDimensions, setGridDimensions] = React.useState({
    rows: 0,
    columns: 0,
  });

  React.useEffect(() => {
    const updateGridDimensions = () => {
      if (typeof window === 'undefined') return;
      const rows = Math.ceil(window.innerHeight / rowSpacing);
      const columns = Math.ceil(window.innerWidth / hexagonWidth) + 1;
      setGridDimensions(prev => {
        if (prev.rows === rows && prev.columns === columns) return prev;
        return { rows, columns };
      });
    };

    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);
    return () => window.removeEventListener('resize', updateGridDimensions);
  }, [rowSpacing, hexagonWidth]);

  return (
    <div
      data-slot="hexagon-background"
      className={cn(
        'relative w-full h-full overflow-hidden',
        className
      )}
      {...props}>
      <style>{`:root { --hexagon-margin: ${hexagonMargin}px; }`}</style>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {Array.from({ length: Math.max(gridDimensions.rows, 1) }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            style={{
              marginTop: computedMarginTop,
              marginLeft:
                ((rowIndex + 1) % 2 === 0
                  ? evenRowMarginLeft
                  : oddRowMarginLeft) - 10,
            }}
            className="inline-flex">
            {Array.from({ length: Math.max(gridDimensions.columns, 1) }).map((_, colIndex) => (
              <div
                key={`hexagon-${rowIndex}-${colIndex}`}
                {...hexagonProps}
                style={{
                  width: hexagonWidth,
                  height: hexagonHeight,
                  marginLeft: hexagonMargin,
                  ...hexagonProps?.style,
                }}
                className={cn(
                  'relative cursor-pointer group',
                  '[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]',
                  "before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:opacity-100 before:transition-colors before:duration-300",
                  "after:content-[''] after:absolute after:inset-[var(--hexagon-margin)] after:bg-white after:transition-colors after:duration-300",
                  'after:[clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)]',
                  'group-hover:before:bg-gray-200 group-hover:after:bg-gray-100',
                  hexagonProps?.className
                )} />
            ))}
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

export { HexagonBackground };