import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Elapsed-second timer for PDF generation. Always clears previous intervals
 * so repeat clicks cannot leave a runaway counter.
 */
export function useGenerationTimer() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    setElapsedTime(0);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      if (startRef.current) {
        setElapsedTime(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);
  }, [stop]);

  const finishElapsed = useCallback(() => {
    const seconds = startRef.current
      ? Math.floor((Date.now() - startRef.current) / 1000)
      : 0;
    stop();
    return seconds;
  }, [stop]);

  useEffect(() => () => stop(), [stop]);

  return { elapsedTime, start, stop, finishElapsed };
}
