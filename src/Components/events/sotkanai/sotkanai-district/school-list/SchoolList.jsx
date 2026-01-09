import React, { useState } from 'react';
import './SchoolList.css';
import { LocationCity } from "@mui/icons-material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


const Button = ({ text }) => {
  return (
    <button className="button-school font-landing-des1 ">
      <LocationCity />
      {text}
    </button>
  );
};

const SchoolList = ({participated_schools}) => {
  const [buttons, setButtons] = useState(participated_schools.slice(0, 6)); // Initially show only two rows
  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll(!showAll);
    if (!showAll) {
      setButtons(participated_schools);
    } else {
      setButtons(participated_schools.slice(0, 6)); // Show only two rows
    }
  };

  return (
    <div className='set-width'>
      <div className="school-landing-container">
        <div className="head-landing-heading1"> பாடசாலைகள் விபரம் </div>
        </div>
      <div className="button-school-container">
        {buttons.map((school, index) => (
          <Button key={index} text={school} />
          ))}
      </div>
      {!showAll && (
        <div className='button-school-container-arrow'>
          <button onClick={toggleShowAll} className="button-school">
            <KeyboardArrowDownIcon />
          </button>
        </div>
      )}
    </div>
    
  );
};

export default SchoolList;
