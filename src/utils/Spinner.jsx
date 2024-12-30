import React from 'react';
import { BiLoaderAlt } from 'react-icons/bi';

export const Spinner = ({ size = 'text-2xl', color = 'text-green-500' }) => (
  <div className="flex justify-center items-center">
    <BiLoaderAlt className={`animate-spin ${size} ${color}`} />
  </div>
);

export const ButtonSpinner = () => (
  <Spinner size="text-xl" color="text-white" />
);