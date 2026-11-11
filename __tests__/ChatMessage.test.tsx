import { render, screen } from '@testing-library/react';
import ChatMessage from '@/components/chat/ChatMessage';
import { Message, Argument } from '@/lib/types';

const mockArgument: Argument = {
  objectID: 'test-arg-1',
  position: 'against',
  opposingBeliefs: ['Test belief'],
  mainClaim: 'Test claim for argument card',
  evidence: 'Test evidence',
  supportingPoints: ['Point 1'],
  limitations: 'Test limitations',
  sourceMetadata: {
    title: 'Test Study',
    authors: ['Dr. Test'],
    institution: 'Test University',
    publicationType: 'Study',
    yearPublished: 2024,
  },
  qualityScore: 85,
  sourceCredibility: 90,
  evidenceStrength: 80,
  argumentCoherence: 88,
  metadata: {
    argumentType: 'empirical',
    evidenceType: 'study',
    domain: 'test',
    subDomain: 'testing',
    strength: 'strong',
    tags: ['test'],
    createdAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-01T00:00:00Z',
    reviewStatus: 'verified',
  },
};

describe('ChatMessage', () => {
  describe('User Messages', () => {
    const userMessage: Message = {
      id: 'user-1',
      role: 'user',
      content: 'This is a user message',
      timestamp: Date.now(),
    };

    it('renders user message content', () => {
      render(<ChatMessage message={userMessage} />);
      expect(screen.getByText('This is a user message')).toBeInTheDocument();
    });

    it('applies user message styling (right-aligned)', () => {
      render(<ChatMessage message={userMessage} />);
      const container = screen.getByText('This is a user message').closest('.flex');
      expect(container).toHaveClass('justify-end');
    });

    it('displays timestamp for user messages', () => {
      const fixedTime = new Date('2024-01-15T14:30:00').getTime();
      const message = { ...userMessage, timestamp: fixedTime };
      render(<ChatMessage message={message} />);
      // Timestamp should be displayed
      expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
    });
  });

  describe('Assistant Messages', () => {
    const assistantMessage: Message = {
      id: 'assistant-1',
      role: 'assistant',
      content: 'Line 1\nLine 2\nLine 3\nThis is the rest of the content.',
      timestamp: Date.now(),
    };

    it('renders assistant message content', () => {
      render(<ChatMessage message={assistantMessage} />);
      expect(screen.getByText('Line 1')).toBeInTheDocument();
    });

    it('applies assistant message styling (left-aligned)', () => {
      render(<ChatMessage message={assistantMessage} />);
      const messageText = screen.getByText('Line 1');
      const container = messageText.closest('.flex.justify-start');
      expect(container).toBeInTheDocument();
    });

    it('parses intro section (first 3 lines)', () => {
      render(<ChatMessage message={assistantMessage} />);
      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
      expect(screen.getByText('Line 3')).toBeInTheDocument();
    });

    it('parses rest section (after first 3 lines)', () => {
      render(<ChatMessage message={assistantMessage} />);
      expect(screen.getByText('This is the rest of the content.')).toBeInTheDocument();
    });
  });

  describe('Special Content Formatting', () => {
    it('renders numbered arguments in gray box when properly formatted', () => {
      // The regex checks section.match(/^\*\*\d+\./) - section must START with **1.
      const message: Message = {
        id: 'assistant-2',
        role: 'assistant',
        content:
          'Intro line 1\nIntro line 2\nIntro line 3\n**1. First argument**\nArgument content here',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      // When regex matches, it renders with special styling and strips the **
      expect(screen.getByText('1. First argument')).toBeInTheDocument();
      expect(screen.getByText('Argument content here')).toBeInTheDocument();
    });

    it('renders source citations with 📚 icon', () => {
      const message: Message = {
        id: 'assistant-3',
        role: 'assistant',
        content: 'Line 1\nLine 2\nLine 3\n📚 Source: Harvard Study 2024',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(screen.getByText(/📚 Source: Harvard Study 2024/)).toBeInTheDocument();
    });

    it('renders evidence strength lines', () => {
      const message: Message = {
        id: 'assistant-4',
        role: 'assistant',
        content: 'Line 1\nLine 2\nLine 3\nEvidence Strength: 85/100',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(screen.getByText('Evidence Strength: 85/100')).toBeInTheDocument();
    });

    it('renders nuance sections', () => {
      const message: Message = {
        id: 'assistant-5',
        role: 'assistant',
        content: 'Line 1\nLine 2\nLine 3\n**Nuance**: This has important caveats',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      // Component now renders bold markdown inline - check for the content
      expect(screen.getByText(/Nuance/)).toBeInTheDocument();
      expect(screen.getByText(/This has important caveats/)).toBeInTheDocument();
    });

    it('splits content by --- delimiter', () => {
      const message: Message = {
        id: 'assistant-6',
        role: 'assistant',
        content: 'Line 1\nLine 2\nLine 3\n---\nSection after delimiter',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(screen.getByText('Section after delimiter')).toBeInTheDocument();
    });
  });

  describe('ArgumentCard Integration', () => {
    // ArgumentCardEnhanced loads through next/dynamic. A cold import can take
    // longer than findByText's 1s default under load, so the first test in this
    // block failed while later ones (warm module) passed. Warm it up front.
    beforeAll(async () => {
      await import('@/components/arguments/ArgumentCardEnhanced');
    });

    it('renders ArgumentCard when arguments are provided', async () => {
      const message: Message = {
        id: 'assistant-6',
        role: 'assistant',
        content: 'Here is a counterargument',
        arguments: [mockArgument],
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(await screen.findByText('Test claim for argument card')).toBeInTheDocument();
    });

    it('renders multiple ArgumentCards', async () => {
      const secondArgument = {
        ...mockArgument,
        objectID: 'test-arg-2',
        mainClaim: 'Second test claim',
      };
      const message: Message = {
        id: 'assistant-7',
        role: 'assistant',
        content: 'Multiple counterarguments',
        arguments: [mockArgument, secondArgument],
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(await screen.findByText('Test claim for argument card')).toBeInTheDocument();
      expect(await screen.findByText('Second test claim')).toBeInTheDocument();
    });

    it('does not render ArgumentCard for user messages', async () => {
      const message: Message = {
        id: 'user-2',
        role: 'user',
        content: 'User message',
        arguments: [mockArgument], // Should be ignored
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(screen.queryByText('Test claim for argument card')).not.toBeInTheDocument();
    });

    it('handles empty arguments array gracefully', () => {
      const message: Message = {
        id: 'assistant-8',
        role: 'assistant',
        content: 'No arguments here',
        arguments: [],
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(screen.getByText('No arguments here')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty message content', () => {
      const message: Message = {
        id: 'empty-1',
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it('handles message with only whitespace', () => {
      const message: Message = {
        id: 'whitespace-1',
        role: 'assistant',
        content: '   \n\n   ',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      // Should render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it('handles very long messages', () => {
      const longContent = 'A'.repeat(5000);
      const message: Message = {
        id: 'long-1',
        role: 'user',
        content: longContent,
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('handles messages with special characters', () => {
      const message: Message = {
        id: 'special-1',
        role: 'user',
        content: '<script>alert("xss")</script> & "quotes" \'apostrophes\'',
        timestamp: Date.now(),
      };
      render(<ChatMessage message={message} />);
      // React escapes HTML by default
      expect(screen.getByText(/<script>/)).toBeInTheDocument();
    });
  });
});
