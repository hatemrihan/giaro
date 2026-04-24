import Nav from './../sections/nav';
import Header from '../sections/header';
import Categories from './../sections/categories';
import LimitOffer from './../sections/limit';
import Footer from './../sections/footer';
import Products from '../sections/products';
import Words from '../sections/words';

export default function Home() {
  return (
    <>
      <Nav />
      <Header />
      <Categories />
      <LimitOffer />
      <Products />
      <Words />
      <Footer />
    </>
  );
}
