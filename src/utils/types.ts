export interface Proposal {
  details: string;
  createdAt: string;
  createdBy: string;
  proposedBy: string;
  proposerMembership: string;
  txHash: string;
  proposalType: string;
  actionGasEstimate: number;
  proposalOffering: number;
  tributeOffered: number;
  votingStarts: number;
  votingEnds: number;
}
