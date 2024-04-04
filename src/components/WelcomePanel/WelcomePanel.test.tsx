import { render, screen } from '@test-utils';
import WelcomePanel from './WelcomePanel';

describe('WelcomePanel', () => {
  it('has correct Vite guide link', () => {
    render(<WelcomePanel />);
    expect(screen.getByText('this guide')).toHaveAttribute(
      'href',
      'https://mantine.dev/guides/vite/'
    );
  });
});
