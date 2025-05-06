"use client"

import { MapPin } from "lucide-react"
import { motion } from "framer-motion"

const Locations = () => {
  const locations = [
    {
      name: "Kebun Bambu Apus",
      mapUrl: "https://maps.app.goo.gl/cyRQeGUeVQLx4xpV8",
    },
    {
      name: "Kebun Cimanggis",
      mapUrl: "https://maps.app.goo.gl/H8PnCAqSv6JwRRVX7",
    },
    {
      name: "Kebun Cikeas",
      mapUrl: "https://maps.app.goo.gl/qsJgz2yJoXkoacPu8",
    },
    {
      name: "Kebun Nero",
      mapUrl: "https://maps.app.goo.gl/Gz2NdYVhvDrAwnVx7?g_st=ic",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="locations" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-green-600">
            LOKASI KAMI
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-green-600 mx-auto"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {locations.map((location, index) => (
            <motion.div key={index} variants={item}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sMonumen%20Nasional!5e0!3m2!1sid!2sid!4v1650000000000!5m2!1sid!2sid`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={location.name}
                    className="w-full h-full"
                  ></iframe>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">{location.name}</h3>
                  </div>
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    Lihat di Google Maps
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Locations
