import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards } from "swiper/modules";

export default function CardSlider() {
  return (
    <Swiper
      effect="cards"
      grabCursor={true}
      modules={[EffectCards]}
      className="mySwiper w-[240px] h-[320px]"
    >
      <SwiperSlide className="flex justify-center items-center rounded-md text-white font-bold text-xl bg-btnColor">
        Secure Notes
      </SwiperSlide>
      <SwiperSlide className="flex justify-center items-center rounded-md text-white font-bold text-xl bg-rose-700">
        More Faster
      </SwiperSlide>
      <SwiperSlide className="flex justify-center items-center rounded-md text-white font-bold text-xl bg-slate-900">
        Faster Impression
      </SwiperSlide>
      <SwiperSlide className="flex justify-center items-center rounded-md text-white font-bold text-xl bg-purple-900">
        Higher Lead Quality
      </SwiperSlide>
      <SwiperSlide className="flex justify-center text-center items-center rounded-md text-white font-bold text-xl bg-green-600">
        Higher Conversion Rate
      </SwiperSlide>
    </Swiper>
  );
}
