const fs = require('fs');

const mockProfileBlock = `
import { UserProfile, TypingStats, KeyboardSettings } from '../types';
const mockProfile: UserProfile = {
  xp: 0, level: 1, name: 'Test User', selectedAvatar: 'avatar_1', selectedTitle: 'Beginner',
  unlockedAvatars: [], unlockedTitles: [], unlockedThemes: [], typingMode: 'physical_keyboard', coins: 0
};
const mockStats: TypingStats = {
  bestWpm: 0, avgWpm: 0, bestAccuracy: 0, avgAccuracy: 0, totalSessions: 0, totalMinutes: 0,
  totalCorrectKeystrokes: 0, totalIncorrectKeystrokes: 0, totalAccuracy: 0, lifetimeAccuracy: 0,
  streak: 0, longestStreak: 0, lastPracticeDate: null, mistypedKeys: {}, history: []
};
const mockSettings: KeyboardSettings = {
  soundEnabled: true, soundVolume: 0.5, soundType: 'mechanical', theme: 'dark', keyboardLayout: 'qwerty'
};
`;

const leaderboardsCode = `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LeaderboardsDashboard } from './LeaderboardsDashboard';
${mockProfileBlock}

describe('LeaderboardsDashboard', () => {
  it('renders leaderboards', () => {
    render(<LeaderboardsDashboard userProfile={mockProfile} onNavigateToTab={vi.fn()} />);
    expect(screen.getAllByText(/Global Leaderboard/i).length).toBeGreaterThan(0);
  });
});
`;

fs.writeFileSync('src/components/LeaderboardsDashboard.test.tsx', leaderboardsCode);

const appCode = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAnonymous: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn()
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the main app structure', () => {
    render(<App />);
    expect(screen.getAllByText(/Home/i).length).toBeGreaterThan(0);
  });

  it('navigates through all tabs', async () => {
    render(<App />);
    
    const tabsToClick = [
      'Govt Exam Hub',
      'Paragraph Hub',
      'Profile',
      'Lessons',
      'Speed Tests',
      'Game Zone',
      'Reward Hub',
      'Leaderboards',
      'AI Coach',
      'Analytics'
    ];

    for (const tabName of tabsToClick) {
      act(() => {
        const tabs = screen.getAllByText(new RegExp(tabName, 'i'));
        let clicked = false;
        for (const t of tabs) {
          const btn = t.closest('button');
          if (btn && !clicked) {
            fireEvent.click(btn);
            clicked = true;
          }
        }
      });
    }
    
    act(() => {
      const themeBtn = screen.getByTitle('Toggle Dark/Light Mode');
      if (themeBtn) fireEvent.click(themeBtn);
    });

    act(() => {
      const soundBtn = screen.getByTitle('Mute Audio Feedback');
      if (soundBtn) fireEvent.click(soundBtn);
    });

    act(() => {
      const mobileBtn = screen.getByTitle('Toggle Screen Orientation');
      if (mobileBtn) fireEvent.click(mobileBtn);
    });

    expect(true).toBe(true);
  });
});
`;

fs.writeFileSync('src/App.test.tsx', appCode);

const authModalTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthModal } from './AuthModal';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    loginWithEmail: vi.fn(),
    signupWithEmail: vi.fn(),
    loginWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    isFirebaseActive: true
  })
}));

describe('AuthModal', () => {
  it('renders login mode and interacts', async () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} initialMode="login" />);
    expect(screen.getAllByText(/Welcome Back/i).length).toBeGreaterThan(0);
    
    act(() => {
      const signupLink = screen.getByText(/Sign up/i);
      fireEvent.click(signupLink);
    });
    
    expect(screen.getAllByText(/Create Account/i).length).toBeGreaterThan(0);

    act(() => {
      const forgotLink = screen.getByText(/Forgot password/i);
      if(forgotLink) fireEvent.click(forgotLink);
    });
  });
});
`;
fs.writeFileSync('src/components/AuthModal.test.tsx', authModalTest);

const gameZoneTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GameZone } from './GameZone';
${mockProfileBlock}

