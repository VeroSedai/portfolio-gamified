
import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  isDialogueVisibleAtom,
  dialogueContentAtom,
  currentNpcNameAtom,
  dialoguePositionAtom
} from "../stores";

const DialogueBox = () => {
  const [isVisible, setIsVisible] = useAtom(isDialogueVisibleAtom);
  const [content] = useAtom(dialogueContentAtom);
  const [npcName] = useAtom(currentNpcNameAtom);
  const [pos] = useAtom(dialoguePositionAtom);
  
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  // Reset when opened
  useEffect(() => {
    if (isVisible) {
      setLineIndex(0);
      setDisplayedText("");
      setCharIndex(0);
    }
  }, [isVisible, content]);

  // Typewriter Effect
  useEffect(() => {
    if (!isVisible || !content || content.length === 0) return;

    const currentLine = content[lineIndex];
    if (charIndex < currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + currentLine[charIndex]);
        setCharIndex(prev => prev + 1);
      }, 30); // Speed of typing
      return () => clearTimeout(timeout);
    }
  }, [charIndex, lineIndex, isVisible, content]);

  const handleNext = () => {
    const currentLine = content[lineIndex];

    // If still typing, complete immediately
    if (charIndex < currentLine.length) {
        setDisplayedText(currentLine);
        setCharIndex(currentLine.length);
        return;
    }

    // Go to next line or close
    if (lineIndex < content.length - 1) {
      setLineIndex(prev => prev + 1);
      setDisplayedText("");
      setCharIndex(0);
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="dialogue-box"
      style={{ top: pos.y - 60, left: pos.x, width: "300px" }}
      onClick={handleNext}
    >
      <div className="npc-label">
        {npcName}
      </div>
      <p className="dialogue-text">
        {displayedText}
         <span className="cursor">|</span>
      </p>
      <div className="hint-text">
        [TAP]
      </div>
      
      {/* Speech Bubble Arrow */}
      <div className="speech-arrow"></div>
    </div>
  );
};

export default DialogueBox;
