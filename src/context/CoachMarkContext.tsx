import React from 'react';
import { findNodeHandle, ScrollView, View, ViewProps } from 'react-native';

export interface CoachTargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CoachMarkContextValue {
  activeTarget?: string;
  setTargetRect: (rect: CoachTargetRect | null) => void;
}

const CoachMarkContext = React.createContext<CoachMarkContextValue>({
  setTargetRect: () => undefined,
});

export function CoachMarkProvider({
  activeTarget,
  setTargetRect,
  children,
}: CoachMarkContextValue & { children: React.ReactNode }) {
  const value = React.useMemo(
    () => ({ activeTarget, setTargetRect }),
    [activeTarget, setTargetRect],
  );
  return <CoachMarkContext.Provider value={value}>{children}</CoachMarkContext.Provider>;
}

export function useCoachMark() {
  return React.useContext(CoachMarkContext);
}

interface CoachTargetProps extends ViewProps {
  id: string;
  scrollRef?: React.RefObject<React.ComponentRef<typeof ScrollView> | null>;
  children: React.ReactNode;
}

export function CoachTarget({ id, scrollRef, children, onLayout, style, ...props }: CoachTargetProps) {
  const { activeTarget, setTargetRect } = useCoachMark();
  const ref = React.useRef<React.ComponentRef<typeof View>>(null);
  const active = activeTarget === id;

  const measure = React.useCallback(() => {
    requestAnimationFrame(() => {
      ref.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) setTargetRect({ x, y, width, height });
      });
    });
  }, [setTargetRect]);

  React.useEffect(() => {
    if (!active) return;
    const scrollNode = scrollRef?.current;
    const targetNode = ref.current;
    if (scrollNode && targetNode) {
      const scrollHandle = findNodeHandle(scrollNode);
      if (scrollHandle) {
        targetNode.measureLayout(
          scrollHandle,
          (_x, y) => {
            scrollNode.scrollTo({ y: Math.max(0, y - 24), animated: true });
            setTimeout(measure, 350);
          },
          measure,
        );
        return;
      }
    }
    measure();
  }, [active, measure, scrollRef]);

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={(event) => {
        onLayout?.(event);
        if (active) measure();
      }}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}
