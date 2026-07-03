import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, RotateCcw, Award, Play, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Passage {
  id: string;
  title: string;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const PASSAGES: Passage[] = [
  {
    id: '1',
    title: 'The Sprinting Mind',
    text: 'Typing is a skill of coordination where muscle memory meets rapid thought. When you type, your fingers glide across the keys as if playing a piano. Practice builds speed, but consistency builds precision. Every keystroke is a silent whisper in the digital ocean of letters, words, and thoughts.',
    difficulty: 'Easy',
  },
  {
    id: '2',
    title: 'A Tale of Technology',
    text: 'Modern computers operate on billions of tiny transistors firing at the speed of light. Writing code is the modern equivalent of magic, turning ideas into logical paths that shape our everyday world. From the simplest loop to complex AI networks, technology is the ultimate magnifier of human potential and design.',
    difficulty: 'Medium',
  },
  {
    id: '3',
    title: 'The Great Exploration',
    text: 'In the depth of space, countless celestial bodies dance in a cosmic choreography governed by gravitational forces. Stars burn through billions of years of nuclear fusion, scattering heavy elements across the void to eventually form planets, oceans, and living organisms. We are, quite literally, stardust exploring the universe.',
    difficulty: 'Hard',
  }
];

export default function App() {
  const [selectedPassage, setSelectedPassage] = useState<Passage>(PASSAGES[0]);
  const [inputText, setInputText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [keyHits, setKeyHits] = useState<Record<string, boolean>>({});
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [highScores, setHighScores] = useState<{ title: string; wpm: number; accuracy: number }[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus the input area
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Load high scores from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('typesprint_high_scores');
      if (saved) {
        setHighScores(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save high score
  const saveHighScore = useCallback((wpmScore: number, accScore: number, title: string) => {
    try {
      const newScore = { title, wpm: wpmScore, accuracy: accScore };
      const updated = [newScore, ...highScores].slice(0, 5);
      setHighScores(updated);
      localStorage.setItem('typesprint_high_scores', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }, [highScores]);

  // Handle key down for custom virtual keyboard highlighting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeyHits(prev => ({ ...prev, [key]: true }));
      // Automatically focus on typing if not finished
      if (!isFinished && document.activeElement !== inputRef.current) {
        focusInput();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeyHits(prev => ({ ...prev, [key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFinished, focusInput]);

  // Main input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (isFinished) return;

    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // Limit input length to the size of target text
    if (value.length <= selectedPassage.text.length) {
      setInputText(value);

      // Compute stats
      let correct = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === selectedPassage.text[i]) {
          correct++;
        }
      }
      setCorrectChars(correct);
      setTotalChars(value.length);

      const acc = value.length > 0 ? Math.round((correct / value.length) * 100) : 100;
      setAccuracy(acc);

      // If typed everything, complete
      if (value.length === selectedPassage.text.length) {
        handleFinish(correct, value.length);
      }
    }
  };

  // Timer loop
  useEffect(() => {
    if (isStarted && !isFinished && startTime !== null) {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedTime(Math.round(elapsed));

        // Calculate current WPM (Standard: 5 characters = 1 word)
        if (elapsed > 1) {
          const wordsTyped = totalChars / 5;
          const currentWpm = Math.round((wordsTyped / elapsed) * 60);
          setWpm(currentWpm);
        }
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isStarted, isFinished, startTime, totalChars]);

  const handleFinish = (correct: number, total: number) => {
    setIsFinished(true);
    if (startTime !== null) {
      const finalTime = Math.max((Date.now() - startTime) / 1000, 1);
      const finalWpm = Math.round(((total / 5) / finalTime) * 60);
      const finalAcc = total > 0 ? Math.round((correct / total) * 100) : 100;
      setWpm(finalWpm);
      setAccuracy(finalAcc);
      saveHighScore(finalWpm, finalAcc, selectedPassage.title);
    }
  };

  const handleReset = () => {
    setInputText('');
    setIsStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setTotalChars(0);
    setCorrectChars(0);
    setTimeout(focusInput, 50);
  };

  const handlePassageSelect = (passage: Passage) => {
    setSelectedPassage(passage);
    setInputText('');
    setIsStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setTotalChars(0);
    setCorrectChars(0);
    setTimeout(focusInput, 50);
  };

  // Render passage characters with color status
  const renderPassage = () => {
    const text = selectedPassage.text;
    return text.split('').map((char, index) => {
      let charClass = 'char-untyped transition-all duration-150 border-b-2 border-transparent';
      if (index < inputText.length) {
        charClass = inputText[index] === char ? 'char-correct font-semibold' : 'char-incorrect font-semibold';
      } else if (index === inputText.length) {
        charClass = 'char-untyped word-current bg-teal-500/10 text-white border-b-2 border-[#03dac5] animate-pulse';
      }

      // Format space visual representation
      const displayChar = char === ' ' ? '␣' : char;

      return (
        <span key={index} className={`${charClass} text-[15px] sm:text-[18px] md:text-[20px] font-mono leading-relaxed px-[1px]`}>
          {displayChar}
        </span>
      );
    });
  };

  // Virtual Keyboard rows
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <div id="react-typing-app" className="min-h-screen bg-[#121214] text-gray-100 flex flex-col justify-between select-none">
      
      {/* Top Header */}
      <header className="border-b border-gray-800 bg-[#17171a] py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#03dac5]/10 p-2 rounded-lg border border-[#03dac5]/30">
            <Keyboard className="w-6 h-6 text-[#03dac5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              TypeSprint <span className="text-xs bg-[#03dac5]/10 text-[#03dac5] px-2 py-0.5 rounded-full border border-[#03dac5]/20">PRO</span>
            </h1>
            <p className="text-[11px] text-gray-400">Master mechanical accuracy</p>
          </div>
        </div>
        
        {/* Difficulty Selectors */}
        <div className="flex gap-1 bg-[#1e1e24] p-1 rounded-lg border border-gray-800">
          {PASSAGES.map(p => (
            <button
              key={p.id}
              onClick={() => handlePassageSelect(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                selectedPassage.id === p.id
                  ? 'bg-[#03dac5] text-[#121214] shadow-md shadow-[#03dac5]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.difficulty}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center gap-6">
        
        {/* Real-time metrics bar */}
        <div className="grid grid-cols-4 gap-3 bg-[#17171a] p-4 rounded-xl border border-gray-800 shadow-xl">
          <div className="flex flex-col items-center p-2 bg-[#1e1e24] rounded-lg border border-gray-800/80">
            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-mono">Speed</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">{wpm}</span>
              <span className="text-[10px] text-[#03dac5] font-semibold">WPM</span>
            </div>
          </div>

          <div className="flex flex-col items-center p-2 bg-[#1e1e24] rounded-lg border border-gray-800/80">
            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-mono">Accuracy</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#03dac5]">{accuracy}</span>
              <span className="text-[10px] text-gray-400 font-semibold">%</span>
            </div>
          </div>

          <div className="flex flex-col items-center p-2 bg-[#1e1e24] rounded-lg border border-gray-800/80">
            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-mono">Time</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">{elapsedTime}</span>
              <span className="text-[10px] text-gray-400 font-semibold">SEC</span>
            </div>
          </div>

          <div className="flex flex-col items-center p-2 bg-[#1e1e24] rounded-lg border border-gray-800/80">
            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-mono">Progress</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-white">{inputText.length}</span>
              <span className="text-[10px] text-gray-500">/{selectedPassage.text.length}</span>
            </div>
          </div>
        </div>

        {/* Text Area Card */}
        <div 
          onClick={focusInput}
          className="relative bg-[#17171a] p-6 rounded-2xl border border-gray-800 shadow-2xl min-h-[160px] sm:min-h-[200px] flex flex-col justify-center cursor-text hover:border-gray-700 transition-all duration-300"
        >
          {/* Difficulty indicator label */}
          <div className="absolute top-3 left-4 text-[10px] uppercase tracking-wider text-[#03dac5] bg-[#03dac5]/5 px-2.5 py-0.5 rounded-md border border-[#03dac5]/10 font-bold font-mono">
            Passage: {selectedPassage.title}
          </div>

          {/* Render target text with typing styles */}
          <div className="mt-4 mb-2 select-none relative z-10 break-words pr-2">
            {renderPassage()}
          </div>

          {/* Real hidden textbox capture */}
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleInputChange}
            disabled={isFinished}
            className="absolute inset-0 w-full h-full opacity-0 cursor-text pointer-events-auto resize-none"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            data-testid="typing-input"
          />

          {!isStarted && !isFinished && (
            <div className="absolute inset-0 bg-[#121214]/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-20 transition-all duration-300">
              <div className="flex flex-col items-center gap-2 text-center bg-[#1e1e24] px-6 py-4 rounded-xl border border-gray-800 shadow-xl max-w-xs animate-bounce">
                <Play className="w-6 h-6 text-[#03dac5]" />
                <span className="text-sm font-bold text-white">Start typing to begin practice</span>
                <span className="text-xs text-gray-400">Your timer starts on first keystroke</span>
              </div>
            </div>
          )}
        </div>

        {/* Finished Results Board */}
        {isFinished && (
          <div className="bg-gradient-to-br from-[#1e1e24] to-[#141418] p-6 rounded-2xl border-2 border-[#03dac5] shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute -right-12 -top-12 bg-[#03dac5]/10 w-40 h-40 rounded-full blur-3xl"></div>
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-[#03dac5] animate-pulse" />
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Practice Completed! <Sparkles className="w-4 h-4 text-[#03dac5]" />
              </h2>
            </div>
            
            <p className="text-sm text-gray-400 mb-5">
              Fantastic sprint! Here is a summary of your key stroke measurements:
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#121214] p-3.5 rounded-xl border border-gray-800/80 flex flex-col items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Speed</span>
                <span className="text-3xl font-black font-mono text-[#03dac5] mt-1">{wpm}</span>
                <span className="text-[10px] text-gray-400 font-bold">WPM</span>
              </div>
              <div className="bg-[#121214] p-3.5 rounded-xl border border-gray-800/80 flex flex-col items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Accuracy</span>
                <span className="text-3xl font-black font-mono text-white mt-1">{accuracy}%</span>
                <span className="text-[10px] text-gray-400 font-bold">Correctness</span>
              </div>
              <div className="bg-[#121214] p-3.5 rounded-xl border border-gray-800/80 flex flex-col items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Duration</span>
                <span className="text-3xl font-black font-mono text-white mt-1">{elapsedTime}</span>
                <span className="text-[10px] text-gray-400 font-bold">Seconds</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-[#03dac5] text-[#121214] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#03dac5]/90 active:scale-95 transition-all shadow-lg shadow-[#03dac5]/10"
              >
                <RotateCcw className="w-4 h-4" /> Restart Test
              </button>
            </div>
          </div>
        )}

        {/* Keyboard layout viz */}
        <div className="bg-[#17171a] p-4 rounded-xl border border-gray-800 flex flex-col gap-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold mb-1">
            <Keyboard className="w-4 h-4 text-[#03dac5]" /> Virtual Layout Monitor
          </div>
          {keyboardRows.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5">
              {row.map(char => {
                const isActive = !!keyHits[char];
                return (
                  <span
                    key={char}
                    className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-xs font-bold font-mono transition-all duration-75 uppercase border ${
                      isActive
                        ? 'bg-[#03dac5] text-[#121214] border-[#03dac5] scale-95 shadow-md shadow-[#03dac5]/20'
                        : 'bg-[#1e1e24] text-gray-400 border-gray-800'
                    }`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center gap-1.5 mt-0.5">
            <span
              className={`h-7 w-28 sm:h-10 sm:w-44 rounded-md flex items-center justify-center text-xs font-bold font-mono transition-all duration-75 uppercase border ${
                !!keyHits[' ']
                  ? 'bg-[#03dac5] text-[#121214] border-[#03dac5] scale-95 shadow-md shadow-[#03dac5]/20'
                  : 'bg-[#1e1e24] text-gray-400 border-gray-800'
              }`}
            >
              Space
            </span>
          </div>
        </div>

        {/* Control actions */}
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="flex-1 bg-[#1e1e24] text-white border border-gray-800 hover:border-gray-700 hover:bg-[#25252c] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset Practice
          </button>
        </div>

        {/* High score panels */}
        {highScores.length > 0 && (
          <div className="bg-[#17171a] p-4 rounded-xl border border-gray-800 shadow-md">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#03dac5]" /> Recent Sprint Highs
            </h3>
            <div className="flex flex-col gap-2">
              {highScores.map((score, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-[#1e1e24]/60 p-2 rounded-lg border border-gray-800">
                  <span className="font-medium text-white">{score.title}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#03dac5] font-bold">{score.wpm} WPM</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-400">{score.accuracy}% Acc</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer metadata details */}
      <footer className="border-t border-gray-800 py-3.5 bg-[#17171a] text-center text-[11px] text-gray-500 font-medium font-mono">
        TypeSprint App • Web practice module v1.0.0
      </footer>

    </div>
  );
}
