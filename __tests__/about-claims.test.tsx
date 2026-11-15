import { render, screen } from '@testing-library/react';
import AboutAuthorPage from '@/app/about/liz-stein/page';

describe('About the author page', () => {
  it('does not list a GPT-4 stack chip, since the chat runs on Algolia Agent Studio', () => {
    render(<AboutAuthorPage />);
    expect(screen.queryByText(/GPT-?4/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Algolia/i).length).toBeGreaterThan(0);
  });
});
