
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface WizardNavigationProps {
  activeTab: string;
  isFirstTab: boolean;
  isLastTab: boolean;
  tabStatus: Record<string, boolean>;
  handleNextTab: () => void;
  handlePrevTab: () => void;
  handleSubmit: () => void;
  onCancel: () => void;
}

export function WizardNavigation({
  activeTab,
  isFirstTab,
  isLastTab,
  tabStatus,
  handleNextTab,
  handlePrevTab,
  handleSubmit,
  onCancel
}: WizardNavigationProps) {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={isFirstTab ? onCancel : handlePrevTab}
        className="px-4 gap-2"
      >
        {isFirstTab ? (
          'Cancel'
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" /> Back
          </>
        )}
      </Button>
      
      <div className="flex gap-2">
        {isLastTab && (
          <Button 
            onClick={handleSubmit} 
            disabled={!tabStatus.basic}
            className="gap-2"
          >
            Create Project <Check className="h-4 w-4" />
          </Button>
        )}
        
        {!isLastTab && (
          <Button 
            onClick={handleNextTab}
            disabled={activeTab === 'basic' && !tabStatus.basic}
            className="gap-2"
          >
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default WizardNavigation;
