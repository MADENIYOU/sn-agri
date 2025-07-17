//@ts-nocheck

"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import WeatherCardGrid from "./WeatherCardGrid";
import { Skeleton } from "@/components/ui/skeleton";

const CarteSenegal: React.FC = () => {
  const [clickedRegion, setClickedRegion] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [regionName, setRegionName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchWeatherByCoords = async (
    lat: number,
    lon: number,
    fallbackRegion = ""
  ) => {
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error("OpenWeather API key is missing.");
      setLoading(false);
      return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      setWeatherData({
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        clouds: data.clouds.all,
        visibility: data.visibility,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone,
      });
      setRegionName(data.name || fallbackRegion);
    } catch (error) {
      console.error("Erreur lors de la récupération météo :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialWeather = () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by this browser.");
        fetchWeatherByCoords(14.7167, -17.4677, "Dakar"); // Fallback to Dakar
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          console.warn("Geolocation permission denied. Falling back to Dakar.");
          fetchWeatherByCoords(14.7167, -17.4677, "Dakar"); // Fallback to Dakar
        }
      );
    };
    fetchInitialWeather();
  }, []);

  const fetchWeatherByRegion = async (region: string) => {
    setLoading(true);
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      console.error("OpenWeather API key is missing.");
      setLoading(false);
      return;
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${region},SN&appid=${apiKey}&units=metric&lang=fr`;

    try {
      const response = await axios.get(url);
      const data = response.data;
      setWeatherData({
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        clouds: data.clouds.all,
        visibility: data.visibility,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset,
        timezone: data.timezone,
      });
      setRegionName(region);
    } catch (error) {
      console.error(`Error fetching weather for ${region}:`, error);
      setWeatherData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (region: string) => {
    setClickedRegion(region);
    fetchWeatherByRegion(region);
  };

  return (
    <div className="w-full space-y-8">
      <div className="w-full max-w-7xl mx-auto">
        {loading ? (
          <>
            <Skeleton className="h-8 w-1/3 mx-auto mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                 <Skeleton className="h-48 col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-1"/>
                 <Skeleton className="h-48"/>
                 <Skeleton className="h-48"/>
                 <Skeleton className="h-48"/>
                 <Skeleton className="h-48"/>
                 <Skeleton className="h-48"/>
                 <Skeleton className="h-48"/>
                 <Skeleton className="h-48"/>
            </div>
          </>
        ) : weatherData ? (
          <WeatherCardGrid regionName={regionName} weatherData={weatherData} />
        ) : (
          <div className="text-center p-8 text-destructive-foreground bg-destructive/80 rounded-lg">
             <h2 className="text-xl font-bold">Erreur de chargement</h2>
             <p>Impossible de récupérer les données météo. Veuillez réessayer plus tard.</p>
          </div>
        )}
      </div>

      <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg shadow-inner bg-background/50 border min-h-[500px]">
        {/* The user will replace this commented out SVG block with their own code */}
        {/*
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          viewBox="-60 355 788 609"
          className="carte-senegal rounded-2xl max-w-full max-h-full bg-gray-400"
        >
          <defs>
            <style type="text/css">
              {`
                  .carte-senegal-container {
                      width: 50%;
                      float: left;
                  }

                .land {
                  fill: #4CAF50;
                  fill-opacity: 1;
                  stroke: white;
                  stroke-opacity: 1;
                  stroke-width: 0.5;
                  transition: fill 0.3s ease;
                }
                .land:hover {
                  fill: yellow;
                  cursor: pointer;
                }
                  .land:active {
                      fill: red;
                      cursor: pointer;
                  }
                  .region-name {
                  font-size: 14px;
                  font-weight: bold;
                  text-anchor: middle;
                  fill: black;
                }
              `}
            </style>
          </defs>
          <g>
            <path
              id="SN-DK"
              title="Dakar"
              className="land"
              d="M37.765,531.05l0.498,0.462l0.396,4.828l0.854,1.479l1.048,2.896l0.647,2.635l0.117,1.731l0.252,0.339l0.951,0.303l0.198,1.3l-0.174,1.208l-0.482,0.444l-1.468,0.342l-0.46,0.506l-0.025,0.293l0.373,0.041l-0.022,0.732l-0.493,2.504l1.133,0.989l-0.003,1.556l-0.704,3.099l0.673,1.922l-1.87,1.126l0,0l-1.386,-2.947l-3.44,-4.147l-5.689,-4.293l-1.219,-0.579l-1.316,-0.423l-0.332,0.277l-5.067,-2.192l-2.771,-0.719l-2.769,-0.034l-2.541,0.625l-1.006,0.643l-0.537,0.866l0.134,0.958l0.578,0.281l0.556,-0.117l0.068,0.57l-0.754,0.65l0.488,0.955l-0.111,0.336l-0.507,-0.118l-0.283,-0.586l-0.334,0.253l0.219,0.142l0.028,0.31l-0.274,0.112l0.63,0.366l0.137,0.141l0.411,0.141l-0.082,0.563l-0.987,0.453l-0.233,0.756l0.397,0.678l-0.384,0.451l-0.325,-0.85l-0.744,-0.531l0.109,-0.576l-0.466,-0.612l-1.069,-0.191l-0.137,-0.506l-0.295,0.398l-0.299,-0.174l-0.42,0.226l0.097,-1.048l-0.837,-0.811l0.384,-0.508l-1.398,-0.93l-0.274,-0.845l-0.658,0.028l-0.055,-0.282l-0.521,-0.112l-0.082,-0.761l-1.124,-1.183l-1.48,-0.282l0.384,-1.183l0.676,0.366l0.229,-0.311l0.736,0.07l0.113,-0.492l1.299,0.05l0.675,-0.275l0.74,-0.93l1.042,0.451l2.775,-0.535l7.204,-2.876l0.384,-0.366l0.247,0.142l0.11,-0.339l1.919,-0.423l0.274,-0.395l7.375,-3.1L37.765,531.05z"
              onClick={() => handleClick("Dakar")}
            ><title>Dakar</title></path>
            <path
              id="SN-DB"
              title="Diourbel"
              className="land"
              d="M101.156,561.749l-0.571,-1.517l-4.896,0.453l-2.245,-0.642l-0.039,-0.425l-1.345,-0.921l-0.985,-1.402l0.123,-0.323l-0.641,-0.172l-0.307,-0.748l-0.758,0.179l-0.334,-0.391l0.255,-0.972l-0.678,-0.167l0.108,-1.629l2.549,-3.529l1.178,-0.517l0.562,-1.851l-0.453,-0.148l-0.087,-0.836l0.387,-0.491l0.492,-2.009l-5.154,-4.347l0.549,-1.286l1.885,-1.671l-0.335,-2.032l-1.113,-1.494l-1.591,-1.298l-3.055,-3.92l0.522,-0.628l2.19,-2.004l1.752,-0.868l4.336,-0.918l6.312,-1.922l0.526,-0.213l-0.102,-0.691l3.128,-0.163l2.473,-1.621l2.85,-0.82l5.121,0.242l0.301,0.322l0.576,-0.167l1.446,0.347l0.705,-1.018l0.32,0.27l-0.296,0.895l1.931,0.601l0.415,-0.523l0.712,-0.047l0.623,0.549l-0.021,0.818l4.506,1.212l2.633,1.171l0.746,0.513l-0.305,0.467l0.345,1.501l1.103,-0.371l0.356,0.455l0.926,0.102l4.052,-1.1l0,0l2.456,-0.023l3.048,0.528l2.132,-0.416l1.695,0.13l1.911,-0.918l1.805,-0.453l2.67,0.861l2.022,1.057l0.676,-1.497l0.692,-0.648l3.841,0.165l0.17,-0.539l1.366,-1.081l1.148,-0.332l1.705,0.351l0.087,0.398l-0.343,0.321l6.167,-0.918l0.205,0.542l1.163,1.139l3.894,1.746l1.165,1.525l0.345,1.341l1.294,2.242l1.261,1.023l1.805,-0.166l1.551,-0.873l2.435,-3.345l0.776,-0.437l0.686,0.043l0.573,0.342l0.349,1.181l1.903,2.06l0.785,1.393l0.018,0.821l-0.515,0.91l2.437,1.114l1.623,0.422l-0.403,0.444l5.955,3.67l4.17,-1.512l1.243,-0.148l2.12,0.467l2.973,1.159l0.176,0.649l-0.244,1.761l1.441,0.823l0,0l-0.847,0.873l-2.024,4.314l-0.615,1.64l-0.219,1.562l-4.985,1.1l-4.162,3.498l-0.851,-0.029l0,0l-0.577,-0.831l-0.236,-1.324l-0.996,-0.894l-0.521,1.345l-0.461,-0.035l-2.089,-0.716l0.147,-1.709l-1.586,0.604l-1.477,-1.219l0.244,-1.572l-1.109,-0.103l-1.174,0.804l-1.033,-0.298l-1.137,0.56l-0.379,0.371l-0.135,2.343l-2.738,-1.656l-2.284,-0.796l-2.333,-1.597l-2.09,-1.002l-1.09,0.645l-0.757,3.952l0.605,4.495l-0.189,1.836l0.247,0.926l-1.11,3.352l-1.349,1.504l-3.079,2.237l-1.81,0.802l-2.543,0.542l-3.486,2.019l-4.618,0.01l-1.254,0.341l-2.139,-0.575l-1.909,-0.725l-0.661,-1.019l-0.07,-1.564l-2.863,0.274l-0.562,0.953l-2.53,-0.162l-0.626,0.204l-2.397,-0.343l-2.45,-0.957l-0.55,0.239l-0.134,-0.588l-0.388,-0.161l-0.844,0.316l-1.137,-0.398l0.008,-0.694l-0.307,-0.19l-1.234,0.303l-2.993,-1.542l-0.784,0.719l-3.576,-0.318l-1.371,0.026l-0.78,0.363l-1.898,-0.229l-0.718,-0.582l-1.674,-0.236l-0.647,-0.732l-0.966,-0.263l-0.253,-0.953l-1.42,-0.418l-1.699,0.914l-0.655,-0.431l-1.133,0.601l-0.639,-0.092l-0.724,0.366l-3.229,-0.004l-1.548,0.725l-1.672,-0.574L101.156,561.749z"
              onClick={() => handleClick("Diourbel")}
              ><title>Diourbel</title></path>
          </g>
        </svg>
        */}
      </div>
    </div>
  );
};

export default CarteSenegal;
