import { Metadata } from 'next';
import PolicyPlatformContainer from '@/components/policy-graph/PolicyPlatformContainer';

export const metadata: Metadata = {
  title: 'Control AI Policy Platform | Animated Constellation & Knowledge Graph',
  description: 'Futuristic AI-powered Policy Platform with interactive 2.5D knowledge constellation, animated fiber-optic arcs, and compliance insights.',
};

export default function PolicyGraphPage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      <PolicyPlatformContainer />
    </main>
  );
}
