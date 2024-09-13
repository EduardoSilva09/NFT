"use client";
import Link from 'next/link';
import Layout from '../components/Layout';

const IndexPage = () => (
  <Layout title="Home | Dragon NFT Collection">

    <Hero />
    <Services />
    <Team />
    <Finisher />

  </Layout>
)

export default IndexPage

/// Page Sections
const Hero = () => (<div className="relative pt-16 pb-32 flex content-center items-center justify-center"
  style={{
    minHeight: "75vh"
  }}>
  <div className="absolute top-0 w-full h-full bg-center bg-cover"
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1514922121266-75835418bbf1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
    }}>
    <span id="blackOverlay" className="w-full h-full absolute opacity-75 bg-black"></span>
  </div>
  <div className="container relative mx-auto">
    <div className="items-center flex flex-wrap">
      <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
        <div className="pr-12">
          <h1 className="text-white font-semibold text-5xl">
            Unleash the Legend: Dragon NFTs Await
          </h1>
          <p className="mt-4 text-lg text-gray-300">
            Dive into a world of mythical creatures with our exclusive Dragon NFT collection. Each NFT is a unique, hand-crafted digital dragon with its own lore and rarity. Discover the magic and become part of a legendary community.
          </p>

        </div>
      </div>

    </div>
  </div>
  <div
    className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
    style={{ height: "70px" }}
  >
    <svg
      className="absolute bottom-0 overflow-hidden"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      version="1.1"
      viewBox="0 0 2560 100"
      x="0"
      y="0"
    >
      <polygon
        className="text-gray-300 fill-current"
        points="2560 0 2560 100 0 100"
      ></polygon>
    </svg>
  </div>
</div>)

const Services = () => <section className="pb-20 bg-gray-300 -mt-24">
  <div className="container mx-auto px-4">
    <div className="flex flex-wrap">
      <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
          <div className="px-4 py-5 flex-auto">
            <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
              <img src='/award.svg' />
            </div>
            <h6 className="text-xl font-semibold">Exclusive Dragon Collection</h6>
            <p className="mt-2 mb-4 text-gray-600">
              Our collection of just 9 unique Dragon NFTs offers distinctive designs and stories, making each piece rare and collectible. With only a few available, owning one means joining an exclusive group of dragon art enthusiasts.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-4/12 px-4 text-center">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
          <div className="px-4 py-5 flex-auto">
            <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-400">
              <img src='/star.svg' />
            </div>
            <h6 className="text-xl font-semibold">
              Limited-Time Offer
            </h6>
            <p className="mt-2 mb-4 text-gray-600">
              Act now to receive exclusive bonuses with our Dragon NFTs, including unique in-game assets and early access to future releases. Don’t miss your chance to be a pioneer in our dragon universe!
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 w-full md:w-4/12 px-4 text-center">
        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
          <div className="px-4 py-5 flex-auto">
            <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-400">
              <img src='/user.svg' />
            </div>
            <h6 className="text-xl font-semibold">
              Authentic Dragon Artistry
            </h6>
            <p className="mt-2 mb-4 text-gray-600">
              Our Dragon NFTs are meticulously crafted, reflecting high-quality artistry and authenticity. We ensure transparency about our creation process and artists, so you can trust each piece is a genuine, valuable addition to your digital collection.
            </p>
          </div>
        </div>
      </div>
    </div>


    <div className="flex flex-wrap items-center mt-32">
      <div className="w-full md:w-5/12 px-4 mr-auto ml-auto">
        <h3 className="text-3xl mb-2 font-semibold leading-normal">
          And more is coming...
        </h3>
        <p className="text-lg font-light leading-relaxed mt-4 mb-4 text-gray-700">
          We're expanding the Dragon NFT universe with new designs, traits, and events. Stay tuned for updates that will add even more value and excitement to our collection.
        </p>
        <p className="text-lg font-light leading-relaxed mt-0 mb-4 text-gray-700">
          In addition, we are exploring partnerships and collaborations that will bring even more unique opportunities to our collectors. From limited-edition drops to interactive features, there’s a lot in store. Join us on this journey and be the first to experience the evolution of our Dragon NFTs!
        </p>
        <Link
          href="/mint"
          className="font-bold text-gray-800 mt-8"
        >
          Mint now your token!
        </Link>
      </div>

      <div className="w-full md:w-4/12 px-4 mr-auto ml-auto">
        <div className="relative flex flex-col min-w-0 break-words  w-full mb-6 shadow-lg rounded-lg bg-pink-600">
          <img
            alt="..."
            src="https://i.ytimg.com/vi/CVimHk8loTU/maxresdefault.jpg"
            className="w-full align-middle rounded-t-lg"
          />
          <blockquote className="relative p-8 mb-4">
            <svg
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 583 95"
              className="absolute left-0 w-full block"
              style={{
                height: "95px",
                top: "-94px"
              }}
            >
              <polygon
                points="-30,95 583,95 583,65"
                className="text-pink-600 fill-current"
              ></polygon>
            </svg>
            <h4 className="text-xl font-bold text-white">
              Top Notch Blockchain
            </h4>
            <p className="text-md font-light mt-2 text-white">
              Our Dragon NFTs are deployed on the BNB Chain, ensuring fast transactions and low fees. Experience seamless interactions and security with one of the leading blockchain platforms.
            </p>
          </blockquote>
        </div>
      </div>

    </div>
  </div>
