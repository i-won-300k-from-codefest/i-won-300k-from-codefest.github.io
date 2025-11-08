import ContactDrawer from "@/components/contactDrawer";
import HamburgerMenu from "@/components/hamburgerMenu";
import { ShelterMap } from "@/components/map";

export default function Home() {
  return (
    <>
      <div className="w-full flex place-items-center justify-center h-full bg-grey-200">
        <ShelterMap />
      </div>

      <div className="absolute bottom-4 w-screen left-0">
        <div className="w-full px-8">
          <ContactDrawer />
        </div>
      </div>
      <HamburgerMenu />
    </>
  );
}
