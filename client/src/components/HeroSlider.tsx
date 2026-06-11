import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../data/products';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface HeroSliderProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export interface SlideItem {
  id: number;
  productId: number;
  badge: string;
  title: string;
  subtitle: string;
  tagline: string;
  features: string[];
  specs: string[];
  buttonText: string;
  image: string;
}

interface HeroSliderProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  slides?: SlideItem[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ products, onSelectProduct, slides: customSlides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const defaultSlides: SlideItem[] = [
    {
      id: 0,
      productId: 2, // MacBook Pro
      badge: "REFURBISHED",
      title: "MACBOOK PRO M1",
      subtitle: "8GB RAM | 256GB SSD | RETINA DISPLAY",
      tagline: "Eco-Friendly Savings | Verified Performance",
      features: ["Apple M1 Chip", "15+ Hr Battery", "Silent Cooling", "True Tone Display"],
      specs: [
        "M1 8-Core CPU & GPU",
        "Retina 13.3\" Display",
        "92% Battery Health",
        "Tested & Certified",
        "Includes Original Charger"
      ],
      buttonText: "SHOP NOW",
      image: "/refurbished_laptop.png"
    },
    {
      id: 1,
      productId: 1, // Leather Jacket
      badge: "VINTAGE DEALS",
      title: "CLASSIC BOMBER JACKET",
      subtitle: "GENUINE LEATHER | 90s RETRO COWHIDE",
      tagline: "Timeless Quality | Rugged Appeal",
      features: ["Premium Leather", "Heavy Brass Zips", "Quilted Lining", "Timeless Cut"],
      specs: [
        "100% Genuine Leather",
        "Heavy Duty YKK Hardware",
        "Size L (Chest 42-44\")",
        "No Tears or Defects",
        "Excellent Patina"
      ],
      buttonText: "SHOP NOW",
      image: "/vintage_jacket.png"
    },
    {
      id: 2,
      productId: 4, // Canon Camera
      badge: "COLLECTIBLES",
      title: "CANON AE-1 SLR CAMERA",
      subtitle: "35MM FILM | FD 50MM F/1.8 PRIME LENS",
      tagline: "Classic Analog Vibe | Fully Tested & Serviced",
      features: ["Light Seals Replaced", "Working Meter", "Clear Finder", "No Fungus/Haze"],
      specs: [
        "Canon FD 50mm Lens",
        "1/1000s Shutter Speed",
        "Satin Chrome Finish",
        "Free Neck Strap",
        "Battery Chamber Clean"
      ],
      buttonText: "SHOP NOW",
      image: "/vintage_camera.png"
    }
  ];

  const slides = customSlides || defaultSlides;

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopAutoplay();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    startAutoplay();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopAutoplay();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    startAutoplay();
  };

  const handleDotClick = (index: number) => {
    stopAutoplay();
    setCurrentSlide(index);
    startAutoplay();
  };

  // Find the product corresponding to the current slide
  const handleShopNow = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      onSelectProduct(product);
    }
  };


  return (
    <div className="hero-section-container">
      {/* Left interactive banner slider */}
      <div className="main-banner-slider" onMouseEnter={stopAutoplay} onMouseLeave={startAutoplay}>
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div 
              key={slide.id} 
              className={`slide ${isActive ? 'active' : ''}`}
              style={{ display: isActive ? 'flex' : 'none' }}
            >
              <div className="slide-content">
                <div className="slide-badge-row">
                  <span className="badge-tag">{slide.badge}</span>
                  <div className="slide-brand-watermark">VALUEBAY</div>
                </div>

                <h2 className="slide-title">{slide.title}</h2>
                <h3 className="slide-subtitle">{slide.subtitle}</h3>
                <p className="slide-tagline">{slide.tagline}</p>

                {/* Features icons */}
                <div className="slide-features">
                  {slide.features.map((feat, i) => (
                    <div key={i} className="feature-item">
                      <span className="feature-bullet">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Technical specifications overlay box */}
                <div className="slide-specs-box">
                  <div className="slide-specs-text">
                    {slide.specs.join(" | ")}
                  </div>
                </div>

                <button 
                  className="slide-shop-button" 
                  onClick={() => handleShopNow(slide.productId)}
                >
                  SHOP NOW
                </button>
              </div>
              <div className="slide-image-container">
                <img src={slide.image} alt={slide.title} className="slide-image" />
              </div>
            </div>
          );
        })}

        {/* Carousel arrows */}
        <button className="slider-arrow arrow-left" onClick={handlePrev} aria-label="Previous Slide">
          <ChevronLeftIcon size={18} />
        </button>
        <button className="slider-arrow arrow-right" onClick={handleNext} aria-label="Next Slide">
          <ChevronRightIcon size={18} />
        </button>

        {/* Slider dots */}
        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
