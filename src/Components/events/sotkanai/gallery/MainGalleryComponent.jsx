import React from 'react';
import './photoGallery.css';
import { useEffect, useState } from 'react';
import SotkanaiData from '../Sotkanai-Data';
import './photoGallery.css';
import { Link } from 'react-router-dom';

const MainGalleryComponent = () => {
  const [sotkanaiData, setSotkanaiData] = useState([]);

  useEffect(() => {
      const fetchEvents = async () => {
        try {
            const response = await fetch('/api/sotkanais');
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            console.log(data);
            setSotkanaiData(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };
    fetchEvents();
  }, []);
  return (
    <div>
      {sotkanaiData.map((province, index) => (
        <div className='set-width'>
        <div className="province-container">
          <div className="province-landing-heading1">{province.provinceName}</div>
          <div className="images-container">
            {province.districts.map((district, index) => (
              <div key={index} className="district-container">
                <Link key={index} to="/events/sotkanai-district" state={{ districtData: district }}>
                  <img src={district.images[0]} alt={`District ${district.name}`} className='imgx' />
                  {/* <div className="district1-landing-heading1">{district.name}</div> */}
                  <div className="district-name">{district.name}</div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      ))}
    </div>
  );
};

export default MainGalleryComponent;