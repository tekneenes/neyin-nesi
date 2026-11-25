import { Product, SpecGroup, SpecItem, VerificationInfo } from '../../types';

export interface RawExtractedData {
  title?: string;
  brand?: string;
  model?: string;
  description?: string;
  categoryName?: string;
  categorySlug?: string;
  images: string[];
  price?: {
    current?: number;
    currency?: string;
    sellerName?: string;
  };
  rawSpecs: Array<{
    groupName?: string;
    label: string;
    value: string;
  }>;
  pageTextHighlights?: string;
  sourceUrl: string;
  sourceType: 'json_ld' | 'html_table' | 'github_repo' | 'fcc_filing' | 'newsroom_press';
}

export interface GitHubRepoData {
  owner: string;
  repo: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  license: string;
  topics: string[];
  readmeText: string;
  repoUrl: string;
}
