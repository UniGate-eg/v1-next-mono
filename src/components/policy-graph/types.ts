export type ViewMode = 'constellation' | 'drilldown' | 'tree';

export interface DomainNode {
  id: string;
  name: string;
  category: string;
  percentage: number;
  color: string;
  glowColor: string;
  radius: number;
  x: number; // Normalized coordinates -1 to 1
  y: number;
  subNodeCount: number;
  subNodes: SatelliteNode[];
  description?: string;
}

export interface SatelliteNode {
  id: string;
  label: string;
  count: number;
  color: string;
  angleOffset: number;
  distance: number;
}

export interface CategoryBranch {
  id: string;
  icon: 'services' | 'entities' | 'laws' | 'kpis' | 'regulations';
  label: string;
  count: number;
  isActive?: boolean;
}

export interface SubLawItem {
  id: string;
  title: string;
  gaps: number;
  status: 'positive' | 'warning' | 'negative';
  sentiment: number;
  servicesCount: number;
  entitiesCount: number;
  complaintsCount: number;
  regulationsCount: number;
  lastUpdated: string;
  description: string;
  category: string;
}

export interface RIConcern {
  id: string;
  type: 'critical' | 'deregulation';
  title: string;
  lawName: string;
  description: string;
  targetLawId?: string;
}

export interface GraphKPIMetrics {
  complianceRate: number;
  totalLaws: string;
  publicEngagement: string;
  implementationRate: number;
}
