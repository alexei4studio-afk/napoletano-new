"use client";

import { motion } from "framer-motion";

const deliveryPartners = [
  {
    name: "Bolt Food",
    href: "https://food.bolt.eu/ro-ro/325-bucharest/p/152391-napoletano/",
    logo: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        aria-label="Bolt Food"
      >
        {/* Bolt Food lightning bolt logo */}
        <rect width="24" height="24" rx="6" fill="#34D186" />
        <path
          d="M13.5 3L6 13.5H11.5L10.5 21L18 10.5H12.5L13.5 3Z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    name: "Wolt",
    href: "https://wolt.com/ro-ro/rou/bucharest/restaurant/napoletano-6881e1f8128fa8d9f6654e08",
    logo: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        aria-label="Wolt"
      >
        {/* Wolt "W" logo */}
        <rect width="24" height="24" rx="6" fill="#009DE0" />
        <path
          d="M4 7.5L6.8 16.5L9 10.8L11.2 16.5L14 7.5L16.2 16.5L18.4 10.8L20 16.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    name: "Glovo",
    href: "https://glovoapp.com/ro/ro/bucharest/stores/napoletan-buc",
    logo: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        aria-label="Glovo"
      >
        {/* Glovo pin drop logo */}
        <rect width="24" height="24" rx="6" fill="#FFC244" />
        <circle cx="12" cy="10" r="3.5" fill="white" />
        <path
          d="M12 13.5C9 13.5 6.5 11.5 6.5 10C6.5 10 7 17 12 20C17 17 17.5 10 17.5 10C17.5 11.5 15 13.5 12 13.5Z"
          fill="white"
        />
      </svg>
    ),
  },
];

export default function DeliverySection() {
  return (
    <section className="w-full bg-black border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {/* Header */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Decorative line */}
            <span className="hidden sm:block w-16 h-px bg-zinc-700" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-light">
              Comandă online · Livrare la domiciliu
            </p>
            <span className="hidden sm:block w-16 h-px bg-zinc-700" />
          </div>

          {/* Buttons row */}
          <div className="flex flex-row items-center gap-3 sm:gap-4">
            {deliveryPartners.map((partner, i) => (
              <motion.a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="
                  group
                  flex flex-row items-center gap-2.5
                  bg-black
                  border border-zinc-800
                  hover:border-zinc-600
                  transition-colors duration-300
                  px-4 sm:px-5 py-3
                  rounded-sm
                  cursor-pointer
                  select-none
                "
                aria-label={`Comandă pe ${partner.name}`}
              >
                {/* Logo */}
                <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                  {partner.logo}
                </span>

                {/* Name */}
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors duration-300 whitespace-nowrap font-light">
                  {partner.name}
                </span>
              </motion.a>
            ))}
          </div>

          {/* Subtext */}
          <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-700 font-light">
            Disponibil zilnic · 12:00 – 23:00
          </p>
        </div>
      </div>
    </section>
  );
}
