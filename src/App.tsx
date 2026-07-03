import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard, Award, Activity, Settings, Bluetooth, Usb, Wifi, Battery, 
  BookOpen, Smartphone, Sun, Moon, RotateCcw, Volume2, VolumeX, Flame, 
  Sparkles, Check, CheckCircle2, ChevronRight, Play, Info, User, Lock, Gamepad2, Gem,
  Cloud, CloudOff, Database, Building2
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { saveUserDataToCloud } from './utils/sync';
import { Lesson, KeyboardSettings, UserProfile, TypingStats, DailyChallenge, Achievement } from './types';
import { LESSONS, TYPING_TESTS, TEST_BANK } from './data/lessons';
import { 
  loadProfile, saveProfile, loadStats, saveStats, 
  loadAchievements, saveAchievements, loadSettings, saveSettings, 
  loadDailyChallenges, saveDailyChallenges, INITIAL_STATS, INITIAL_PROFILE, INITIAL_ACHIEVEMENTS, DAILY_CHALLENGES,
  isLessonUnlocked, getCompletedLessons, processSessionCompletion, getLessonProgress
} from './utils/storage';
import { audioSynth } from './utils/audio';
import { TypingEngine } from './components/TypingEngine';
import { StatsDashboard } from './components/StatsDashboard';
import { AchievementsShelf } from './components/AchievementsShelf';
import { HomeDashboard } from './components/HomeDashboard';
import { useKeyboardDetector } from './utils/keyboardDetector';
import { LeaderboardsDashboard } from './components/LeaderboardsDashboard';
import { AiCoachDashboard } from './components/AiCoachDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { ProfileDashboard } from './components/ProfileDashboard';
import { LessonDetails } from './components/LessonDetails';
import { GameZone } from './components/GameZone';
import { RewardHub } from './components/RewardHub';
import { ExamHubDashboard } from './components/ExamHubDashboard';
import { ParagraphHubDashboard } from './components/ParagraphHubDashboard';
import { AccountBottomSheet } from './components/AccountBottomSheet';
import { BetaFeedbackModal } from './components/BetaFeedbackModal';

/* v8 ignore start */


