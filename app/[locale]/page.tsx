import Nav from './../sections/nav';
import Header from '../sections/header';
import Categories from './../sections/categories';
import LimitOffer from './../sections/limit';
import Footer from './../sections/footer';
import Products from '../sections/products';
import Words from '../sections/words';
import OneWord from '../sections/oneword';

export default function Home() {
  return (
    <>
      <Nav />
      <Header />
      <Categories />
      <OneWord />
      <LimitOffer />
      <Products />
      <Words />
      <Footer />
    </>
  );
}
