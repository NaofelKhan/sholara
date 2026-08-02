import { useState } from 'react';
//import Sidebar from '../components/Sidebar';
//import Header from '../components/Header';
import { DashboardLayout } from "../components/layout/DashboardLayout";
import HeroBanner from '../components/HeroBanner';
import CategoryFilters from '../components/CategoryFilters';
import SkillCard from '../components/SkillCard';
import ActiveRequests from '../components/ActiveRequests';
//import Footer from '../components/Footer';
import useSkills from '../hooks/useSkills';
import C from '../constants/colors';


export default function SkillExchange() {
  const [activeCategory, setActiveCategory] = useState('All Skills');
  const [activeTab, setActiveTab]           = useState('Skill Requests');

  const { skills, loading, error } = useSkills(activeCategory);

  return (
    <DashboardLayout>
      

      <main className="p-10" style={{ background: C.background }}>
        <div className="max-w-7xl mx-auto">
          <HeroBanner />

          <CategoryFilters active={activeCategory} onSelect={setActiveCategory} />

         

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-xl h-72 animate-pulse"
                  style={{ background: C.surfaceContainerHigh }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
              {(Array.isArray(skills) ? skills : []).map((skill) => (
                <SkillCard key={skill._id} skill={skill} />
              ))}
              {(!skills || skills.length === 0) && (
                <p className="col-span-3 text-center py-16" style={{ color: C.onSurfaceVariant }}>
                  No skills found for this category.
                </p>
              )}
            </div>
          )}

          <ActiveRequests />
        </div>
      </main>

      
    </DashboardLayout>
  );
}
