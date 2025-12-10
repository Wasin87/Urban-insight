import React from 'react';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import amazon from '../../../assets/brands/amazon.png';
import amaVec from '../../../assets/brands/amazon_vector.png';
import casio from '../../../assets/brands/casio.png';
import moonstar from '../../../assets/brands/moonstar.png';
import randStad from '../../../assets/brands/randstad.png';
import star from '../../../assets/brands/star.png';
import starPeo from '../../../assets/brands/start_people.png';
import { Autoplay } from 'swiper/modules';

const Brands = () => {
    const slides = [
        amazon,
        amaVec,
        casio,
        moonstar,
        randStad,
        star,
        starPeo,
    ];

    return (
        <Swiper
            loop={true}
            loopedSlides={slides.length}
            slidesPerView={4}
            centeredSlides={true}
            spaceBetween={30}
            grabCursor={true}
            modules={[Autoplay]}
            autoplay={{
                delay: 500,
                disableOnInteraction: false,
            }}
        >
            {slides.map((img, index) => (
                <SwiperSlide key={index}>
                    <img src={img} alt="brand" />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default Brands;
