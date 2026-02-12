import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Package, CreditCard } from 'lucide-react';

const steps = [
  { number: 1, title: 'Lokasi', icon: MapPin },
  { number: 2, title: 'Tanggal', icon: Calendar },
  { number: 3, title: 'Waktu', icon: Clock },
  { number: 4, title: 'Durasi', icon: Package },
  { number: 5, title: 'Ringkasan', icon: CreditCard }
];

const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted ? '#000000' : isActive ? '#000000' : '#E5E7EB'
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted || isActive ? 'text-white' : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
              </motion.div>
              <span className={`text-xs font-semibold hidden md:block ${
                isActive ? 'text-black' : 'text-gray-600'
              }`}>
                {step.title}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-black"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;