import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsPanel } from './SettingsPanel';
import { INITIAL_SETTINGS } from '../utils/storage';

describe('SettingsPanel', () => {
  it('renders correctly', () => {
    render(<SettingsPanel
      settings={INITIAL_SETTINGS as any}
      onUpdateSettings={() => {}}
      onUpdateProfile={() => {}}
      onImportExport={() => {}}
      isCloudActive={false}
      onLinkCloud={() => {}}
    />);
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });
});