</section>

const Team = () => <section className="pt-20 pb-48">
  <div className="container mx-auto px-4">
    <div className="flex flex-wrap justify-center text-center mb-24">
      <div className="w-full lg:w-6/12 px-4">
        <h2 className="text-4xl font-semibold">
          Meet the Creator
        </h2>
        <p className="text-lg leading-relaxed m-4 text-gray-600">
          With a passion for digital art and blockchain technology, I bring a unique blend of skills to this Dragon NFT collection. My expertise includes graphic design, smart contract development, and project management, ensuring a high-quality and seamless experience for our collectors. Dedicated to innovation and excellence, I am committed to delivering exceptional and engaging NFT experiences.
        </p>
      </div>
    </div>
    <div className="flex flex-wrap">
      <div className="w-full md:w-12/12 lg:w-12/12 lg:mb-0 mb-12 px-4">
        <div className="px-6">
          <img
            alt="..."
            src="https://avatars.githubusercontent.com/u/88010447?v=4"
            className="shadow-lg rounded-full max-w-full mx-auto"
            style={{ maxWidth: "120px" }}
          />
          <div className="pt-6 text-center">
            <h5 className="text-xl font-bold">
              Eduardo Silva
            </h5>
            <p className="mt-1 text-sm text-gray-500 uppercase font-semibold">
              Web3 Developer
            </p>
            <div className="mt-6">
              <button
                className="bg-blue-400 text-white w-10 h-10 rounded-full outline-none focus:outline-none mr-2 p-3"
                type="button"
              >
                <img src="/x.svg" />
              </button>
              <button
                className="bg-blue-600 text-white w-10 h-10 rounded-full outline-none focus:outline-none mr-2 p-3"
                type="button"
              >
                <img src="/facebook.svg" />
              </button>
              <button
                className="bg-pink-500 text-white w-10 h-10 rounded-full outline-none focus:outline-none mr-2 p-3"
                type="button"
              >
                <img src="/instagram.svg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

const Finisher = () => <>
  <section className="pb-20 relative block bg-gray-900">
    <div
      className="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20"
      style={{ height: "80px" }}
    >
      <svg
        className="absolute bottom-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        version="1.1"
        viewBox="0 0 2560 100"
        x="0"
        y="0"
      >
        <polygon
          className="text-gray-900 fill-current"
          points="2560 0 2560 100 0 100"
        ></polygon>
      </svg>
    </div>

    <div className="container mx-auto px-4 lg:pt-24 lg:pb-64">
      <div className="flex flex-wrap text-center justify-center">
        <div className="w-full lg:w-6/12 px-4">
          <h2 className="text-4xl font-semibold text-white">
            Exclusive Collection
          </h2>
          <p className="text-lg leading-relaxed mt-4 mb-4 text-gray-500">
            We have only 9 exclusive seats on our rocket, each reserved for our NFT collection avatars. Will you claim your spot?
          </p>
        </div>
      </div>
      <div className="flex flex-wrap mt-12 justify-center">
        <div className="w-full lg:w-3/12 px-4 text-center">
          <div className="text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
            <img src="/gift.svg" />
          </div>
          <h6 className="text-xl mt-5 font-semibold text-white">
            Mint First
          </h6>
          <p className="mt-2 mb-4 text-gray-500">
            Now is the perfect time to join us. Mint your NFT and be part of our journey as we grow together.
          </p>
        </div>
        <div className="w-full lg:w-3/12 px-4 text-center">
          <div className="text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
            <img src="/shopping-cart.svg" />
          </div>
          <h5 className="text-xl mt-5 font-semibold text-white">
            Sell Later
          </h5>
          <p className="mt-2 mb-4 text-gray-500">
            You're ready to fly alone? Sell your token at OpenSea, probably by higher prices.
          </p>
        </div>
        <div className="w-full lg:w-3/12 px-4 text-center">
          <div className="text-gray-900 p-3 w-12 h-12 shadow-lg rounded-full bg-white inline-flex items-center justify-center">
            <img src="/calendar.svg" />
          </div>
          <h5 className="text-xl mt-5 font-semibold text-white">
            Enjoy Forever
          </h5>
          <p className="mt-2 mb-4 text-gray-500">
            Some benefits stay forever dor all people that had our tokens.
          </p>
        </div>
      </div>
    </div>
  </section>
  <section className="pt-20 pb-48">
    <div className="container mx-auto px-4">
      <div className="flex flex-wrap justify-center text-center mb-24">
        <div className="w-full lg:w-6/12 px-4">
          <h2 className="text-4xl font-semibold">Don&apos;t wait More</h2>
          <p className="text-lg leading-relaxed m-4 text-gray-600">
            The time is running and the collection is limited. Mint one or more tokens right now and join us!
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center text-center mb-24">
        <div className="w-full lg:w-6/12 px-4">
          <a
            href="/mint"
            className="bg-black text-white font-bold py-3 px-3 rounded inline-flex items-center ml-3">Mint Now</a>
        </div>
      </div>
    </div>
  </section>
</>
