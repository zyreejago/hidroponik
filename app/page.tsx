import Hero from "@/components/hero"
import About from "@/components/about"
import Catalog from "@/components/catalog"
import HowToOrder from "@/components/how-to-order"
import WhyChooseUs from "@/components/why-choose-us"
import Partners from "@/components/partners"
import ContactForm from "@/components/contact-form"
import Locations from "@/components/locations"

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Catalog />
      <HowToOrder />
      <WhyChooseUs />
      <Partners />
      <ContactForm />
      <Locations />
    </>
  )
}
