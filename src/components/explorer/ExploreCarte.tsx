'use client';

import React from 'react';
import './ExploreCarte.css';

interface Culture {
  id: number;
  culture_image: string;
  culture_name: string;
}

interface ExploreCarteProps {
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
}

const ExploreCarte: React.FC<ExploreCarteProps> = ({ category, setCategory }) => {
  const culture_list: Culture[] = [
    {
      id: 1,
      culture_image: '/assets/culture/Fruits.jpg',
      culture_name: 'Fruits',
    },
    {
      id: 2,
      culture_image: '/assets/culture/Legumes.jpg',
      culture_name: 'Legumes',
    },
    {
      id: 3,
      culture_image: '/assets/culture/Céréales.jpg',
      culture_name: 'Céréales',
    },
    {
      id: 4,
      culture_image: '/assets/culture/Légumineuses.jpg',
      culture_name: 'Légumineuses',
    },
    {
      id: 5,
      culture_image: '/assets/culture/Graines oléagineuses.jpg',
      culture_name: 'Graines oléagineuses',
    },
    {
      id: 6,
      culture_image: '/assets/culture/Plantes à racines et tubercules.jpg',
      culture_name: 'Plantes à racines et tubercules',
    },
    {
      id: 7,
      culture_image: '/assets/culture/Plantes aromatiques et médicinales.jpg',
      culture_name: 'Plantes aromatiques/ médicinales',
    },
    {
      id: 8,
      culture_image: '/assets/culture/Cultures mar.jpg',
      culture_name: 'Cultures maraîchères ',
    },
  ];

  return (
    <div className="explore-carte" id="explore-carte">
      <h1>Mon Pays, Ma Diversité</h1>
      <p className="explore-carte-text">
        Choisissez parmi un large éventail de régions culturelles qui mettent en valeur des traditions, une cuisine et un patrimoine uniques. Notre mission est de promouvoir la compréhension et l'appréciation de la riche diversité de notre pays.
      </p>

      <div className="explore-carte-list">
        {culture_list.map((item, index) => (
          <div
            key={index}
            className="explore-carte-list-item"
            onClick={() => setCategory(prev => (prev === item.culture_name ? 'All' : item.culture_name))}
          >
            <div className={`image-container ${category === item.culture_name ? 'active' : ''}`}>
              <img src={item.culture_image} alt={item.culture_name} />
            </div>
            <p>{item.culture_name}</p>
          </div>
        ))}
      </div>

      <br />
      <hr />
    </div>
  );
};

export default ExploreCarte;