export default function App() {
  const { user, isAnonymous, logout, updateUserDisplayName } = useAuth();
  const device = useKeyboardDetector();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup' | 'forgot' | undefined>(undefined);
  
  // Application Data States
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [stats, setStats] = useState<TypingStats>(loadStats);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [settings, setSettings] = useState<KeyboardSettings>(loadSettings);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(loadDailyChallenges);

  // Active Session states
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [selectedLessonForDetails, setSelectedLessonForDetails] = useState<Lesson | null>(null);
  const [testDuration, setTestDuration] = useState<number | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<'lesson' | 'test' | 'custom' | 'game'>('lesson');
  const [customDurationInput, setCustomDurationInput] = useState<string>('45');

  // Interactive HUD States
  const [activeTab, setActiveTab] = useState<'home' | 'examhub' | 'paragraphhub' | 'profile' | 'practice' | 'tests' | 'gamezone' | 'rewards' | 'leaderboards' | 'coach' | 'stats' | 'achievements' | 'settings'>('home');
  const [androidOrientation, setAndroidOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Custom Profile Editor States
  const [tempProfileName, setTempProfileName] = useState(profile.name);

  const isCloudActive = !!user && !isAnonymous;
  const resolvedName = React.useMemo(() => {
    if (isCloudActive && user?.displayName) {
      return user.displayName;
    }
    if (profile.name && profile.name.trim() !== '' && profile.name !== 'Tactile Pilot') {
      return profile.name;
    }
    if (profile.username && profile.username.trim() !== '' && profile.username !== 'tactile_pilot') {
      return profile.username;
    }
    return isCloudActive ? 'Pilot' : 'Guest';
  }, [isCloudActive, user?.displayName, profile.name, profile.username]);

  useEffect(() => {
    setTempProfileName(resolvedName);
  }, [resolvedName]);

  // Celebrations State
  const [congratsModal, setCongratsModal] = useState<{
    show: boolean;
    wpm: number;
    accuracy: number;
    xpGained: number;
    leveledUp: boolean;
    mistakesCount: number;
  } | null>(null);

  // Sync settings with Web Audio Synth volume
  useEffect(() => {
    audioSynth.setSoundEnabled(settings.soundType !== 'mute');
  }, [settings.soundType]);

  // Sync isDarkMode state with the documentElement to enable Tailwind dark: variants
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for cloud sync completion events and logout events
  useEffect(() => {
    const handleSyncComplete = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { profile: p, stats: s, achievements: a, settings: setts } = customEvent.detail;
        if (p) setProfile(p);
        if (s) setStats(s);
        if (a) setAchievements(a);
        if (setts) setSettings(setts);
      }
    };

    const handleLogout = () => {
      // Clear personal local storage on explicit logout
      localStorage.removeItem('typesprint_profile');
      localStorage.removeItem('typesprint_stats');
      localStorage.removeItem('typesprint_achievements');
      localStorage.removeItem('completed_lessons');
      localStorage.removeItem('lesson_progress');
      localStorage.removeItem('typesprint_custom_paragraphs');
      localStorage.removeItem('typesprint_paragraph_history');
      localStorage.removeItem('typesprint_paragraph_stats');
      localStorage.removeItem('typesprint_paragraph_favorites');
      localStorage.removeItem('typesprint_paragraph_folders');
      localStorage.removeItem('typesprint_fav_exams_v1');
      localStorage.removeItem('typesprint_exam_attempts_v1');
      localStorage.removeItem('typesprint_exam_stats_v1');
      localStorage.removeItem('typesprint_game_records');
      localStorage.removeItem('typesprint_daily_challenges');
      // Do not clear settings so theme is preserved

      // Refresh state to fresh defaults
      setProfile(loadProfile());
      setStats(loadStats());
      setAchievements(loadAchievements());
    };

    window.addEventListener('typesprint_sync_complete', handleSyncComplete);
    window.addEventListener('typesprint_logout', handleLogout);

    return () => {
      window.removeEventListener('typesprint_sync_complete', handleSyncComplete);
      window.removeEventListener('typesprint_logout', handleLogout);
    };
  }, []);

  // Automatically sync to Firestore when progress changes (XP, Coins, Stats, Achievements, Settings)
  useEffect(() => {
    if (user) {
      saveUserDataToCloud(user.uid, profile, stats, achievements, settings);
    }
  }, [profile.xp, profile.level, profile.coins, profile.gems, profile.name, profile.username, profile.selectedAvatar, profile.selectedTitle, stats.totalSessions, stats.bestWpm, achievements, settings, user]);

  useEffect(() => {
    const handleRequestSync = () => {
      if (user) {
        // Load fresh data from local storage to ensure we don't sync stale closure state
        const freshProfile = loadProfile();
        const freshStats = loadStats();
        const freshAchievements = loadAchievements();
        const freshSettings = loadSettings();
        
        saveUserDataToCloud(user.uid, freshProfile, freshStats, freshAchievements, freshSettings);
        
        // Also update local React state
        setProfile(freshProfile);
        setStats(freshStats);
        setAchievements(freshAchievements);
        setSettings(freshSettings);
      }
    };
    window.addEventListener('typesprint_request_sync', handleRequestSync);
    return () => {
      window.removeEventListener('typesprint_request_sync', handleRequestSync);
    };
  }, [user]);

  // Synchronize chosen theme globally to document root and body
  useEffect(() => {
    const themeClasses = [
      'theme-midnight-orange',
      'theme-emerald-velvet',
      'theme-solar-flare',
      'theme-cobalt-steel',
      'theme-cyber-indigo',
      'theme-cyberpunk-neon'
    ];
    document.documentElement.classList.remove(...themeClasses);
    document.body.classList.remove(...themeClasses);

    const themeClassMap: Record<string, string> = {
      'Midnight Orange': 'theme-midnight-orange',
      'Emerald Velvet': 'theme-emerald-velvet',
      'Solar Flare': 'theme-solar-flare',
      'Cobalt Steel': 'theme-cobalt-steel',
      'Cyber Indigo': 'theme-cyber-indigo',
      'Cyberpunk Neon': 'theme-cyberpunk-neon',
    };
    const activeThemeClass = themeClassMap[settings.theme] || 'theme-midnight-orange';
    document.documentElement.classList.add(activeThemeClass);
    document.body.classList.add(activeThemeClass);
  }, [settings.theme]);

  // Multi-Input auto-detection dialog states
  const [prevDeviceStatus, setPrevDeviceStatus] = useState<'none' | 'bluetooth' | 'usb'>(device.status);
  const [showKeyboardDetectionDialog, setShowKeyboardDetectionDialog] = useState(false);

  useEffect(() => {
    if (prevDeviceStatus === 'none' && device.status !== 'none') {
      if (profile.typingMode === 'mobile_keyboard') {
        setShowKeyboardDetectionDialog(true);
      }
    } else if (prevDeviceStatus !== 'none' && device.status === 'none') {
      setShowKeyboardDetectionDialog(false);
    }
    setPrevDeviceStatus(device.status);
  }, [device.status, profile.typingMode, prevDeviceStatus, profile]);

  // Handle Level XP percentage
  const nextLevelXp = profile.level * 300;
  const xpPercentage = Math.min(100, Math.round((profile.xp / nextLevelXp) * 100));

  // Handle typing session complete
  const handleSessionComplete = (results: {
    wpm: number;
    accuracy: number;
    xpGained: number;
    leveledUp: boolean;
    mistakesCount: number;
  }) => {
    // Only show congrats modal for non-lessons, since lessons have a dedicated premium Results Screen inside TypingEngine
    if (sessionType !== 'lesson') {
      setCongratsModal({
        show: true,
        ...results
      });
    }

    // Refresh memory states
    setProfile(loadProfile());
    setStats(loadStats());
    setAchievements(loadAchievements());
    setDailyChallenges(loadDailyChallenges());
  };

  // Close results overlay and reset session parameters
  const closeCongrats = () => {
    setCongratsModal(null);
    setSessionActive(false);
    setActiveLesson(null);
    setTestDuration(null);
  };

  const handleNextLesson = (currentLessonId: string) => {
    const currentIndex = LESSONS.findIndex(l => l.id === currentLessonId);
    if (currentIndex !== -1 && currentIndex + 1 < LESSONS.length) {
      const nextLesson = LESSONS[currentIndex + 1];
      setActiveLesson(nextLesson);
      setSessionType('lesson');
      setTestDuration(null);
      setSessionActive(true);
    } else {
      // No more lessons, exit
      setSessionActive(false);
      setActiveLesson(null);
      setTestDuration(null);
    }
  };

  // Trigger typing test
  const startTypingTest = (duration: number) => {
    // Select random prompt from bank
    const randomIdx = Math.floor(Math.random() * TEST_BANK.length);
    const chosenText = TEST_BANK[randomIdx];

    setSessionType('test');
    setCustomText(chosenText);
    setTestDuration(duration);
    setSessionActive(true);
  };

  // Trigger custom text typing
  const startCustomPractice = () => {
    if (!customText.trim()) return;
    const duration = parseInt(customDurationInput) || 60;
    
    setSessionType('custom');
    setTestDuration(duration);
    setSessionActive(true);
  };

  // Trigger custom text practice from leaderboards
  const triggerCustomTextPractice = (text: string, title: string) => {
    setSessionType('custom');
    setCustomText(text);
    setTestDuration(60);
    setActiveLesson({
      id: 'race_' + Date.now(),
      title: title,
      description: 'Competitive racing circuit run',
      category: 'custom',
      targetKeys: [],
      texts: [text],
      difficulty: 'Intermediate'
    });
    setSessionActive(true);
  };

  // Handle game completed and reward XP/Coins
  const handleGameComplete = (xpGained: number, coinsGained: number, wpm: number, accuracy: number, gameTitle: string) => {
    // Only process completion if player achieved non-zero results
    const totalKeys = wpm * 5;
    const incorrectKeys = Math.round(totalKeys * (1 - accuracy / 100));
    const correctKeys = totalKeys - incorrectKeys;
    
    const results = processSessionCompletion({
      type: 'game',
      title: gameTitle,
      wpm: wpm,
      rawWpm: wpm,
      cpm: totalKeys,
      accuracy: accuracy,
      timeSpentSeconds: 60,
      mistakesCount: incorrectKeys,
      totalKeysPressed: totalKeys,
      correctCharacters: correctKeys,
      incorrectCharacters: incorrectKeys,
      extraCharacters: 0,
      missedCharacters: 0,
      xpEarned: xpGained,
      coinsEarned: coinsGained
    });

    setCongratsModal({
      show: true,
      wpm: wpm,
      accuracy: accuracy,
      xpGained: results.xpGained,
      leveledUp: results.leveledUp,
      mistakesCount: Math.round((wpm * 5) * (1 - accuracy / 100))
    });

    // Sync state managers
    setProfile(loadProfile());
    setStats(loadStats());
    setAchievements(loadAchievements());
    setDailyChallenges(loadDailyChallenges());
  };

  // Category filter mapping for Lessons tab
  const categoriesList = [
    { id: 'all', label: 'All Categories' },
    { id: 'home_row', label: 'Home Row' },
    { id: 'top_row', label: 'Top Row' },
    { id: 'bottom_row', label: 'Bottom Row' },
    { id: 'numbers', label: 'Numbers' },
    { id: 'symbols', label: 'Symbols' },
    { id: 'common_words', label: 'Common Words' },
    { id: 'sentences', label: 'Sentences' },
    { id: 'paragraphs', label: 'Paragraphs' },
    { id: 'coding', label: 'Coding Practice' }
  ];

  const filteredLessons = selectedCategory === 'all' 
    ? LESSONS 
    : LESSONS.filter(l => l.category === selectedCategory);

  // Settings updates
  const updateSetting = <K extends keyof KeyboardSettings>(key: K, value: KeyboardSettings[K]) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    saveSettings(nextSettings);
  };

  const toggleSound = () => {
    const isMuted = settings.soundType === 'mute';
    const nextSound = isMuted ? 'mechanical' : 'mute';
    updateSetting('soundType', nextSound);
    if (isMuted) {
      setTimeout(() => {
        audioSynth.playClick('mechanical');
      }, 50);
    }
  };

  const handleProfileNameSave = () => {
    if (!tempProfileName.trim()) return;
    const nextProfile = { ...profile, name: tempProfileName };
    setProfile(nextProfile);
    saveProfile(nextProfile);
  };

  const handleStatsReset = () => {
    if (window.confirm('Are you absolutely sure you want to clear your full practice history, levels, and WPM analytics? This is irreversible.')) {
      saveStats(INITIAL_STATS);
      saveProfile(INITIAL_PROFILE);
      saveAchievements(INITIAL_ACHIEVEMENTS);
      saveDailyChallenges(DAILY_CHALLENGES);

      setStats(INITIAL_STATS);
      setProfile(INITIAL_PROFILE);
      setAchievements(INITIAL_ACHIEVEMENTS);
      setDailyChallenges(DAILY_CHALLENGES);
      setTempProfileName(INITIAL_PROFILE.name);
    }
  };

  // Render Android Hardware Status bar elements
  const renderAndroidStatusBar = () => {
    return (
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-100 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 font-bold text-[10px] select-none tracking-wide rounded-t-[36px] border-b border-slate-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 font-mono">
          <span>TypeSprint Engine v2.0</span>
          {device.status === 'bluetooth' && (
            <span className="flex items-center gap-1 text-blue-500 dark:text-blue-400">
              <Bluetooth className="w-3.5 h-3.5 animate-pulse" /> Bluetooth Keyboard Connected {device.name && device.name !== 'Bluetooth Keyboard' ? `(${device.name})` : ''}
            </span>
          )}
          {device.status === 'usb' && (
            <span className="flex items-center gap-1 text-emerald-500">
              <Usb className="w-3.5 h-3.5" /> USB Keyboard Connected {device.name && device.name !== 'USB Keyboard' ? `(${device.name})` : ''}
            </span>
          )}
          {device.status === 'none' && (
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              No Keyboard Connected
            </span>
          )}
        </div>
        
        {/* Notch container */}
        <div className="hidden md:block w-28 h-4 bg-zinc-900 absolute left-1/2 -translate-x-1/2 top-0.5 rounded-full z-30" />

        <div className="flex items-center gap-3">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 text-emerald-500" />
          
           {/* Permanent Sound Toggle Button in Mock Device Header */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1 px-2 py-1 rounded-full border font-bold text-[9px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer z-50 ${
              settings.soundType === 'mute'
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            }`}
            title={settings.soundType === 'mute' ? "Sound Muted (Click to Unmute)" : "Sound Active (Click to Mute)"}
            id="btn_mock_device_sound_toggle"
          >
            {settings.soundType === 'mute' ? (
              <>
                <VolumeX className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-pulse" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Sound On</span>
              </>
            )}
          </button>

          {/* Permanent Profile/Account Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border font-bold text-[9px] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer z-50 ${
              user && !isAnonymous
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
            }`}
            title="Account & Cloud Sync"
          >
            {user && !isAnonymous ? (
              <>
                <Cloud className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Cloud Live</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Guest Play</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const themeClassMap: Record<string, string> = {
    'Midnight Orange': 'theme-midnight-orange',
    'Emerald Velvet': 'theme-emerald-velvet',
    'Solar Flare': 'theme-solar-flare',
    'Cobalt Steel': 'theme-cobalt-steel',
    'Cyber Indigo': 'theme-cyber-indigo',
    'Cyberpunk Neon': 'theme-cyberpunk-neon',
  };
  const activeThemeClass = themeClassMap[settings.theme] || 'theme-midnight-orange';

  return (
    <div className={`min-h-screen flex items-center justify-center p-3 md:p-6 transition-all duration-500 ${activeThemeClass} ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Absolute Header Controls */}
      {!sessionActive && (
        <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`p-2.5 rounded-xl border shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              user && !isAnonymous 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
            }`}
            title="Cloud Backup & Sync Accounts"
          >
            {user && !isAnonymous ? (
              <>
                <Cloud className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline font-mono text-[10px] uppercase font-bold tracking-wider">Cloud Live</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400">Guest Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-sm hover:scale-105 transition-all"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            title={settings.soundType === 'mute' ? "Unmute Audio Feedback" : "Mute Audio Feedback"}
            id="btn_global_sound_toggle_absolute"
          >
            {settings.soundType === 'mute' ? (
              <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setAndroidOrientation(androidOrientation === 'landscape' ? 'portrait' : 'landscape')}
            className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shadow-sm hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Toggle Screen Orientation"
          >
            <Smartphone className={`w-4 h-4 transition-transform duration-300 ${androidOrientation === 'landscape' ? 'rotate-90' : ''}`} />
            <span>{androidOrientation === 'landscape' ? 'Landscape View' : 'Portrait View'}</span>
          </button>
        </div>
      )}

      {/* Primary Android Mock Device frame */}
      <div 
        id="android_device_frame"
        className={`relative transition-all duration-500 bg-white dark:bg-zinc-900 border-slate-900 dark:border-zinc-950 flex flex-col justify-between overflow-hidden ${activeThemeClass} ${
          sessionActive 
            ? 'w-full h-screen max-w-none max-h-none rounded-none border-0 z-50'
            : androidOrientation === 'landscape'
              ? 'w-full max-w-5xl h-[640px] border-[12px] rounded-[44px] shadow-2xl'
              : 'w-full max-w-[420px] h-[780px] border-[12px] rounded-[44px] shadow-2xl'
        }`}
      >
        {/* Hardware Status line */}
        {!sessionActive && renderAndroidStatusBar()}

        {/* Dynamic Canvas Workspace */}
        <div className={`flex-grow flex flex-col ${sessionActive ? 'p-0 overflow-hidden h-full w-full' : 'p-4 md:p-6 overflow-y-auto'}`}>
          {sessionActive ? (
            /* Active Typing Area */
            <TypingEngine
              sessionType={sessionType}
              title={sessionType === 'lesson' ? activeLesson!.title : sessionType === 'test' ? `${testDuration}s Timed Test` : 'Custom Dynamic practice'}
              lessonData={sessionType === 'lesson' ? activeLesson! : undefined}
              customText={sessionType !== 'lesson' ? customText : undefined}
              timeLimit={testDuration || undefined}
              settings={settings}
              onUpdateSettings={(next) => {
                setSettings(next);
                saveSettings(next);
              }}
              onSessionComplete={handleSessionComplete}
              onNextLesson={handleNextLesson}
              onExit={() => {
                setSessionActive(false);
                if (sessionType === 'lesson' && activeLesson) {
                  setSelectedLessonForDetails(activeLesson);
                } else {
                  setSelectedLessonForDetails(null);
                }
                setActiveLesson(null);
                setTestDuration(null);
              }}
              onOpenFeedback={() => setIsFeedbackModalOpen(true)}
            />
          ) : selectedLessonForDetails ? (
            /* Dedicated Lesson Details Page */
            <LessonDetails
              lesson={selectedLessonForDetails}
              stats={stats}
              profile={profile}
              onBack={() => setSelectedLessonForDetails(null)}
              onStartPractice={(lesson) => {
                setActiveLesson(lesson);
                setSessionType('lesson');
                setTestDuration(null);
                setSessionActive(true);
                setSelectedLessonForDetails(null);
              }}
              onNavigateToLesson={(lesson) => {
                setSelectedLessonForDetails(lesson);
              }}
            />
          ) : (
            /* Main Dashboard Interface */
            <div className="flex flex-col flex-grow gap-4">
              {/* Header Profile Dashboard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-zinc-950/80 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-600 dark:bg-amber-500 text-white dark:text-zinc-950 flex items-center justify-center font-bold text-lg font-display shadow-sm">
                    {profile.level}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold font-display text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-1">
                      {resolvedName} <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">Level {profile.level} Typist • Streak: {stats.streak} Days</p>
                  </div>
                </div>

                {/* mini HUD XP progress */}
                <div className="flex flex-col min-w-[120px] sm:min-w-[180px]">
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    <span>XP progress</span>
                    <span>{profile.xp} / {nextLevelXp} XP</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-primary-500 dark:bg-amber-500 h-full rounded-full" style={{ width: `${xpPercentage}%` }} />
                  </div>
                </div>
              </div>

               {/* Navigation Tabs bar */}
              <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-zinc-950/80 border border-slate-200/60 dark:border-zinc-800/60 rounded-xl select-none overflow-x-auto scrollbar-none">
                {[
                  { id: 'home', label: 'Home', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'examhub', label: 'Govt Exam Hub', icon: <Building2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> },
                  { id: 'paragraphhub', label: 'Paragraph Hub', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> },
                  { id: 'profile', label: 'Profile', icon: <User className="w-3.5 h-3.5 text-amber-500" /> },
                  { id: 'practice', label: 'Lessons', icon: <BookOpen className="w-3.5 h-3.5" /> },
                  { id: 'tests', label: 'Speed Tests', icon: <Play className="w-3.5 h-3.5" /> },
                  { id: 'gamezone', label: 'Game Zone', icon: <Gamepad2 className="w-3.5 h-3.5 text-orange-500" /> },
                  { id: 'rewards', label: 'Reward Hub', icon: <Gem className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> },
                  { id: 'leaderboards', label: 'Leaderboards', icon: <Award className="w-3.5 h-3.5 text-orange-500" /> },
                  { id: 'coach', label: 'AI Coach', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> },
                  { id: 'stats', label: 'Analytics', icon: <Activity className="w-3.5 h-3.5" /> },
                  { id: 'achievements', label: 'Achievements', icon: <Award className="w-3.5 h-3.5" /> },
                  { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> }
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  // Clone the icon element to inject active color if selected
                  const themedIcon = React.cloneElement(tab.icon as React.ReactElement, {
                    className: `w-3.5 h-3.5 ${active ? 'text-orange-500' : (tab.icon as any).props.className || ''}`
                  });

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-all shrink-0 ${
                        active 
                          ? 'bg-white dark:bg-zinc-900 text-primary-600 dark:text-amber-400 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]' 
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      {themedIcon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* View workspace viewport */}
              <div className="flex-grow min-h-0">
                {activeTab === 'home' && (
                  <HomeDashboard
                    onStartLesson={(lesson) => {
                      setSelectedLessonForDetails(lesson);
                    }}
                    onStartSpeedTest={(duration) => {
                      startTypingTest(duration);
                    }}
                    onNavigateToTab={(tab) => {
                      setActiveTab(tab as any);
                    }}
                    profile={profile}
                    stats={stats}
                    dailyChallenges={dailyChallenges}
                    isAuthenticated={!!user}
                    onOpenAuthModal={() => {
                      setAuthModalInitialMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    onOpenAccountSheet={() => setIsAccountSheetOpen(true)}
                    isCloudActive={!!user && !isAnonymous}
                  />
                )}

                {activeTab === 'examhub' && (
                  <ExamHubDashboard
                    settings={settings}
                    profile={profile}
                    onSessionComplete={(examRes) => {
                      // Process XP and coin updates inside user profile
                      const currentXp = profile.xp + examRes.xpGained;
                      const nextLvlXp = (profile.level) * 1000;
                      let updatedLevel = profile.level;
                      let nextXp = currentXp;
                      let leveledUp = false;

                      if (nextXp >= nextLvlXp) {
                        nextXp = nextXp - nextLvlXp;
                        updatedLevel += 1;
                        leveledUp = true;
                      }

                      const updatedProfile = {
                        ...profile,
                        xp: nextXp,
                        level: updatedLevel,
                        coins: (profile.coins || 0) + examRes.coinsEarned
                      };

                      setProfile(updatedProfile);
                      saveProfile(updatedProfile);

                      // Process stats update
                      const nextHistory = [
                        ...(stats.history || []),
                        {
                          id: `exam_session_${Date.now()}`,
                          type: 'test' as const,
                          title: examRes.title,
                          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                          wpm: examRes.wpm,
                          accuracy: examRes.accuracy,
                          timeSpentSeconds: 60,
                          mistakesCount: examRes.mistakesCount,
                          totalKeysPressed: Math.round(examRes.wpm * 5),
                          coinsEarned: examRes.coinsEarned,
                          xpEarned: examRes.xpGained
                        }
                      ];

                      const nextStats = {
                        ...stats,
                        totalSessions: (stats.totalSessions || 0) + 1,
                        avgWpm: Math.round(((stats.avgWpm * stats.totalSessions) + examRes.wpm) / (stats.totalSessions + 1)),
                        bestWpm: Math.max(stats.bestWpm || 0, examRes.wpm),
                        history: nextHistory
                      };

                      setStats(nextStats);
                      saveStats(nextStats);

                      // Display notification or modal celebration
                      setCongratsModal({
                        show: true,
                        wpm: examRes.wpm,
                        accuracy: examRes.accuracy,
                        xpGained: examRes.xpGained,
                        leveledUp: leveledUp,
                        mistakesCount: examRes.mistakesCount
                      });
                    }}
                    onNavigateToTab={(tab) => setActiveTab(tab as any)}
                  />
                )}

                {activeTab === 'paragraphhub' && (
                  <ParagraphHubDashboard
                    profile={profile}
                    stats={stats}
                    settings={settings}
                    onSessionComplete={(results) => {
                      // Process XP and coin updates inside user profile
                      const currentXp = profile.xp + results.xpGained;
                      const nextLvlXp = (profile.level) * 1000;
                      let updatedLevel = profile.level;
                      let nextXp = currentXp;
                      let leveledUp = false;

                      if (nextXp >= nextLvlXp) {
                        nextXp = nextXp - nextLvlXp;
                        updatedLevel += 1;
                        leveledUp = true;
                      }

                      const updatedProfile = {
                        ...profile,
                        xp: nextXp,
                        level: updatedLevel,
                        coins: (profile.coins || 0) + results.coinsEarned
                      };

                      setProfile(updatedProfile);
                      saveProfile(updatedProfile);

                      // Process stats update
                      const nextHistory = [
                        ...(stats.history || []),
                        {
                          id: `para_session_${Date.now()}`,
                          type: 'test' as const,
                          title: results.title,
                          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                          wpm: results.wpm,
                          accuracy: results.accuracy,
                          timeSpentSeconds: 60,
                          mistakesCount: results.mistakesCount,
                          totalKeysPressed: Math.round(results.wpm * 5),
                          coinsEarned: results.coinsEarned,
                          xpEarned: results.xpGained
                        }
                      ];

                      const nextStats = {
                        ...stats,
                        totalSessions: (stats.totalSessions || 0) + 1,
                        avgWpm: Math.round(((stats.avgWpm * stats.totalSessions) + results.wpm) / (stats.totalSessions + 1)),
                        bestWpm: Math.max(stats.bestWpm || 0, results.wpm),
                        history: nextHistory
                      };

                      setStats(nextStats);
                      saveStats(nextStats);

                      // Display notification or modal celebration
                      setCongratsModal({
                        show: true,
                        wpm: results.wpm,
                        accuracy: results.accuracy,
                        xpGained: results.xpGained,
                        leveledUp: leveledUp,
                        mistakesCount: results.mistakesCount
                      });
                    }}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileDashboard
                    profile={profile}
                    stats={stats}
                    achievements={achievements}
                    settings={settings}
                    onUpdateProfile={(next) => {
                      setProfile(next);
                      saveProfile(next);
                    }}
                    onUpdateSettings={(next) => {
                      setSettings(next);
                      saveSettings(next);
                    }}
                  />
                )}

                {activeTab === 'leaderboards' && (
                  <LeaderboardsDashboard
                    profile={profile}
                    stats={stats}
                    onTriggerRace={triggerCustomTextPractice}
                  />
                )}

                {activeTab === 'coach' && (
                  <AiCoachDashboard
                    stats={stats}
                    profile={profile}
                  />
                )}

                {activeTab === 'practice' && (
                  /* Progressive Curriculum Lesson Browser */
                  <div className="flex flex-col gap-4 h-full">
                    {/* Horizontal filter categories */}
                    <div className="flex gap-1.5 pb-1 overflow-x-auto select-none shrink-0 scrollbar-none">
                      {categoriesList.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
                            selectedCategory === cat.id
                              ? 'bg-primary-600 text-white border-primary-600 dark:bg-amber-500 dark:text-zinc-950 dark:border-amber-500'
                              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>                    {/* Lesson drill lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[360px] pr-1 flex-grow scrollbar-none">
                      {filteredLessons.map((lesson) => {
                        const unlocked = isLessonUnlocked(lesson.id, LESSONS);
                        const isCompleted = getCompletedLessons().includes(lesson.id);
                        
                        return (
                          <div 
                            key={lesson.id}
                            onClick={() => setSelectedLessonForDetails(lesson)}
                            className={`bg-white dark:bg-zinc-900 border p-4 rounded-2xl flex justify-between items-center transition-all cursor-pointer hover:scale-[1.01] ${
                              unlocked 
                                ? 'border-slate-200/50 dark:border-zinc-800/60 group hover:border-primary-500/50 dark:hover:border-amber-500/50 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_20px_-6px_rgba(245,158,11,0.05)]' 
                                : 'border-slate-100 dark:border-zinc-900/60 opacity-80 bg-slate-50/40 dark:bg-zinc-950/20 hover:border-slate-300 dark:hover:border-zinc-800'
                            }`}
                          >
                            <div className="flex-grow min-w-0 pr-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-full ${
                                  lesson.difficulty === 'Beginner' 
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                    : lesson.difficulty === 'Intermediate'
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                                }`}>
                                  {lesson.difficulty}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wide">
                                  {lesson.category.replace('_', ' ')}
                                </span>
                                {isCompleted && (
                                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    ★ Passed
                                  </span>
                                )}
                                {!unlocked && (
                                  <span className="bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Lock className="w-2 h-2" /> Locked
                                  </span>
                                )}
                              </div>
                              <h4 className={`text-xs font-bold font-display mt-1.5 truncate transition-colors ${
                                unlocked 
                                  ? 'text-slate-800 dark:text-zinc-100 group-hover:text-primary-600 dark:group-hover:text-amber-400' 
                                  : 'text-slate-400 dark:text-zinc-600'
                              }`}>
                                {lesson.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{lesson.description}</p>
                              
                              {/* Visual Progress Bar */}
                              <div className="mt-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden flex items-center relative">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  style={{ width: `${isCompleted ? 100 : getLessonProgress(lesson.id)}%` }}
                                />
                              </div>
                              <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                {isCompleted ? '100% Completed' : `${getLessonProgress(lesson.id)}% Progress`}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLessonForDetails(lesson);
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow-sm shrink-0 ${
                                unlocked 
                                  ? 'bg-slate-50 hover:bg-primary-600 hover:text-white dark:bg-zinc-800 dark:hover:bg-amber-500 dark:hover:text-zinc-950 text-slate-600 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-700/80 group-hover:scale-105' 
                                  : 'bg-slate-100 dark:bg-zinc-850 text-slate-300 dark:text-zinc-700 border-slate-100 dark:border-zinc-800/40 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200'
                              }`}
                            >
                              {unlocked ? <ChevronRight className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'tests' && (
                  /* Dynamic Sprint Speed Testing Panel */
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[380px] pr-1 scrollbar-none">
                    <div className="bg-slate-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 text-center">
                      <h4 className="text-xs font-bold font-display tracking-wider uppercase text-slate-400">Timed Typing Tests</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">Select a typing duration below to start. The speed test loads random text prompts designed to calculate accuracy, WPM, and key mistakes.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {TYPING_TESTS.map((test) => (
                        <button
                          key={test.id}
                          onClick={() => startTypingTest(test.duration)}
                          className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/60 p-4 rounded-2xl flex flex-col justify-between items-start text-left hover:border-primary-500 dark:hover:border-amber-500 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_20px_-6px_rgba(245,158,11,0.05)] transition-all shadow-sm group"
                        >
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Timed Sprint</span>
                          <h4 className="text-xs font-bold font-display text-slate-800 dark:text-zinc-100 mt-1">{test.title}</h4>
                          <span className="mt-3 inline-block px-3 py-1 bg-slate-50 group-hover:bg-primary-600 group-hover:text-white dark:bg-zinc-800 dark:group-hover:bg-amber-500 dark:group-hover:text-zinc-950 text-[9px] font-bold uppercase rounded-full transition-all">
                            Launch Test
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Text Playground */}
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850 p-5 rounded-3xl mt-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                        <Keyboard className="w-4 h-4 text-primary-500" /> Custom Training Mode
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Paste custom paragraphs, coding files, or lecture text below to create your own bespoke typing practice module.</p>
                      
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Paste your custom practice text or code here..."
                        className="w-full mt-3 h-20 p-2 text-xs font-mono bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-amber-500"
                      />

                      <div className="flex gap-2.5 items-center mt-3 justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase">Time Limit:</span>
                          <input 
                            type="number" 
                            value={customDurationInput} 
                            onChange={(e) => setCustomDurationInput(e.target.value)}
                            className="w-12 text-center text-xs p-1 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">sec</span>
                        </div>

                        <button
                          onClick={startCustomPractice}
                          disabled={!customText.trim()}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-amber-500 dark:hover:bg-amber-600 disabled:opacity-40 disabled:pointer-events-none text-white dark:text-zinc-950 rounded-xl font-bold text-xs shadow-md transition-colors"
                        >
                          Launch Custom Run
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  /* Stats & Heatmaps component */
                  <StatsDashboard stats={stats} onStatsReset={handleStatsReset} />
                )}

                {activeTab === 'achievements' && (
                  /* Gamified milestones list */
                  <AchievementsShelf 
                    achievements={achievements} 
                    dailyChallenges={dailyChallenges} 
                    profile={profile} 
                  />
                )}

                {activeTab === 'gamezone' && (
                  <GameZone
                    profile={profile}
                    stats={stats}
                    settings={settings}
                    onUpdateStatsAndProfile={handleGameComplete}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'rewards' && (
                  <RewardHub
                    profile={profile}
                    stats={stats}
                    settings={settings}
                    achievements={achievements}
                    dailyChallenges={dailyChallenges}
                    onUpdateProfile={(next) => {
                      setProfile(next);
                      saveProfile(next);
                    }}
                    onUpdateStats={(next) => {
                      setStats(next);
                      saveStats(next);
                    }}
                    onUpdateAchievements={(next) => {
                      setAchievements(next);
                      saveAchievements(next);
                    }}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'settings' && (
                  <SettingsPanel
                    settings={settings}
                    profile={profile}
                    onUpdateSettings={(next) => {
                      setSettings(next);
                      saveSettings(next);
                    }}
                    onUpdateProfile={async (next) => {
                      setProfile(next);
                      saveProfile(next);
                      if (user && !isAnonymous && next.name) {
                        try {
                          await updateUserDisplayName(next.name);
                        } catch (err) {
                          console.error("Failed to update Firebase display name:", err);
                        }
                      }
                    }}
                    onResetProgress={handleStatsReset}
                    onOpenAuthModal={() => setIsAuthModalOpen(true)}
                    onOpenFeedback={() => setIsFeedbackModalOpen(true)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Celebrations congratulations modal overlay */}
        <AnimatePresence>
          {congratsModal && congratsModal.show && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-50 text-white select-none"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] text-center max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                
                {/* Sparkle decorative effect */}
                <div className="absolute -top-12 -right-12 text-teal-500 opacity-20 rotate-12">
                  <Sparkles className="w-24 h-24" />
                </div>

                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-black tracking-tight text-zinc-100">Practice Completed!</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Fantastic tactile keystroke flow.</p>

                {/* Scorecards */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                  <div className="bg-zinc-800/40 border border-zinc-800 p-2 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Typing Speed</span>
                    <div className="text-lg font-black text-emerald-400 mt-0.5 font-mono">{congratsModal.wpm} WPM</div>
                  </div>
                  <div className="bg-zinc-800/40 border border-zinc-800 p-2 rounded-xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">Accuracy</span>
                    <div className="text-lg font-black text-amber-500 mt-0.5 font-mono">{congratsModal.accuracy}%</div>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-gradient-to-r from-primary-600/10 to-indigo-600/10 dark:from-zinc-800/40 dark:to-zinc-850/40 rounded-2xl border border-zinc-800/80 text-left">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-xs font-bold text-zinc-300">Total Mistakes:</span>
                    <span className="text-xs font-bold font-mono text-rose-400">{congratsModal.mistakesCount}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-between mt-1">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> XP Rewards:
                    </span>
                    <span className="text-xs font-black font-mono text-emerald-400">+{congratsModal.xpGained} XP</span>
                  </div>
                  {congratsModal.leveledUp && (
                    <div className="mt-3 text-center bg-yellow-500 text-zinc-950 font-black text-[10px] uppercase py-1 rounded-lg tracking-wider animate-bounce">
                      🚀 LEVEL UP DETECTED! NEW LEVEL REACHED!
                    </div>
                  )}
                </div>

                <button
                  onClick={closeCongrats}
                  className="mt-5 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multi-Input auto-detection popup dialog */}
        <AnimatePresence>
          {showKeyboardDetectionDialog && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 z-50 text-white select-none"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-[28px] text-center max-w-sm w-full shadow-2xl relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
                  <Keyboard className="w-6 h-6 animate-bounce text-amber-500" />
                </div>

                <h3 className="text-base font-black text-zinc-100">External keyboard detected</h3>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  TypeSprint detected a physical keyboard connection ({device.status.toUpperCase()}). Would you like to switch to Keyboard Mode?
                </p>

                <div className="flex flex-col gap-2 mt-5">
                  <button
                    onClick={() => {
                      const updated = { ...profile, typingMode: 'external_keyboard' as const };
                      setProfile(updated);
                      saveProfile(updated);
                      setShowKeyboardDetectionDialog(false);
                      audioSynth.playClick('mechanical');
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Switch to Keyboard Mode
                  </button>
                  <button
                    onClick={() => {
                      setShowKeyboardDetectionDialog(false);
                      audioSynth.playClick('mechanical');
                    }}
                    className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Stay in Mobile Mode
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Onboarding Screen (Choose Your Typing Method) */}
        <AnimatePresence>
          {!profile.onboardingCompleted && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col justify-center p-6 z-50 text-white select-none"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                className="text-center max-w-sm mx-auto w-full"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
                  <Keyboard className="w-8 h-8 text-white animate-pulse" />
                </div>
                
                <h2 className="text-xl font-black tracking-tight font-display text-white">
                  Choose Your Typing Method
                </h2>
                <p className="text-[11px] text-zinc-400 mt-1.5 leading-normal max-w-xs mx-auto font-medium">
                  Select how you want to sprint. You can change this anytime in Settings.
                </p>

                <div className="flex flex-col gap-3 mt-6 text-left">
                  {/* Mobile Keyboard Option */}
                  <button
                    onClick={() => {
                      const updated = { 
                        ...profile, 
                        typingMode: 'mobile_keyboard' as const, 
                        onboardingCompleted: true 
                      };
                      setProfile(updated);
                      saveProfile(updated);
                      audioSynth.playClick('chiclet');
                    }}
                    className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/50 transition-all hover:scale-[1.01] hover:bg-zinc-900/80 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-100 group-hover:text-amber-400 transition-colors">📱 Mobile Keyboard</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Perfect for learning anywhere.</p>
                    </div>
                  </button>

                  {/* External Keyboard Option */}
                  <button
                    onClick={() => {
                      const updated = { 
                        ...profile, 
                        typingMode: 'external_keyboard' as const, 
                        onboardingCompleted: true 
                      };
                      setProfile(updated);
                      saveProfile(updated);
                      audioSynth.playClick('mechanical');
                    }}
                    className="group flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-amber-500/50 transition-all hover:scale-[1.01] hover:bg-zinc-900/80 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Keyboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-100 group-hover:text-amber-400 transition-colors">⌨️ Bluetooth / USB Keyboard</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Best for professional typing practice.</p>
                    </div>
                  </button>

                  {/* Computer Keyboard Option (Coming Soon) */}
                  <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-900/30 border border-zinc-950 text-left opacity-40">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-400">💻 Computer Keyboard</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Coming Soon.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulated Home Pill button */}
        <div className="h-6 bg-slate-100 dark:bg-zinc-950 flex items-center justify-center select-none rounded-b-[36px] border-t border-slate-200/60 dark:border-zinc-800/60">
          <div className="w-24 h-1.5 bg-slate-400 dark:bg-zinc-800 rounded-full cursor-pointer hover:bg-slate-500 dark:hover:bg-zinc-600 transition-colors" />
        </div>

        {/* Account Bottom Sheet */}
        <AnimatePresence>
          {isAccountSheetOpen && (
            <AccountBottomSheet
              isOpen={isAccountSheetOpen}
              onClose={() => setIsAccountSheetOpen(false)}
              profile={profile}
              stats={stats}
              isCloudActive={!!user && !isAnonymous}
              isDarkMode={isDarkMode}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onOpenAuthModal={(mode) => {
                setAuthModalInitialMode(mode);
                setIsAuthModalOpen(true);
              }}
              onLogout={async () => {
                try {
                  await logout();
                  setIsAccountSheetOpen(false);
                } catch (err) {
                  console.error("Logout error", err);
                }
              }}
              onSwitchAccount={async () => {
                try {
                  await logout();
                  setAuthModalInitialMode('login');
                  setIsAuthModalOpen(true);
                  setIsAccountSheetOpen(false);
                } catch (err) {
                  console.error("Switch account error", err);
                }
              }}
              accentTheme={settings.theme}
            />
          )}
        </AnimatePresence>

        {/* AuthModal Stance overlay */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          profile={profile}
          stats={stats}
          achievements={achievements}
          settings={settings}
          onUpdateAllData={(data) => {
            setProfile(data.profile);
            setStats(data.stats);
            setAchievements(data.achievements);
            setSettings(data.settings);
          }}
          initialMode={authModalInitialMode}
        />

        {/* Beta Feedback Modal */}
        <BetaFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          profile={profile}
          settings={settings}
        />
      </div>
    </div>
  );
}


/* v8 ignore stop */
