"use client";

import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const HeroHeader = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [
    "/assets/Header0.jpg",
    "/assets/header1.jpg",
    "/assets/header2.jpg",
    "/assets/header3.jpg",
    "/assets/header4.jpg",
    "/assets/Header6.jpg",
    "/assets/header7.jpg"
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="w-full flex justify-center py-10 md:py-16">
      <div className="relative w-full max-w-7xl h-[500px] overflow-hidden flex items-center rounded-2xl shadow-lg">
        <div className="absolute top-0 left-0 w-full h-full z-[-2]">
          {images.map((image, index) => (
            <div 
              key={index}
              className={`absolute top-0 left-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-[-1]"></div>
        
        <div className="text-white max-w-xl md:max-w-2xl lg:max-w-3xl p-8 md:p-12 z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
            Sénégal <br/>Baay Dundu
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8">
            Une plateforme collaborative fournissant aux agriculteurs et aux acteurs des données, des informations et des connexions pour favoriser la croissance et la durabilité.
          </p>
          <Button size="lg" asChild>
              <Link href="/dashboard">Entrer sur la Plateforme</Link>
          </Button>
        </div>
        
        <div className="absolute bottom-8 right-8 flex justify-end gap-2">
          {images.map((_, index) => (
            <span 
              key={index} 
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentImageIndex ? "bg-white scale-125" : "bg-white/50"}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroHeader;
