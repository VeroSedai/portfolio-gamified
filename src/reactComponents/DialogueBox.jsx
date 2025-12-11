
import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import {
  isDialogueVisibleAtom,
  dialogueContentAtom,
  currentNpcNameAtom,
  dialoguePositionAtom,
  dialogueOptionsAtom,
  dialogueActionAtom,
  activeMiniGameAtom,
  sfxTriggerAtom,
  currentNpcSoundAtom,
  store
} from "../stores";

const DialogueBox = () => {
  const [isVisible, setIsVisible] = useAtom(isDialogueVisibleAtom);
  const [content] = useAtom(dialogueContentAtom);
  const [npcName] = useAtom(currentNpcNameAtom);
  const [pos] = useAtom(dialoguePositionAtom);
  const [options] = useAtom(dialogueOptionsAtom);
  const [action] = useAtom(dialogueActionAtom);
  const [npcSound] = useAtom(currentNpcSoundAtom);
  
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

  // Reset when opened
  useEffect(() => {
    if (isVisible) {
      setLineIndex(0);
      setDisplayedText("");
      setCharIndex(0);
      setIsOptionsVisible(false);
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

        // Logic to "follow the words":
        // Play sound if start of a word (charIndex=0 or prev is space)
        // OR every 3rd character for long words to keep rhythm
        const isStartOfWord = charIndex === 0 || currentLine[charIndex - 1] === " ";
        const isLongWordRhythm = charIndex % 3 === 0 && currentLine[charIndex] !== " ";

        if (isStartOfWord || isLongWordRhythm) {
           store.set(sfxTriggerAtom, { 
               name: npcSound || "talk", 
               id: Math.random(),
               options: {
                   detune: Math.floor(Math.random() * 200) - 100, // Random pitch variation +/- 100 cents
                   speed: 0.9 + Math.random() * 0.2 // Slight speed variation
               }
           });
        }
      }, 30); // Speed of typing
      return () => clearTimeout(timeout);
    } else {
        // Line finished, check if it's the last line and we have options
        if (lineIndex === content.length - 1 && options) {
            setIsOptionsVisible(true);
        }
    }
  }, [charIndex, lineIndex, isVisible, content, options]);

  const handleNext = () => {
    if (isOptionsVisible) return; // Don't advance if options are shown

    const currentLine = content[lineIndex];

    // If still typing, complete immediately
    if (charIndex < currentLine.length) {
        setDisplayedText(currentLine);
        setCharIndex(currentLine.length);
        if (lineIndex === content.length - 1 && options) setIsOptionsVisible(true);
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

  const handleOption = (choice) => {
      if (choice === "yes") {
          if (action === "START_MATRIX_GAME") {
              store.set(activeMiniGameAtom, "matrix");
          }
          setIsVisible(false);
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

      {/* Options Buttons */}
      {isOptionsVisible && options ? (
        <div className="dialogue-options">
            <button className="option-btn" onClick={() => handleOption("yes")}>{options.yes}</button>
            <button className="option-btn" onClick={() => handleOption("no")}>{options.no}</button>
        </div>
      ) : (
        <div className="hint-text">
            [TAP]
        </div>
      )}
      
      {/* Speech Bubble Arrow */}
      <div className="speech-arrow"></div>
    </div>
  );
};

export default DialogueBox;
