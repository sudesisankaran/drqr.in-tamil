import ContactSection from "../ContactSection"
import EmergencyScan from "../EmergencyScan"
import Scroll from "../page-binder/Scroll"
import About from "./about"
import Hero from "./hero"
import SmartFeatures from "./SmartFeatures"

const Home = () => {
    return (
        <Scroll>
            <Hero />
            <SmartFeatures />
            <About />
            <EmergencyScan />
            <ContactSection />
        </Scroll>
    )
}

export default Home