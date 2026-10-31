// Argument data structure
export interface Argument {
  objectID: string;
  position: string;
  opposingBeliefs: string[];
  mainClaim: string;
  evidence: string;
  supportingPoints: string[];
  limitations: string;
  counterCounterArguments?: string[];
  sourceMetadata: {
    title: string;
    authors: string[];
    institution: string;
    publicationType: string;
    journal?: string;
    yearPublished?: number;
    citationCount?: number;
    doi?: string;
    url?: string;
    sampleSize?: number;
    methodology?: string;
  };
  qualityScore: number;
  sourceCredibility: number;
  evidenceStrength: number;
  argumentCoherence: number;
  relevanceScore?: number;
  tags?: string[];
  metadata: {
    argumentType: 'empirical' | 'logical' | 'expert_opinion' | 'case_study';
    evidenceType: string;
    domain: string;
    subDomain: string;
    strength: 'strong' | 'moderate' | 'weak';
    tags: string[];
    createdAt: string;
    lastUpdated: string;
    reviewStatus: string;
    curator?: string;
  };
}

// Chat message structure
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  arguments?: Argument[];
  timestamp: number;
}
