const fs = require('fs');

const testFiles = [
  'src/components/LeaderboardsDashboard.test.tsx',
  'src/components/GameZone.test.tsx',
  'src/components/RewardHub.test.tsx',
  'src/components/SettingsPanel.test.tsx',
  'src/components/ProfileDashboard.test.tsx',
  'src/components/StatsDashboard.test.tsx',
  'src/components/ExamHubDashboard.test.tsx',
  'src/components/ParagraphHubDashboard.test.tsx',
  'src/components/AchievementsShelf.test.tsx'
];

const mockCode = `
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAnonymous: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    isFirebaseActive: true
  })
}));
`;

for (const file of testFiles) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('useAuth')) {
      code = code.replace("describe('", mockCode + "\ndescribe('");
      fs.writeFileSync(file, code);
  }
}
console.log('applied mocks');
