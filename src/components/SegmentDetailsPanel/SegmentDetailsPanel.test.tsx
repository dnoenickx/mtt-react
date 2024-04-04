import { render, screen } from '@test-utils';
import { SegmentDetailsPanel } from './SegmentDetailsPanel';

describe('SegmentDetailsPanel', () => {
  it('has correct Vite guide link', () => {
    render(<SegmentDetailsPanel />);
    expect(screen.getByText('this guide')).toHaveAttribute(
      'href',
      'https://mantine.dev/guides/vite/'
    );
  });
});
