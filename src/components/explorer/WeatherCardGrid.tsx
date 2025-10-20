// @ts-nocheck
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Gauge, Sunrise, Sunset, Wind, Eye, Volume2, X } from "lucide-react";
import Image from "next/image";

const WeatherInfoCard = ({ title, value, icon, unit }) => (
  <Card className="text-center flex flex-col justify-center items-center p-2 bg-background/50">
    <CardHeader className="p-2">
      <div className="mx-auto bg-primary/10 p-2 rounded-full w-fit mb-2 text-primary">
        {icon}
      </div>
      <CardTitle className="text-sm font-headline">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-2">
      <p className="text-xl font-bold">{value} <span className="text-sm font-normal text-muted-foreground">{unit}</span></p>
    </CardContent>
  </Card>
);

const WeatherCardGrid = ({ regionName, weatherData, speakWeatherInfo, isSpeaking, stopSpeaking }) => {
  if (!weatherData) return null;

  const {
    temperature,
    feelsLike,
    humidity,
    pressure,
    windSpeed,
    windDirection,
    clouds,
    visibility,
    description,
    icon,
    sunrise,
    sunset,
  } = weatherData;

  const formatTime = (timestamp, timezone) => {
    return new Date((timestamp + timezone) * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };
  
  const windAngleToDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return directions[Math.round(deg / 45) % 8];
  }

  return (
    <div className="w-full relative">
      <button onClick={() => isSpeaking ? stopSpeaking() : speakWeatherInfo(weatherData)} className="absolute top-0 right-0 p-2">
        {isSpeaking ? <X className="w-6 h-6 text-destructive" /> : <Volume2 className="w-6 h-6 text-primary" />}
      </button>
      <h2 className="text-2xl font-bold font-headline mb-4 text-center">Météo pour {regionName}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <Card className="col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-1 flex flex-col items-center justify-center bg-primary/90 text-primary-foreground p-4">
          <img
            src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
            alt={description}
            width={100}
            height={100}
          />
          <p className="text-5xl font-bold">{Math.round(temperature)}°C</p>
          <p className="capitalize text-lg">{description}</p>
          <p className="text-sm">Ressenti: {Math.round(feelsLike)}°C</p>
        </Card>

        <WeatherInfoCard title="Humidité" value={`${humidity}`} icon={<Droplets className="w-6 h-6"/>} unit="%" />
        <WeatherInfoCard title="Pression" value={pressure} icon={<Gauge className="w-6 h-6"/>} unit="hPa" />
        <WeatherInfoCard title="Couverture Nuageuse" value={clouds} icon={<Cloud className="w-6 h-6"/>} unit="%" />
        <WeatherInfoCard title="Visibilité" value={visibility / 1000} icon={<Eye className="w-6 h-6"/>} unit="km" />
        
        <Card className="text-center flex flex-col justify-center items-center p-2 bg-background/50">
            <CardHeader className="p-2">
                <div className="mx-auto bg-primary/10 p-2 rounded-full w-fit mb-2 text-primary">
                    <Wind className="w-6 h-6"/>
                </div>
                <CardTitle className="text-sm font-headline">Vent</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                <p className="text-xl font-bold">{Math.round(windSpeed * 3.6)} <span className="text-sm font-normal text-muted-foreground">km/h</span></p>
                <p className="text-sm text-muted-foreground">{windAngleToDirection(windDirection)} ({windDirection}°)</p>
            </CardContent>
        </Card>

        <WeatherInfoCard title="Lever du soleil" value={formatTime(sunrise, weatherData.timezone)} icon={<Sunrise className="w-6 h-6"/>} unit="" />
        <WeatherInfoCard title="Coucher du soleil" value={formatTime(sunset, weatherData.timezone)} icon={<Sunset className="w-6 h-6"/>} unit="" />
      </div>
    </div>
  );
};

export default WeatherCardGrid;
