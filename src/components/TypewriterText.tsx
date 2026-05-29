import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, TextProps } from 'react-native';

interface TypewriterTextProps extends TextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  startDelay?: number;
  typingDelay?: number; // Initial delay before typing starts
}

export default function TypewriterText({
  text,
  speed = 40,
  onComplete,
  startDelay = 0,
  typingDelay = 0,
  style,
  ...rest
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const index = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store onComplete in a ref to avoid dependency-loop restarts
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    index.current = 0;
    setIsTyping(false);

    let initialTimer: ReturnType<typeof setTimeout>;

    const startTyping = () => {
      setIsTyping(true);
    };

    initialTimer = setTimeout(startTyping, startDelay + typingDelay);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, startDelay, typingDelay]);

  useEffect(() => {
    if (isTyping && index.current < text.length) {
      timerRef.current = setTimeout(() => {
        index.current += 1;
        setDisplayedText(text.slice(0, index.current));
      }, speed);
    } else if (isTyping && index.current >= text.length) {
      setIsTyping(false);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // Removed onComplete from deps — using ref instead to prevent infinite loop
  }, [isTyping, displayedText, text, speed]);

  return (
    <Text style={style} {...rest}>
      {displayedText}
    </Text>
  );
}
