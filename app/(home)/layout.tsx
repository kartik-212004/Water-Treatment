import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";

interface HomeLayoutType {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutType) {
  return (
    <main>
      <Header />
      {children}
      <Separator />
      <Footer />
    </main>
  );
}
