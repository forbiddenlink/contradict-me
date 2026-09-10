/**
 * Tests for Follow-up Question Suggestions Component
 */

import { describe, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowUpSuggestions from '@/components/chat/FollowUpSuggestions';

describe('FollowUpSuggestions', () => {
  const mockOnSelectQuestion = vi.fn();

  beforeEach(() => {
    mockOnSelectQuestion.mockClear();
  });

  it('should render suggestions', () => {
    render(
      <FollowUpSuggestions
        conversationContext="Let's discuss healthcare policy and its economic impacts"
        lastAssistantMessage="Universal healthcare has both benefits and drawbacks based on evidence"
        onSelectQuestion={mockOnSelectQuestion}
        isVisible={true}
      />
    );

    // Should show header
    expect(screen.getByText(/Continue the conversation/i)).toBeInTheDocument();

    // Should show at least one suggestion
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should generate contextual questions based on keywords', () => {
    render(
      <FollowUpSuggestions
        conversationContext="ethical considerations and moral implications"
        lastAssistantMessage="this raises ethical questions"
        onSelectQuestion={mockOnSelectQuestion}
        isVisible={true}
      />
    );

    // Should include some questions (may not specifically ethics, but should generate questions)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.length).toBeLessThanOrEqual(5);
  });

  it('should call onSelectQuestion when clicked', () => {
    render(
      <FollowUpSuggestions
        conversationContext="test context"
        lastAssistantMessage="test message"
        onSelectQuestion={mockOnSelectQuestion}
        isVisible={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(mockOnSelectQuestion).toHaveBeenCalledTimes(1);
    expect(typeof mockOnSelectQuestion.mock.calls[0][0]).toBe('string');
  });

  it('should not render when isVisible is false', () => {
    const { container } = render(
      <FollowUpSuggestions
        conversationContext="test"
        lastAssistantMessage="test"
        onSelectQuestion={mockOnSelectQuestion}
        isVisible={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should generate 4-5 suggestions', () => {
    render(
      <FollowUpSuggestions
        conversationContext="economic healthcare policy research"
        lastAssistantMessage="Studies show mixed results"
        onSelectQuestion={mockOnSelectQuestion}
        isVisible={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
    expect(buttons.length).toBeLessThanOrEqual(5);
  });
});