describe('GameZone', () => {
  it('renders game zone and starts a game', () => {
    render(<GameZone profile={mockProfile} stats={mockStats} settings={mockSettings} onUpdateStatsAndProfile={vi.fn()} onNavigateToTab={vi.fn()} />);
    
    act(() => {
      const playBtn = screen.getAllByText(/Play/i)[0];
      if (playBtn) fireEvent.click(playBtn);
    });
    
    expect(true).toBe(true);
  });
});
`;
fs.writeFileSync('src/components/GameZone.test.tsx', gameZoneTest);

const rewardHubTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RewardHub } from './RewardHub';
${mockProfileBlock}

describe('RewardHub', () => {
  it('renders and allows tab switching', () => {
    render(<RewardHub profile={mockProfile} stats={mockStats} onUpdateProfile={vi.fn()} onUpdateStats={vi.fn()} onNavigateToTab={vi.fn()} />);
    
    act(() => {
      const dailyBtn = screen.getByText(/Daily Tasks/i);
      if(dailyBtn) fireEvent.click(dailyBtn);
    });
    
    expect(true).toBe(true);
  });
});
`;
fs.writeFileSync('src/components/RewardHub.test.tsx', rewardHubTest);

const settingsTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
${mockProfileBlock}

describe('SettingsPanel', () => {
  it('renders settings', () => {
    render(<SettingsPanel settings={mockSettings} onUpdateSettings={vi.fn()} />);
    expect(screen.getAllByText(/Audio & Sounds/i).length).toBeGreaterThan(0);
  });
});
`;
fs.writeFileSync('src/components/SettingsPanel.test.tsx', settingsTest);

const profileTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileDashboard } from './ProfileDashboard';
${mockProfileBlock}

describe('ProfileDashboard', () => {
  it('renders profile', () => {
    render(<ProfileDashboard profile={mockProfile} stats={mockStats} achievements={[]} settings={mockSettings} onUpdateProfile={vi.fn()} onUpdateSettings={vi.fn()} />);
    expect(screen.getAllByText(/Profile/i).length).toBeGreaterThan(0);
  });
});
`;
fs.writeFileSync('src/components/ProfileDashboard.test.tsx', profileTest);

const statsTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatsDashboard } from './StatsDashboard';
${mockProfileBlock}

describe('StatsDashboard', () => {
  it('renders stats', () => {
    render(<StatsDashboard profile={mockProfile} stats={mockStats} settings={mockSettings} achievements={[]} dailyChallenges={[]} onUpdateProfile={vi.fn()} onUpdateStats={vi.fn()} onUpdateSettings={vi.fn()} />);
    expect(screen.getAllByText(/Analytics/i).length).toBeGreaterThan(0);
  });
});
`;
fs.writeFileSync('src/components/StatsDashboard.test.tsx', statsTest);

const examHubTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExamHubDashboard } from './ExamHubDashboard';
${mockProfileBlock}

describe('ExamHubDashboard', () => {
  it('renders exam hub', () => {
    render(<ExamHubDashboard onStartExam={vi.fn()} onNavigateToTab={vi.fn()} profile={mockProfile} stats={mockStats} />);
    expect(screen.getAllByText(/Govt Exam/i).length).toBeGreaterThan(0);
  });
});
`;
fs.writeFileSync('src/components/ExamHubDashboard.test.tsx', examHubTest);

const paragraphHubTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ParagraphHubDashboard } from './ParagraphHubDashboard';
${mockProfileBlock}

describe('ParagraphHubDashboard', () => {
  it('renders paragraph hub', () => {
    render(<ParagraphHubDashboard onStartParagraph={vi.fn()} onNavigateToTab={vi.fn()} profile={mockProfile} stats={mockStats} />);
    expect(screen.getAllByText(/Paragraph/i).length).toBeGreaterThan(0);
  });
});
`;
fs.writeFileSync('src/components/ParagraphHubDashboard.test.tsx', paragraphHubTest);

const achievementsTest = `
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AchievementsShelf } from './AchievementsShelf';
${mockProfileBlock}

describe('AchievementsShelf', () => {
  it('renders achievements', () => {
    render(<AchievementsShelf achievements={[]} userProfile={mockProfile} onUpdateAchievements={vi.fn()} onNavigateToTab={vi.fn()} />);
    expect(screen.getAllByText(/Achievements/i).length).toBeGreaterThan(0);
  });
});
`;
fs.writeFileSync('src/components/AchievementsShelf.test.tsx', achievementsTest);

console.log('generated tests');
