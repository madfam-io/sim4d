import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
  loop?: boolean;
}

export function TypewriterText({
  words,
  className = '',
  typeSpeed = 100,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
  loop = true,
}: TypewriterTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[currentWordIndex];

    const timeout = setTimeout(
      () => {
        if (isWaiting) {
          setIsWaiting(false);
          setIsDeleting(true);
          return;
        }

        if (!isDeleting) {
          // Typing
          if (currentText.length < currentWord.length) {
            setCurrentText(currentWord.slice(0, currentText.length + 1));
          } else {
            // Finished typing, wait before deleting
            setIsWaiting(true);
          }
        } else {
          // Deleting
          if (currentText.length > 0) {
            setCurrentText(currentText.slice(0, -1));
          } else {
            // Finished deleting, move to next word
            setIsDeleting(false);
            if (loop || currentWordIndex < words.length - 1) {
              setCurrentWordIndex((prev) => (prev + 1) % words.length);
            }
          }
        }
      },
      isWaiting ? delayBetweenWords : isDeleting ? deleteSpeed : typeSpeed
    );

    return () => clearTimeout(timeout);
  }, [
    currentText,
    currentWordIndex,
    isDeleting,
    isWaiting,
    words,
    typeSpeed,
    deleteSpeed,
    delayBetweenWords,
    loop,
  ]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
